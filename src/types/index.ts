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

export interface Part2SubStatement { id: string; statement: string; correctAnswer: boolean; explanation?: string; }
export type ChartType = "BAR_SINGLE" | "BAR_GROUPED" | "BAR_STACKED" | "LINE" | "COMBO_BAR_LINE" | "PIE" | "PIE_MULTI" | "AREA";
export interface GeoChartDataset { label: string; data: number[]; color?: string; type?: "bar" | "line"; unit?: string; yAxisSide?: "left" | "right"; }
export interface GeoChartConfig { type: ChartType; title?: string; subTitle?: string; categories: string[]; datasets: GeoChartDataset[]; leftYAxisUnit?: string; rightYAxisUnit?: string; source?: string; }
export type Grade = 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface Question {
  id: string; lessonId: string; grade?: Grade; part: QuestionPart; type: QuestionType; level: QuestionLevel; questionText: string;
  dataTable?: string[][]; chart?: GeoChartConfig; imageUrl?: string; source?: string;
  optionA?: string; optionB?: string; optionC?: string; optionD?: string; answer?: "A" | "B" | "C" | "D"; correctOption?: "A" | "B" | "C" | "D";
  subAnswers?: Part2SubStatement[]; shortAnswer?: string; correctAnswerText?: string; acceptableAnswers?: string[]; acceptedAnswers?: string[];
  tolerance?: number; unit?: string; formula?: string; explanation?: string; createdAt?: string; updatedAt?: string;
}

export interface ExamScoringConfig { totalPoints: number; part1ScorePerQuestion?: number; part2ScoringFormula?: { correct1: number; correct2: number; correct3: number; correct4: number; }; part3ScorePerQuestion?: number; }
export interface Lesson {
  id: string; lessonNumber: number; title: string; chapter: string; grade?: Grade; semester: 1 | 2;
  isLocked?: boolean; isHidden?: boolean; openTime?: string; closeTime?: string; durationMinutes?: number; allowReview?: boolean;
  reviewMode?: "FULL" | "SCORE_ONLY" | "NONE" | "SCHEDULED"; reviewAvailableAt?: string; totalPoints?: number; scoringConfig?: ExamScoringConfig;
}

export interface StudentAnswers { [questionId: string]: { part1Answer?: "A" | "B" | "C" | "D"; part2Answers?: { a?: boolean; b?: boolean; c?: boolean; d?: boolean; }; part3Answer?: string; }; }
export interface ScoredQuestionDetail { questionId: string; part: QuestionPart; type: QuestionType; isCorrect: boolean; earnedScore: number; maxScore: number; studentAnswerDisplay: string; correctAnswerDisplay: string; isFlagged?: boolean; explanation?: string; part2Details?: { a: { student?: boolean; correct: boolean; isCorrect: boolean }; b: { student?: boolean; correct: boolean; isCorrect: boolean }; c: { student?: boolean; correct: boolean; isCorrect: boolean }; d: { student?: boolean; correct: boolean; isCorrect: boolean }; correctCount: number; }; }
export interface SubmissionPayload { attemptId: string; studentName: string; className: string; lessonId: string; lessonTitle: string; semester: number; answers: StudentAnswers; timeSpentSeconds: number; startedAt: string; submittedAt: string; flaggedQuestionIds?: string[]; deviceInfo?: string; }
export interface SubmissionResult { attemptId: string; studentName: string; className: string; lessonId: string; lessonTitle: string; totalScore: number; part1Score: number; part2Score: number; part3Score: number; maxScore: number; correctQuestionsCount: number; totalQuestionsCount: number; wrongQuestionsCount: number; unansweredCount: number; timeSpentSeconds: number; submittedAt: string; attemptNumber: number; details: ScoredQuestionDetail[]; wrongQuestionIds: string[]; }
export interface StudentProfile { studentName: string; className: string; dateOfBirth: string; classId?: string; teacherName?: string; grade?: Grade; }
export type StudentActivity = "IDLE" | "LEARNING" | "EXAM";
export interface StudentPresence { sessionId: string; studentName: string; className: string; dateOfBirth: string; grade?: Grade; online: boolean; lastSeenAt: string; onlineSeconds: number; learningSeconds: number; examSeconds: number; examsCompleted: number; lastActivity: StudentActivity; }
export interface Exam { id: string; title: string; description?: string; grade?: Grade; semester: 1 | 2; term: "MIDTERM_1" | "FINAL_1" | "MIDTERM_2" | "FINAL_2" | "REGULAR" | "SURVEY" | "CUSTOM" | string; category?: string; durationMinutes: number; totalPoints?: number; scoringConfig?: ExamScoringConfig; isLocked: boolean; openTime?: string; closeTime?: string; allowReview?: boolean; questionIds: string[]; createdAt?: string; updatedAt?: string; }
export interface QuestionStatistic { questionId: string; lessonId: string; part: QuestionPart; questionSnippet: string; totalAttempts: number; correctCount: number; wrongCount: number; accuracyRate: number; }
export interface Formula { id: string; grade: Grade; chapter: string; topic?: string; title: string; formula: string; explanation?: string; example?: string; imageUrl?: string; order?: number; published?: boolean; createdAt?: string; updatedAt?: string; }
export interface AppConfig { schoolName: string; schoolYear: string; subject: string; grade: string; teacherName: string; googleAppsScriptUrl: string; adminPasswordHash?: string; allowInstantReview?: boolean; part2ScoringFormula: { correct1: number; correct2: number; correct3: number; correct4: number; }; }
