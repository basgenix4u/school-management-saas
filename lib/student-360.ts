export type StudentRisk = "Low" | "Medium" | "High";

export const studentRecords = [
  {
    id: "STU-1001",
    slug: "amina-yusuf",
    name: "Amina Yusuf",
    className: "SS2 Science",
    gender: "Female",
    guardian: "Mr. Yusuf",
    guardianPhone: "+234 800 000 0001",
    status: "Active",
    fee: "Paid",
    attendance: 96,
    average: 86,
    risk: "Low" as StudentRisk,
    balance: "₦0",
    lastActivity: "Report card downloaded by guardian",
    strengths: ["Biology", "Chemistry", "Leadership"],
    interventions: ["Prepare for science competition", "Mentorship for scholarship track"],
  },
  {
    id: "STU-1002",
    slug: "daniel-okoro",
    name: "Daniel Okoro",
    className: "JSS3 Gold",
    gender: "Male",
    guardian: "Mrs. Okoro",
    guardianPhone: "+234 800 000 0002",
    status: "Active",
    fee: "Partial",
    attendance: 89,
    average: 78,
    risk: "Medium" as StudentRisk,
    balance: "₦48,000",
    lastActivity: "Partial fee payment reconciled",
    strengths: ["English", "Creative writing", "Debate"],
    interventions: ["Mathematics support class", "Guardian payment reminder"],
  },
  {
    id: "STU-1003",
    slug: "fatima-bello",
    name: "Fatima Bello",
    className: "SS1 Arts",
    gender: "Female",
    guardian: "Alh. Bello",
    guardianPhone: "+234 800 000 0003",
    status: "Active",
    fee: "Pending",
    attendance: 82,
    average: 91,
    risk: "High" as StudentRisk,
    balance: "₦135,000",
    lastActivity: "Absent twice this week",
    strengths: ["Literature", "Government", "Public speaking"],
    interventions: ["Principal attendance review", "Urgent guardian finance follow-up"],
  },
  {
    id: "STU-1004",
    slug: "victor-james",
    name: "Victor James",
    className: "Primary 5",
    gender: "Male",
    guardian: "Mrs. James",
    guardianPhone: "+234 800 000 0004",
    status: "Active",
    fee: "Paid",
    attendance: 97,
    average: 88,
    risk: "Low" as StudentRisk,
    balance: "₦0",
    lastActivity: "Perfect attendance this week",
    strengths: ["Numeracy", "Sports", "Teamwork"],
    interventions: ["Advanced reading list", "Sports club placement"],
  },
  {
    id: "STU-1005",
    slug: "zainab-musa",
    name: "Zainab Musa",
    className: "JSS1 Blue",
    gender: "Female",
    guardian: "Mrs. Musa",
    guardianPhone: "+234 800 000 0005",
    status: "Active",
    fee: "Partial",
    attendance: 91,
    average: 74,
    risk: "Medium" as StudentRisk,
    balance: "₦32,000",
    lastActivity: "Teacher added performance note",
    strengths: ["Social studies", "Art", "Collaboration"],
    interventions: ["Reading comprehension support", "Parent-teacher check-in"],
  },
];

export function getStudentBySlug(slug: string) {
  return studentRecords.find((student) => student.slug === slug || student.id.toLowerCase() === slug.toLowerCase());
}

export function getStudentSummary() {
  const total = studentRecords.length;
  const highRisk = studentRecords.filter((student) => student.risk === "High").length;
  const pendingFees = studentRecords.filter((student) => student.fee !== "Paid").length;
  const averageAttendance = Math.round(studentRecords.reduce((sum, student) => sum + student.attendance, 0) / total);
  return { total, highRisk, pendingFees, averageAttendance };
}
