export type ResultStatus = "DRAFT" | "REVIEW" | "APPROVED" | "PUBLISHED";

export const gradeScale = [
  { min: 80, grade: "A", remark: "Excellent", color: "emerald" },
  { min: 70, grade: "B", remark: "Very Good", color: "blue" },
  { min: 60, grade: "C", remark: "Good", color: "amber" },
  { min: 50, grade: "D", remark: "Fair", color: "amber" },
  { min: 0, grade: "F", remark: "Needs Improvement", color: "rose" },
];

export const resultStudents = [
  {
    id: "STU-1001",
    slug: "amina-yusuf",
    name: "Amina Yusuf",
    className: "SS2 Science",
    term: "Second Term",
    session: "2025/2026",
    attendance: 96,
    position: "2nd",
    status: "APPROVED" as ResultStatus,
    teacherComment: "Amina shows strong scientific reasoning and leadership. She should continue improving speed in calculations.",
    principalComment: "Excellent performance. Keep up the discipline and academic focus.",
    subjects: [
      { name: "Mathematics", ca: 28, exam: 54, total: 82, teacher: "Mrs. Grace Adams" },
      { name: "English", ca: 26, exam: 50, total: 76, teacher: "Miss Ruth Daniel" },
      { name: "Physics", ca: 30, exam: 58, total: 88, teacher: "Mr. Ibrahim Musa" },
      { name: "Chemistry", ca: 29, exam: 57, total: 86, teacher: "Dr. Okafor" },
      { name: "Biology", ca: 31, exam: 59, total: 90, teacher: "Mrs. Bello" },
    ],
  },
  {
    id: "STU-1002",
    slug: "daniel-okoro",
    name: "Daniel Okoro",
    className: "JSS3 Gold",
    term: "Second Term",
    session: "2025/2026",
    attendance: 89,
    position: "6th",
    status: "REVIEW" as ResultStatus,
    teacherComment: "Daniel is creative and expressive. Mathematics support is recommended for next term.",
    principalComment: "Good effort. Improve consistency and punctuality.",
    subjects: [
      { name: "Mathematics", ca: 20, exam: 43, total: 63, teacher: "Mrs. Grace Adams" },
      { name: "English", ca: 30, exam: 55, total: 85, teacher: "Miss Ruth Daniel" },
      { name: "Basic Science", ca: 24, exam: 49, total: 73, teacher: "Mr. Ibrahim Musa" },
      { name: "Social Studies", ca: 27, exam: 52, total: 79, teacher: "Mr. Bala" },
      { name: "Computer Studies", ca: 29, exam: 54, total: 83, teacher: "Mrs. Ade" },
    ],
  },
  {
    id: "STU-1003",
    slug: "fatima-bello",
    name: "Fatima Bello",
    className: "SS1 Arts",
    term: "Second Term",
    session: "2025/2026",
    attendance: 82,
    position: "1st",
    status: "DRAFT" as ResultStatus,
    teacherComment: "Fatima is academically excellent but attendance must improve immediately.",
    principalComment: "Outstanding academic result. Attendance intervention required.",
    subjects: [
      { name: "Literature", ca: 32, exam: 60, total: 92, teacher: "Mr. James" },
      { name: "Government", ca: 31, exam: 58, total: 89, teacher: "Mrs. Victor" },
      { name: "English", ca: 29, exam: 56, total: 85, teacher: "Miss Ruth Daniel" },
      { name: "History", ca: 30, exam: 57, total: 87, teacher: "Mr. Bala" },
      { name: "Economics", ca: 28, exam: 54, total: 82, teacher: "Mrs. Ade" },
    ],
  },
];

export const resultInsights = [
  { title: "High performer with attendance risk", detail: "Fatima Bello ranks 1st but attendance is below 85%. Principal intervention recommended before publication.", severity: "High", action: "Create attendance intervention" },
  { title: "Mathematics support required", detail: "JSS3 Gold has a lower Mathematics class average than other core subjects.", severity: "Medium", action: "Schedule support class" },
  { title: "Science performance is strong", detail: "SS2 Science shows excellent performance in Physics, Chemistry and Biology.", severity: "Low", action: "Prepare competition shortlist" },
];

export const subjectAverages = [
  { subject: "Mathematics", average: 72 },
  { subject: "English", average: 82 },
  { subject: "Physics", average: 84 },
  { subject: "Chemistry", average: 83 },
  { subject: "Biology", average: 88 },
  { subject: "Literature", average: 92 },
];

export const approvalSteps = [
  { title: "Teacher Entry", status: "Completed", description: "Subject teachers enter CA and exam scores." },
  { title: "Class Teacher Review", status: "Completed", description: "Class teacher checks comments, attendance and totals." },
  { title: "Principal Approval", status: "In progress", description: "Principal approves results before parent release." },
  { title: "Parent Publishing", status: "Pending", description: "Parents and students receive report card access." },
];

export function getGrade(score: number) {
  return gradeScale.find((grade) => score >= grade.min) ?? gradeScale[gradeScale.length - 1];
}

export function getStudentResult(slug: string) {
  return resultStudents.find((student) => student.slug === slug || student.id.toLowerCase() === slug.toLowerCase());
}

export function getAverage(subjects: { total: number }[]) {
  return Math.round(subjects.reduce((sum, subject) => sum + subject.total, 0) / subjects.length);
}

export function getResultSummary() {
  const total = resultStudents.length;
  const approved = resultStudents.filter((student) => student.status === "APPROVED").length;
  const review = resultStudents.filter((student) => student.status === "REVIEW").length;
  const draft = resultStudents.filter((student) => student.status === "DRAFT").length;
  const average = Math.round(resultStudents.reduce((sum, student) => sum + getAverage(student.subjects), 0) / total);
  return { total, approved, review, draft, average };
}
