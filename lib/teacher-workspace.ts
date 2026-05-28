export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export const teacherProfile = {
  id: "TCH-202",
  name: "Mr. Ibrahim Musa",
  title: "Senior Physics Teacher",
  department: "Science Department",
  todayClasses: 4,
  studentsToday: 126,
  pendingScores: 12,
  attendanceCompletion: 78,
};

export const teacherClasses = [
  {
    id: "CLS-SS2-SCI",
    name: "SS2 Science",
    subject: "Physics",
    room: "Science Lab 2",
    time: "08:00 - 08:45",
    totalStudents: 45,
    attendanceRate: 93,
    performanceAverage: 81,
    riskCount: 3,
  },
  {
    id: "CLS-SS1-SCI",
    name: "SS1 Science",
    subject: "Basic Physics",
    room: "Room B12",
    time: "09:00 - 09:45",
    totalStudents: 42,
    attendanceRate: 91,
    performanceAverage: 76,
    riskCount: 5,
  },
  {
    id: "CLS-SS3-SCI",
    name: "SS3 Science",
    subject: "Physics Practical",
    room: "Physics Lab",
    time: "11:00 - 12:20",
    totalStudents: 39,
    attendanceRate: 96,
    performanceAverage: 84,
    riskCount: 2,
  },
];

export const attendanceRegister = [
  { id: "STU-1001", name: "Amina Yusuf", className: "SS2 Science", status: "PRESENT" as AttendanceStatus, risk: "Low", lastSeen: "07:54", note: "Strong participation" },
  { id: "STU-1002", name: "Daniel Okoro", className: "SS2 Science", status: "LATE" as AttendanceStatus, risk: "Medium", lastSeen: "08:11", note: "Arrived after assembly" },
  { id: "STU-1003", name: "Fatima Bello", className: "SS2 Science", status: "ABSENT" as AttendanceStatus, risk: "High", lastSeen: "Yesterday", note: "Guardian follow-up required" },
  { id: "STU-1004", name: "Victor James", className: "SS2 Science", status: "PRESENT" as AttendanceStatus, risk: "Low", lastSeen: "07:48", note: "Perfect weekly attendance" },
  { id: "STU-1005", name: "Zainab Musa", className: "SS2 Science", status: "EXCUSED" as AttendanceStatus, risk: "Medium", lastSeen: "Medical note", note: "Excused by admin" },
  { id: "STU-1006", name: "Samuel Peter", className: "SS2 Science", status: "PRESENT" as AttendanceStatus, risk: "Low", lastSeen: "07:51", note: "Lab group leader" },
  { id: "STU-1007", name: "Mariam Ali", className: "SS2 Science", status: "PRESENT" as AttendanceStatus, risk: "Low", lastSeen: "07:55", note: "Assignment submitted" },
  { id: "STU-1008", name: "Chinedu Eze", className: "SS2 Science", status: "LATE" as AttendanceStatus, risk: "Medium", lastSeen: "08:15", note: "Second late arrival this week" },
];

export const lessonPlan = [
  { time: "08:00", title: "Starter quiz", detail: "5-question diagnostic quiz on electricity and current flow." },
  { time: "08:10", title: "Concept explanation", detail: "Explain Ohm's law using circuit simulation and real examples." },
  { time: "08:25", title: "Group lab task", detail: "Students measure resistance and voltage across two circuit setups." },
  { time: "08:40", title: "Exit ticket", detail: "Each student submits one solved problem and one question." },
];

export const attendanceHeatmap = [
  [96, 94, 91, 97, 95],
  [92, 90, 88, 94, 91],
  [98, 97, 96, 95, 96],
  [87, 89, 84, 91, 88],
  [94, 93, 95, 96, 94],
];

export const teacherInsights = [
  {
    title: "Fatima Bello requires urgent follow-up",
    detail: "High academic average but attendance dropped below risk threshold and fee status is pending.",
    action: "Notify principal and guardian",
    severity: "High",
  },
  {
    title: "Late arrivals increasing",
    detail: "Two students have repeated late arrivals in SS2 Science this week.",
    action: "Discuss during form period",
    severity: "Medium",
  },
  {
    title: "Practical lesson readiness",
    detail: "SS3 Science lab class has high attendance and strong performance for today's practical session.",
    action: "Proceed with practical assessment",
    severity: "Low",
  },
];

export function getAttendanceSummary() {
  const total = attendanceRegister.length;
  const present = attendanceRegister.filter((item) => item.status === "PRESENT").length;
  const absent = attendanceRegister.filter((item) => item.status === "ABSENT").length;
  const late = attendanceRegister.filter((item) => item.status === "LATE").length;
  const excused = attendanceRegister.filter((item) => item.status === "EXCUSED").length;
  const rate = Math.round((present / total) * 100);
  return { total, present, absent, late, excused, rate };
}
