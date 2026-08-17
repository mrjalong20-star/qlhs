import {
  SubmissionPayload,
  SubmissionResult,
  Question,
  AppConfig,
  QuestionStatistic,
  ExamScoringConfig,
} from "../types";
import { gradeSubmission } from "./scoringService";
import { storageService } from "./storageService";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  isOfflineMode?: boolean;
}

export const apiService = {
  /**
   * Submit student answers.
   * Neon/server is the primary source of truth; Google Apps Script is a reporting sync.
   */
  async submitQuiz(
    payload: SubmissionPayload,
    questions: Question[],
    config: AppConfig,
    scoringConfig?: ExamScoringConfig,
    maxScore?: number
  ): Promise<ApiResponse<SubmissionResult>> {
    const localGraded = gradeSubmission(
      payload.answers,
      questions,
      {
        attemptId: payload.attemptId,
        studentName: payload.studentName,
        className: payload.className,
        lessonId: payload.lessonId,
        lessonTitle: payload.lessonTitle,
        timeSpentSeconds: payload.timeSpentSeconds,
        submittedAt: payload.submittedAt,
        scoringConfig,
        maxScore,
      },
      config
    );

    storageService.clearActiveDraft(payload.lessonId);

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...localGraded,
          sessionId: localStorage.getItem("geo11_student_session_id") || undefined,
          answers: payload.answers,
          questionSnapshot: questions,
          scoringConfig,
          maxScore,
          googleAppsScriptUrl: config.googleAppsScriptUrl || undefined,
        }),
      });

      const json = await response.json().catch(() => ({}));
      if (response.ok && json.success && json.data) {
        const serverResult: SubmissionResult = {
          ...localGraded,
          ...json.data,
          details: json.data.details || localGraded.details,
        };
        storageService.saveLocalSubmission(serverResult);
        return {
          success: true,
          message: json.message || "Nộp bài thành công và đã lưu trên hệ thống.",
          data: serverResult,
          isOfflineMode: false,
        };
      }

      throw new Error(json.message || `Máy chủ trả về HTTP ${response.status}`);
    } catch (err) {
      console.warn("Neon/server submission unavailable; keeping local fallback only.", err);
      storageService.saveLocalSubmission(localGraded);
      return {
        success: true,
        message: "Nộp bài đã được lưu trên thiết bị. Kết nối máy chủ để đồng bộ trực tuyến.",
        data: localGraded,
        isOfflineMode: true,
      };
    }
  },

  /**
   * Test connection to Google Apps Script Web App.
   */
  async testConnection(gasUrl: string): Promise<{ success: boolean; message: string; data?: any }> {
    if (!gasUrl || !gasUrl.startsWith("http")) {
      return { success: false, message: "URL Google Apps Script không hợp lệ." };
    }
    try {
      const target = `${gasUrl}?action=ping&t=${Date.now()}`;
      const res = await fetch(target, { mode: "cors" });
      if (!res.ok) {
        return {
          success: false,
          message: `Lỗi kết nối: HTTP ${res.status} ${res.statusText}`,
        };
      }
      const json = await res.json();
      return {
        success: json.success,
        message: json.message || "Kết nối Google Apps Script thành công!",
        data: json,
      };
    } catch {
      return {
        success: false,
        message: "Không thể kết nối đến Web App. Hãy chắc chắn bạn đã chọn quyền truy cập 'Anyone' (Bất kỳ ai) khi Deploy Apps Script.",
      };
    }
  },

  /**
   * Fetch all submissions for a lesson. Neon is primary; Google Sheets is a reporting fallback.
   */
  async getLessonSubmissions(lessonId: string, config: AppConfig): Promise<SubmissionResult[]> {
    try {
      const res = await fetch(`/api/submissions?lessonId=${encodeURIComponent(lessonId)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          if (json.data.length) return json.data;
        }
      }
    } catch {}

    if (config.googleAppsScriptUrl) {
      try {
        const url = `${config.googleAppsScriptUrl}?action=getLessonResults&lessonId=${encodeURIComponent(lessonId)}&t=${Date.now()}`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) return json.data;
        }
      } catch (err) {
        console.warn("GAS fetch error, reading local fallback", err);
      }
    }

    return storageService.getLocalSubmissions().filter((s) => s.lessonId === lessonId);
  },

  /**
   * Fetch all submissions across the system. Neon is primary.
   */
  async getAllSubmissions(_config: AppConfig): Promise<SubmissionResult[]> {
    try {
      const res = await fetch("/api/submissions");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) return json.data;
      }
    } catch {}

    return storageService.getLocalSubmissions();
  },

  /**
   * Compute question statistics from the online submission source.
   */
  async getQuestionStatistics(
    questions: Question[],
    config: AppConfig
  ): Promise<QuestionStatistic[]> {
    const allSubmissions = await this.getAllSubmissions(config);
    const statsMap: { [qId: string]: { total: number; correct: number; wrong: number } } = {};

    for (const q of questions) {
      statsMap[q.id] = { total: 0, correct: 0, wrong: 0 };
    }

    for (const sub of allSubmissions) {
      if (sub.details && Array.isArray(sub.details)) {
        for (const detail of sub.details) {
          if (!statsMap[detail.questionId]) {
            statsMap[detail.questionId] = { total: 0, correct: 0, wrong: 0 };
          }
          statsMap[detail.questionId].total++;
          if (detail.isCorrect) statsMap[detail.questionId].correct++;
          else statsMap[detail.questionId].wrong++;
        }
      }
    }

    return questions.map((q) => {
      const stat = statsMap[q.id] || { total: 0, correct: 0, wrong: 0 };
      const accuracyRate = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100 * 10) / 10 : 0;
      return {
        questionId: q.id,
        lessonId: q.lessonId,
        part: q.part,
        questionSnippet: q.questionText.length > 80 ? q.questionText.slice(0, 80) + "..." : q.questionText,
        totalAttempts: stat.total,
        correctCount: stat.correct,
        wrongCount: stat.wrong,
        accuracyRate,
      };
    });
  },
};
