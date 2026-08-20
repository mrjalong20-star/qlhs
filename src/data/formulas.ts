import { Formula } from "../types";
import { FORMULAS_GRADE_6 } from "./formulasGrade6";
import { FORMULAS_GRADE_7, FORMULAS_GRADE_8, FORMULAS_GRADE_9 } from "./formulasGrade7to9";
import { FORMULAS_GRADE_10, FORMULAS_GRADE_11, FORMULAS_GRADE_12 } from "./formulasGrade10to12";

export const ALL_SEED_FORMULAS: Formula[] = [
  ...FORMULAS_GRADE_6,
  ...FORMULAS_GRADE_7,
  ...FORMULAS_GRADE_8,
  ...FORMULAS_GRADE_9,
  ...FORMULAS_GRADE_10,
  ...FORMULAS_GRADE_11,
  ...FORMULAS_GRADE_12,
];
