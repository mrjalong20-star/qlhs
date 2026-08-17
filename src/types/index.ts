export type QuestionPart = "PART_1" | "PART_2" | "PART_3";
export type QuestionType = "MULTIPLE_CHOICE" | "TRUE_FALSE_GROUP" | "SHORT_ANSWER";
export type QuestionLevel =
  | "Nhận biết"
  | "Thông hiểu"
  | "Vận dụng"
  | "Vận dụng cao"
  | "NHAN_BIET"
  | "THONG_HIEU"
  | "VAN_DUNG"
  | "VAN_DUNG_CAO";

export type KnowledgeLevel = QuestionLevel;

export interface Part2SubStatement {
  id: string; // "a", "b", "c", "d"
  statement: string;
  correctAnswer: boolean; // true = Đúng, false = Sai
  explanation?: string;
}

export type ChartType =
  | "BAR_SINGLE"
  | "BAR_GROUPED"
  | "BAR_STACKED"
  | "LINE"
  | "COMBO_BAR_LINE"
  | "PIE"
  | "PIE_MULTI"
  | "AREA";

export interface GeoChartDataset {
  label: string;
  data: number[];
  color?: string;
  type?: "bar" | "line";
  unit?: string;
  yAxisSide?: "left" | "right"; // For combo dual axis charts
}

export interface GeoChartConfig {
  type: ChartType;
  title?: string;
  subTitle?: string;
  categories: string[]; // e.g. ["2000", "2010", "2018", "2020"] or ["Dưới 15 tuổi", "15-64 tuổi", "65 tuổi trở lên"]
  datasets: GeoChartDataset[];
  leftYAxisUnit?: string; // e.g. "Nghìn tỉ USD", "Tỉ USD", "Triệu người", "Triệu km²"
  rightYAxisUnit?: string; // e.g. "%"
  source?: string;
}

export interface Question {
  id: string;
  lessonId: string;
  part: QuestionPart;
  type: QuestionType;
  level: QuestionLevel;
  questionText: string;
  dataTable?: string[][]; // 2D table data e.g. [[Header1, Header2], [Val1, Val2]]
  chart?: GeoChartConfig; // Rich Geography visual chart
  imageUrl?: string;
  source?: string;
  // Part I options
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  answer?: "A" | "B" | "C" | "D"; // For Part 1
  correctOption?: "A" | "B" | "C" | "D"; // Alias for Part 1
  // Part II 4 statements
  subAnswers?: Part2SubStatement[]; // Array of 4 statements a, b, c, d
  // Part III Short answer
  shortAnswer?: string; // e.g. "12.5" or "12,5"
  correctAnswerText?: string; // Alias for Part 3
  acceptableAnswers?: string[]; // Alternative accepted formats
  acceptedAnswers?: string[]; // Alias
  tolerance?: number; // e.g., 0.1
  unit?: string; // e.g., "%", "triệu người", "USD/người"
  formula?: string; // Explanation of formula
  explanation?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExamScoringConfig {
  totalPoints: number; // e.g. 10.0 or 100
  part1ScorePerQuestion?: number; // e.g. 0.25
  part2ScoringFormula?: {
    correct1: number; // default 0.1
    correct2: number; // default 0.25
    correct3: number; // default 0.5
    correct4: number; // default 1.0
  };
  part3ScorePerQuestion?: number; // e.g. 0.5 or 0.25
}

export interface Lesson {
  id: string; // e.g., "BAI_01", "BAI_02"
  lessonNumber: number;
  title: string;
  chapter: string;
  grade?: 6 | 7 | 8 | 9 | 10 | 11 | 12;
  semester: 1 | 2;
  isLocked?: boolean;
  isHidden?: boolean;
  openTime?: string; // ISO string
  closeTime?: string; // ISO string
  durationMinutes?: number;
  allowReview?: boolean;
  reviewMode?: "FULL" | "SCORE_ONLY" | "NONE" | "SCHEDULED";
  reviewAvailableAt?: string;
  totalPoints?: number;
  scoringConfig?: ExamScoringConfig;
}

export interface StudentAnswers {
  [questionId: string]: {
    part1Answer?: "A" | "B" | "C" | "D";
    part2Answers?: {
      a?: boolean;
      b?: boolean;
      c?: boolean;
      d?: boolean;
    };
    part3Answer?: string;
  };
}

export interface ScoredQuestionDetail {
  questionId: string;
  part: QuestionPart;
  type: QuestionType;
  isCorrect: boolean;
  earnedScore: number;
  maxScore: number;
  studentAnswerDisplay: string;
  correctAnswerDisplay: string;
  isFlagged?: boolean;
  explanation?: string;
  part2Details?: {
    a: { student?: boolean; correct: boolean; isCorrect: boolean };
    b: { student?: boolean; correct: boolean; isCorrect: boolean };
    c: { student?: boolean; correct: boolean; isCorrect: boolean };
    d: { student?: boolean; correct: boolean; isCorrect: boolean };
    correctCount: number;
  };
}

export interface SubmissionPayload {
  attemptId: string;
  studentName: string;
  className: string;
  lessonId: string;
  lessonTitle: string;
  semester: number;
  answers: StudentAnswers;
  timeSpentSeconds: number;
  startedAt: string;
  submittedAt: string;
  flaggedQuestionIds?: string[];
  deviceInfo?: string;
}

export interface SubmissionResult {
  attemptId: string;
  studentName: string;
  className: string;
  lessonId: string;
  lessonTitle: string;
  totalScore: number;
  part1Score: number;
  part2Score: number;
  part3Score: number;
  maxScore: number;
  correctQuestionsCount: number;
  totalQuestionsCount: number;
  wrongQuestionsCount: number;
  unansweredCount: number;
  timeSpentSeconds: number;
  submittedAt: string;
  attemptNumber: number;
  details: ScoredQuestionDetail[];
  wrongQuestionIds: string[];
}

export interface StudentProfile {
  studentName: string;
  className: string;
  dateOfBirth: string;
  classId?: string;
  teacherName?: string;
}

export type StudentActivity = "IDLE" | "LEARNING" | "EXAM";

export interface StudentPresence {
  sessionId: string;
  studentName: string;
  className: string;
  dateOfBirth: string;
  online: boolean;
  lastSeenAt: string;
  onlineSeconds: number;
  learningSeconds: number;
  examSeconds: number;
  examsCompleted: number;
  lastActivity: StudentActivity;
}

export interface Exam {
  id: string; // e.g., "EXAM_MIDTERM_1" or "EXAM_1723456789"
  title: string;
  description?: string;
  semester: 1 | 2;
  term: "MIDTERM_1" | "FINAL_1" | "MIDTERM_2" | "FINAL_2" | "REGULAR" | "SURVEY" | "CUSTOM" | string;
  category?: string; // e.g. "GIỮA KÌ", "CUỐI KÌ", "15 PHÚT", "1 TIẾT", "KHẢO SÁT", "TỰ LUYỆN"
  durationMinutes: number;
  totalPoints?: number; // default 10.0
  scoringConfig?: ExamScoringConfig;
  isLocked: boolean;
  openTime?: string;
  closeTime?: string;
  allowReview?: boolean;
  questionIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface QuestionStatistic {
  questionId: string;
  lessonId: string;
  part: QuestionPart;
  questionSnippet: string;
  totalAttempts: number;
  correctCount: number;
  wrongCount: number;
  accuracyRate: number; // 0 to 100
}

export interface AppConfig {
  schoolName: string;
  schoolYear: string;
  subject: string;
  grade: string;
  teacherName: string;
  googleAppsScriptUrl: string;
  adminPasswordHash?: string;
  allowInstantReview?: boolean;
  part2ScoringFormula: {
    correct1: number; // default 0.1
    correct2: number; // default 0.25
    correct3: number; // default 0.5
    correct4: number; // default 1.0
  };
}
