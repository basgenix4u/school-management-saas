/**
 * Nigerian secondary grading scale.
 *
 * CA runs to 40 and exams to 60, so totals run to 100 and these bands are
 * the conventional cut-offs. Pure reference data with no school records.
 */

export const gradeScale = [
  { min: 80, grade: "A", remark: "Excellent" },
  { min: 70, grade: "B", remark: "Very Good" },
  { min: 60, grade: "C", remark: "Good" },
  { min: 50, grade: "D", remark: "Fair" },
  { min: 0, grade: "F", remark: "Needs Improvement" },
];

export function getGrade(score: number): { grade: string; remark: string } {
  return gradeScale.find((band) => score >= band.min) ?? gradeScale[gradeScale.length - 1];
}

export function getAverage(subjects: Array<{ total: number }>): number {
  if (!subjects.length) return 0;
  return Math.round(subjects.reduce((sum, subject) => sum + subject.total, 0) / subjects.length);
}
