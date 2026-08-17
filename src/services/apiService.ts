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
   * Submit student answers
   */
  async submitQuiz(
    payload: SubmissionPayload,
    questions: Question[],
    config: AppConfig,
    scoringConfig?: ExamScoringConfig,
    maxScore?: number
  ): Promise<ApiResponse<SubmissionResult>> {
    // 1. Calculate score client/fallback side
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

    // Always cache locally first to guarantee zero data loss
    storageService.saveLocalSubmission(localGraded);
    storageService.clearActiveDraft(payload.lessonId);

    // 2. If Google Apps Script URL is provided, send to Apps Script
    if (config.googleAppsScriptUrl && config.googleAppsScriptUrl.trim().startsWith("http")) {
      try {
        const gasPayload = {
          action: "SUBMIT_EXAM",
          attemptId: payload.attemptId,
          studentName: payload.studentName,
          className: payload.className,
          lessonId: payload.lessonId,
          lessonTitle: payload.lessonTitle,
          semester: payload.semester,
          timeSpentSeconds: payload.timeSpentSeconds,
          answers: payload.answers,
          questions: questions.map((q) => ({
            id: q.id,
            part: q.part,
            type: q.type,
            answer: q.answer,
            subAnswers: q.subAnswers,
            shortAnswer: q.shortAnswer,
            acceptableAnswers: q.acceptableAnswers,
            tolerance: q.tolerance,
            explanation: q.explanation,
            formula: q.formula,
          })),
        };

        // Note: Google Apps Script web apps handle POST requests
        const response = await fetch(config.googleAppsScriptUrl, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8",
          },
          body: JSON.stringify(gasPayload),
        });

        if (response.ok) {
          const resJson = await response.json();
          if (resJson.success && resJson.data) {
            // Merge with local detail view if needed
            const mergedResult: SubmissionResult = {
              ...localGraded,
              ...resJson.data,
              details: localGraded.details, // Keep rich interactive UI details
            };
            storageService.saveLocalSubmission(mergedResult);
            return {
              success: true,
              message: "Đã nộp bài thành công và đồng bộ lên Google Sheets!",
              data: mergedResult,
            };
          }
        }
      } catch (err) {
        console.warn("Could not reach Google Apps Script, falling back to server/local store", err);
      }
    }

    // 3. Sync with local express server backup
    try {
      await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...localGraded,
          sessionId: localStorage.getItem("geo11_student_session_id") || undefined,
          answers: payload.answers,
        }),
      });
    } catch (err) {
      console.warn("Local server backup unreachable, cached in browser", err);
    }

    return {
      success: true,
      message: config.googleAppsScriptUrl
        ? "Nộp bài thành công (đã lưu bộ nhớ cục bộ & máy chủ)."
        : "Nộp bài thành công! (Kết nối Google Apps Script trong phần Giáo viên để tự động ghi Sheet).",
      data: localGraded,
      isOfflineMode: !config.googleAppsScriptUrl,
    };
  },

  /**
   * Test connection to Google Apps Script Web App
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
    } catch (err: any) {
      return {
        success: false,
        message: "Không thể kết nối đến Web App. Hãy chắc chắn bạn đã chọn quyền truy cập 'Anyone' (Bất kỳ ai) khi Deploy Apps Script.",
      };
    }
  },

  /**
   * Fetch all submissions for a lesson
   */
  async getLessonSubmissions(lessonId: string, config: AppConfig): Promise<SubmissionResult[]> {
    // 1. Try Google Apps Script if present
    if (config.googleAppsScriptUrl) {
      try {
        const url = `${config.googleAppsScriptUrl}?action=getLessonResults&lessonId=${encodeURIComponent(lessonId)}&t=${Date.now()}`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            return json.data;
          }
        }
      } catch (err) {
        console.warn("GAS fetch error, reading local fallback", err);
      }
    }

    // 2. Fallback to server & local storage
    try {
      const res = await fetch(`/api/submissions?lessonId=${encodeURIComponent(lessonId)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch {}

    const locals = storageService.getLocalSubmissions();
    return locals.filter((s) => s.lessonId === lessonId);
  },

  /**
   * Fetch all submissions across system
   */
  async getAllSubmissions(config: AppConfig): Promise<SubmissionResult[]> {
    try {
      const res = await fetch("/api/submissions");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          return json.data;
        }
      }
    } catch {}

    return storageService.getLocalSubmissions();
  },

  /**
   * Compute Question Statistics
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
          if (detail.isCorrect) {
            statsMap[detail.questionId].correct++;
          } else {
            statsMap[detail.questionId].wrong++;
          }
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
