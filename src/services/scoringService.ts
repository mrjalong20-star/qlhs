import {
  Question,
  StudentAnswers,
  SubmissionResult,
  ScoredQuestionDetail,
  AppConfig,
  ExamScoringConfig,
} from "../types";
import { DEFAULT_CONFIG } from "../config/appConfig";

/**
 * Normalizes user input for numerical and text comparison:
 * - Replaces commas ',' with dots '.' for decimals (e.g., '12,5' -> '12.5')
 * - Strips extra spaces, leading/trailing whitespace
 * - Strips common unit suffixes like '%', 'USD', 'người/km2', etc. if comparing purely numeric
 */
export function normalizeAnswerString(input: string | undefined | null): string {
  if (!input) return "";
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/,/g, ".");
}

export function isNumber(val: string): boolean {
  if (!val) return false;
  const cleaned = val.replace(/[^\d.-]/g, "");
  return cleaned !== "" && !isNaN(Number(cleaned));
}

export function parseNumberValue(val: string): number | null {
  const cleaned = val.replace(/,/g, ".").replace(/[^\d.-]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

export function checkShortAnswerMatch(
  studentRaw: string | undefined,
  question: Question
): boolean {
  if (!studentRaw || !studentRaw.trim()) return false;

  const stdClean = normalizeAnswerString(studentRaw);
  const correctClean = normalizeAnswerString(question.shortAnswer);

  // 1. Direct normalized string match
  if (stdClean === correctClean) return true;

  // 2. Check acceptable list
  if (question.acceptableAnswers && question.acceptableAnswers.length > 0) {
    for (const alt of question.acceptableAnswers) {
      if (stdClean === normalizeAnswerString(alt)) {
        return true;
      }
    }
  }

  // 3. Numeric comparison with tolerance
  const studentNum = parseNumberValue(studentRaw);
  const correctNum = parseNumberValue(question.shortAnswer || "");

  if (studentNum !== null && correctNum !== null) {
    const tolerance = question.tolerance ?? 0.05;
    if (Math.abs(studentNum - correctNum) <= tolerance) {
      return true;
    }
  }

  return false;
}

/**
 * Core scoring algorithm
 */
export function gradeSubmission(
  answers: StudentAnswers,
  questions: Question[],
  metadata: {
    attemptId: string;
    studentName: string;
    className: string;
    lessonId: string;
    lessonTitle: string;
    timeSpentSeconds: number;
    attemptNumber?: number;
    submittedAt?: string;
    scoringConfig?: ExamScoringConfig;
    maxScore?: number;
  },
  config: AppConfig = DEFAULT_CONFIG
): SubmissionResult {
  const details: ScoredQuestionDetail[] = [];
  let part1Earned = 0;
  let part1Max = 0;
  let part2Earned = 0;
  let part2Max = 0;
  let part3Earned = 0;
  let part3Max = 0;

  let totalQuestionsCount = questions.length;
  let correctQuestionsCount = 0;
  let wrongQuestionsCount = 0;
  let unansweredCount = 0;
  const wrongQuestionIds: string[] = [];

  const part1Questions = questions.filter((q) => q.part === "PART_1");
  const part2Questions = questions.filter((q) => q.part === "PART_2");
  const part3Questions = questions.filter((q) => q.part === "PART_3");

  const customConfig = metadata.scoringConfig;
  const targetScale = metadata.maxScore || customConfig?.totalPoints || 10;

  // Question weights
  const part1PerQuestionWeight = customConfig?.part1ScorePerQuestion !== undefined
    ? customConfig.part1ScorePerQuestion
    : (part1Questions.length > 0 ? (part2Questions.length > 0 ? 3.0 / part1Questions.length : 10.0 / part1Questions.length) : 0);

  const part2Formula = customConfig?.part2ScoringFormula || config.part2ScoringFormula;

  const part3PerQuestionWeight = customConfig?.part3ScorePerQuestion !== undefined
    ? customConfig.part3ScorePerQuestion
    : (part3Questions.length > 0 ? 1.0 : 0);

  for (const question of questions) {
    const studentAns = answers[question.id];

    if (question.part === "PART_1") {
      const selected = studentAns?.part1Answer;
      const isAnswered = Boolean(selected);
      const isCorrect = isAnswered && selected === question.answer;
      const qWeight = part1PerQuestionWeight || 1.0;
      part1Max += qWeight;

      if (!isAnswered) {
        unansweredCount++;
        wrongQuestionIds.push(question.id);
      } else if (isCorrect) {
        part1Earned += qWeight;
        correctQuestionsCount++;
      } else {
        wrongQuestionsCount++;
        wrongQuestionIds.push(question.id);
      }

      details.push({
        questionId: question.id,
        part: "PART_1",
        type: "MULTIPLE_CHOICE",
        isCorrect,
        earnedScore: isCorrect ? qWeight : 0,
        maxScore: qWeight,
        studentAnswerDisplay: selected ? `Đáp án: ${selected}` : "(Chưa chọn)",
        correctAnswerDisplay: `Đáp án đúng: ${question.answer || "N/A"}`,
        explanation: question.explanation,
      });
    } else if (question.part === "PART_2") {
      const subAns = studentAns?.part2Answers || {};
      const subStatements = question.subAnswers || [];
      let subCorrectCount = 0;
      let anyAnswered = false;

      const subDetails: any = {
        a: { student: undefined, correct: false, isCorrect: false },
        b: { student: undefined, correct: false, isCorrect: false },
        c: { student: undefined, correct: false, isCorrect: false },
        d: { student: undefined, correct: false, isCorrect: false },
        correctCount: 0,
      };

      for (const item of subStatements) {
        const idKey = item.id as "a" | "b" | "c" | "d";
        const studentChoice = subAns[idKey];
        if (studentChoice !== undefined) anyAnswered = true;

        const isItemCorrect = studentChoice !== undefined && studentChoice === item.correctAnswer;
        if (isItemCorrect) subCorrectCount++;

        subDetails[idKey] = {
          student: studentChoice,
          correct: item.correctAnswer,
          isCorrect: isItemCorrect,
        };
      }
      subDetails.correctCount = subCorrectCount;

      // Scoring table per GDPT 2018 or custom formula
      let questionScore = 0;
      if (subCorrectCount === 1) questionScore = part2Formula.correct1;
      else if (subCorrectCount === 2) questionScore = part2Formula.correct2;
      else if (subCorrectCount === 3) questionScore = part2Formula.correct3;
      else if (subCorrectCount === 4) questionScore = part2Formula.correct4;

      part2Earned += questionScore;
      part2Max += part2Formula.correct4; // e.g. 1.0 pt

      const isFullyCorrect = subCorrectCount === 4;
      if (!anyAnswered) {
        unansweredCount++;
        wrongQuestionIds.push(question.id);
      } else if (isFullyCorrect) {
        correctQuestionsCount++;
      } else {
        wrongQuestionsCount++;
        wrongQuestionIds.push(question.id);
      }

      details.push({
        questionId: question.id,
        part: "PART_2",
        type: "TRUE_FALSE_GROUP",
        isCorrect: isFullyCorrect,
        earnedScore: questionScore,
        maxScore: part2Formula.correct4,
        studentAnswerDisplay: `Đúng ${subCorrectCount}/4 ý`,
        correctAnswerDisplay: subStatements
          .map((s) => `${s.id}) ${s.correctAnswer ? "Đúng" : "Sai"}`)
          .join(" | "),
        part2Details: subDetails,
        explanation: question.explanation,
      });
    } else if (question.part === "PART_3") {
      const rawText = studentAns?.part3Answer?.trim() || "";
      const isAnswered = rawText.length > 0;
      const isCorrect = isAnswered && checkShortAnswerMatch(rawText, question);
      const qWeight = part3PerQuestionWeight || 1.0;
      part3Max += qWeight;

      if (!isAnswered) {
        unansweredCount++;
        wrongQuestionIds.push(question.id);
      } else if (isCorrect) {
        part3Earned += qWeight;
        correctQuestionsCount++;
      } else {
        wrongQuestionsCount++;
        wrongQuestionIds.push(question.id);
      }

      details.push({
        questionId: question.id,
        part: "PART_3",
        type: "SHORT_ANSWER",
        isCorrect,
        earnedScore: isCorrect ? qWeight : 0,
        maxScore: qWeight,
        studentAnswerDisplay: rawText ? rawText : "(Chưa điền)",
        correctAnswerDisplay: `${question.shortAnswer} ${question.unit ? `(${question.unit})` : ""}`,
        explanation: question.explanation || question.formula,
      });
    }
  }

  // Calculate raw sum and scale to target scale (e.g. 10.0)
  const totalMax = part1Max + part2Max + part3Max;
  let totalScore = 0;
  if (totalMax > 0) {
    const rawEarned = part1Earned + part2Earned + part3Earned;
    totalScore = Math.round((rawEarned / totalMax) * targetScale * 100) / 100;
  }

  return {
    attemptId: metadata.attemptId,
    studentName: metadata.studentName,
    className: metadata.className,
    lessonId: metadata.lessonId,
    lessonTitle: metadata.lessonTitle,
    totalScore: Math.min(targetScale, Math.max(0, totalScore)),
    part1Score: Math.round(part1Earned * 100) / 100,
    part2Score: Math.round(part2Earned * 100) / 100,
    part3Score: Math.round(part3Earned * 100) / 100,
    maxScore: targetScale,
    correctQuestionsCount,
    totalQuestionsCount,
    wrongQuestionsCount,
    unansweredCount,
    timeSpentSeconds: metadata.timeSpentSeconds,
    submittedAt: metadata.submittedAt || new Date().toISOString(),
    attemptNumber: metadata.attemptNumber || 1,
    details,
    wrongQuestionIds,
  };
}

/**
 * Generate unique attemptId formatted as: CLASS-LESSON-YYYYMMDD-RANDOM5
 * Example: 11B1-BAI01-20260815-A8F92
 */
export function generateAttemptId(className: string, lessonId: string): string {
  const cleanClass = className.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() || "11A1";
  const cleanLesson = lessonId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() || "BAI01";
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${cleanClass}-${cleanLesson}-${dateStr}-${randomHex}`;
}
