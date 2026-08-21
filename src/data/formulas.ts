import { Formula } from "../types";
import { SEED_FORMULAS_GRADE_6 } from "./formulasGrade6";
import { SEED_FORMULAS_GRADE_7_TO_9 } from "./formulasGrade7to9";
import { SEED_FORMULAS_GRADE_10_TO_12 } from "./formulasGrade10to12";

export const SEED_FORMULAS: Formula[] = [
  ...SEED_FORMULAS_GRADE_6,
  ...SEED_FORMULAS_GRADE_7_TO_9,
  ...SEED_FORMULAS_GRADE_10_TO_12,
];

// Alias for backward compatibility
export const ALL_SEED_FORMULAS = SEED_FORMULAS;
