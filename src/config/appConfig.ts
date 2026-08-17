import { AppConfig } from "../types";

export const DEFAULT_CONFIG: AppConfig = {
  schoolName: "",
  schoolYear: "2026–2027",
  subject: "Toán THCS & THPT",
  grade: "6-12",
  teacherName: "Tổ Toán",
  // Google Apps Script URL placeholder - teacher will paste their deployed web app URL
  googleAppsScriptUrl: "",
  // Default scoring rules for Part 2 True/False (GDPT 2018 standard)
  part2ScoringFormula: {
    correct1: 0.1,
    correct2: 0.25,
    correct3: 0.5,
    correct4: 1.0,
  },
};

export const STORAGE_KEYS = {
  STUDENT_PROFILE: "math_student_profile",
  APP_CONFIG: "math_app_config",
  ACTIVE_ATTEMPT_PREFIX: "math_attempt_",
  LOCAL_SUBMISSIONS: "math_local_submissions",
  QUESTION_BANK_CUSTOM: "math_question_bank_custom",
  LESSON_OVERRIDES: "math_lesson_overrides",
  ADMIN_AUTH: "math_admin_auth",
};

export const CLASS_OPTIONS = [
  "6A1",
  "6A2",
  "7A1",
  "7A2",
  "8A1",
  "8A2",
  "9A1",
  "9A2",
  "10A1",
  "10A2",
  "11A1",
  "11A2",
  "12A1",
  "12A2",
];

export const GRADE_OPTIONS = [6, 7, 8, 9, 10, 11, 12] as const;