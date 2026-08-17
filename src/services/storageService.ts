import { StudentProfile, StudentAnswers, SubmissionResult, AppConfig, Lesson, Question, Exam } from "../types";
import { STORAGE_KEYS, DEFAULT_CONFIG } from "../config/appConfig";
import { curriculumLessons } from "../data/curriculum";
import { sampleQuestions } from "../data/sampleQuestions";
import { DEFAULT_EXAMS } from "../data/mockExams";

export interface ActiveAttemptDraft {
  attemptId: string;
  studentName: string;
  className: string;
  lessonId: string;
  lessonTitle: string;
  semester: number;
  answers: StudentAnswers;
  flaggedQuestionIds: string[];
  currentQuestionIndex: number;
  startedAt: string;
  elapsedSeconds: number;
}

const QUESTIONS_STORAGE_KEY = "dia_li_11_questions_bank_v4";
const LESSONS_STORAGE_KEY = "dia_li_11_lessons_v4";
const EXAMS_STORAGE_KEY = "dia_li_11_exams_v4";

export const storageService = {
  // Student profile
  getStudentProfile(): StudentProfile | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENT_PROFILE);
      if (!data) return null;
      const parsed = JSON.parse(data) as Partial<StudentProfile>;
      if (!parsed.studentName || !parsed.className || !parsed.dateOfBirth) return null;
      return {
        studentName: parsed.studentName,
        className: parsed.className,
        dateOfBirth: parsed.dateOfBirth,
        classId: parsed.classId,
        teacherName: parsed.teacherName,
      };
    } catch {
      return null;
    }
  },

  saveStudentProfile(profile: StudentProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENT_PROFILE, JSON.stringify(profile));
    } catch (err) {
      console.warn("Could not save student profile to localStorage", err);
    }
  },

  clearStudentProfile(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.STUDENT_PROFILE);
    } catch {}
  },

  // Active attempt draft (recovery during network loss / page reload)
  saveActiveDraft(lessonId: string, draft: ActiveAttemptDraft): void {
    try {
      sessionStorage.setItem(`${STORAGE_KEYS.ACTIVE_ATTEMPT_PREFIX}${lessonId}`, JSON.stringify(draft));
      localStorage.setItem(`${STORAGE_KEYS.ACTIVE_ATTEMPT_PREFIX}${lessonId}`, JSON.stringify(draft));
    } catch (err) {
      console.warn("Could not save active draft", err);
    }
  },

  getActiveDraft(lessonId: string): ActiveAttemptDraft | null {
    try {
      const sessionData = sessionStorage.getItem(`${STORAGE_KEYS.ACTIVE_ATTEMPT_PREFIX}${lessonId}`);
      if (sessionData) return JSON.parse(sessionData);

      const localData = localStorage.getItem(`${STORAGE_KEYS.ACTIVE_ATTEMPT_PREFIX}${lessonId}`);
      if (localData) return JSON.parse(localData);

      return null;
    } catch {
      return null;
    }
  },

  clearActiveDraft(lessonId: string): void {
    try {
      sessionStorage.removeItem(`${STORAGE_KEYS.ACTIVE_ATTEMPT_PREFIX}${lessonId}`);
      localStorage.removeItem(`${STORAGE_KEYS.ACTIVE_ATTEMPT_PREFIX}${lessonId}`);
    } catch {}
  },

  // Local submissions cache
  getLocalSubmissions(): SubmissionResult[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOCAL_SUBMISSIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getSubmissions(): SubmissionResult[] {
    return this.getLocalSubmissions();
  },

  saveLocalSubmission(result: SubmissionResult): void {
    try {
      const list = this.getLocalSubmissions();
      const existingIdx = list.findIndex((item) => item.attemptId === result.attemptId);
      if (existingIdx >= 0) {
        list[existingIdx] = result;
      } else {
        list.unshift(result);
      }
      localStorage.setItem(STORAGE_KEYS.LOCAL_SUBMISSIONS, JSON.stringify(list));
    } catch (err) {
      console.warn("Could not save local submission", err);
    }
  },

  // Lessons data persistence
  getLessons(): Lesson[] {
    try {
      const data = localStorage.getItem(LESSONS_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return curriculumLessons;
    } catch {
      return curriculumLessons;
    }
  },

  saveLessons(lessons: Lesson[]): void {
    try {
      localStorage.setItem(LESSONS_STORAGE_KEY, JSON.stringify(lessons));
    } catch (err) {
      console.warn("Could not save lessons", err);
    }
  },

  // Questions bank data persistence
  getQuestions(): Question[] {
    try {
      const data = localStorage.getItem(QUESTIONS_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, Question>();
          sampleQuestions.forEach((q) => map.set(q.id, q));
          parsed.forEach((q: Question) => map.set(q.id, q));
          return Array.from(map.values());
        }
      }
      return sampleQuestions;
    } catch {
      return sampleQuestions;
    }
  },

  saveQuestions(questions: Question[]): void {
    try {
      localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(questions));
    } catch (err) {
      console.warn("Could not save questions", err);
    }
  },

  // Mock Exams persistence
  getExams(): Exam[] {
    try {
      const data = localStorage.getItem(EXAMS_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, Exam>();
          DEFAULT_EXAMS.forEach((e) => map.set(e.id, e));
          parsed.forEach((e: Exam) => map.set(e.id, e));
          return Array.from(map.values());
        }
      }
      return DEFAULT_EXAMS;
    } catch {
      return DEFAULT_EXAMS;
    }
  },

  saveExams(exams: Exam[]): void {
    try {
      localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(exams));
    } catch (err) {
      console.warn("Could not save exams", err);
    }
  },

  // App Config
  getAppConfig(): AppConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APP_CONFIG);
      if (!data) return DEFAULT_CONFIG;
      return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    } catch {
      return DEFAULT_CONFIG;
    }
  },

  saveAppConfig(config: AppConfig): void {
    try {
      localStorage.setItem(STORAGE_KEYS.APP_CONFIG, JSON.stringify(config));
    } catch (err) {
      console.warn("Could not save app config", err);
    }
  },

  // Admin auth token
  getAdminAuth(): boolean {
    try {
      return sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === "authenticated";
    } catch {
      return false;
    }
  },

  isAdminLoggedIn(): boolean {
    return this.getAdminAuth();
  },

  setAdminAuth(isAuth: boolean): void {
    try {
      if (isAuth) {
        sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, "authenticated");
      } else {
        sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
      }
    } catch {}
  },

  // Reset to initial seed
  resetToInitialSeed(): void {
    try {
      localStorage.setItem(LESSONS_STORAGE_KEY, JSON.stringify(curriculumLessons));
      localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(sampleQuestions));
      localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(DEFAULT_EXAMS));
      localStorage.setItem(STORAGE_KEYS.APP_CONFIG, JSON.stringify(DEFAULT_CONFIG));
    } catch (err) {
      console.warn("Could not reset seed", err);
    }
  },
};
