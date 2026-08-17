import { Question } from "../types";
import { BAI_01_QUESTIONS } from "./questions/bai01";
import { BAI_02_QUESTIONS } from "./questions/bai02";
import { BAI_03_QUESTIONS } from "./questions/bai03";
import { BAI_04_QUESTIONS } from "./questions/bai04";
import { OTHER_LESSONS_QUESTIONS } from "./questions/otherLessons";

export const DEFAULT_QUESTIONS: Question[] = [
  ...BAI_01_QUESTIONS,
  ...BAI_02_QUESTIONS,
  ...BAI_03_QUESTIONS,
  ...BAI_04_QUESTIONS,
  ...OTHER_LESSONS_QUESTIONS,
];

export const sampleQuestions = DEFAULT_QUESTIONS;