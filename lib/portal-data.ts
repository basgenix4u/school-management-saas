export const parentProfile = {
  name: "Mrs. Yusuf",
  email: "parent.yusuf@example.com",
  phone: "+234 800 000 0001",
  children: [
    {
      id: "STU-1001",
      slug: "amina-yusuf",
      name: "Amina Yusuf",
      className: "SS2 Science",
      avatar: "AY",
      attendance: 96,
      average: 86,
      feeBalance: 0,
      risk: "Low",
      latestResult: "Approved",
      nextClass: "Physics Practical",
    },
    {
      id: "STU-1009",
      slug: "umar-yusuf",
      name: "Umar Yusuf",
      className: "Primary 4",
      avatar: "UY",
      attendance: 92,
      average: 79,
      feeBalance: 36000,
      risk: "Medium",
      latestResult: "In Review",
      nextClass: "Mathematics",
    },
  ],
};

export const parentInvoices = [
  { id: "INV-2026-001", child: "Amina Yusuf", title: "Second Term Fees", amount: 145000, paid: 145000, status: "Paid", due: "2026-06-10" },
  { id: "INV-2026-009", child: "Umar Yusuf", title: "Second Term Fees", amount: 90000, paid: 54000, status: "Partial", due: "2026-06-18" },
];

export const parentMessages = [
  { id: "MSG-001", from: "Principal Office", title: "Mid-term academic review", body: "Amina has been shortlisted for the science excellence program.", time: "Today" },
  { id: "MSG-002", from: "Accounts Department", title: "Fee balance reminder", body: "Umar has a remaining balance of ₦36,000 for the current term.", time: "Yesterday" },
  { id: "MSG-003", from: "Class Teacher", title: "Attendance update", body: "Both children have maintained strong attendance this week.", time: "2 days ago" },
];

export const parentAnnouncements = [
  { title: "Open Day scheduled", body: "Parents are invited for Open Day next Friday from 10AM.", tag: "Event" },
  { title: "Result publication", body: "Approved second term results are being released in batches.", tag: "Academics" },
  { title: "Transport update", body: "School bus route 3 will leave 15 minutes earlier next week.", tag: "Transport" },
];

export const studentProfile = {
  id: "STU-1001",
  name: "Amina Yusuf",
  className: "SS2 Science",
  level: "Senior Secondary",
  attendance: 96,
  average: 86,
  rank: "2nd",
  points: 1840,
  streak: 12,
};

export const studentSubjects = [
  { subject: "Physics", score: 88, grade: "A", teacher: "Mr. Ibrahim Musa", trend: "+6" },
  { subject: "Chemistry", score: 86, grade: "A", teacher: "Dr. Okafor", trend: "+4" },
  { subject: "Biology", score: 90, grade: "A", teacher: "Mrs. Bello", trend: "+8" },
  { subject: "Mathematics", score: 82, grade: "A", teacher: "Mrs. Grace Adams", trend: "+3" },
  { subject: "English", score: 76, grade: "B", teacher: "Miss Ruth Daniel", trend: "+2" },
];

export const studentTasks = [
  { title: "Physics lab report", subject: "Physics", due: "Tomorrow", status: "Pending" },
  { title: "Mathematics revision set", subject: "Mathematics", due: "Friday", status: "In progress" },
  { title: "Biology diagram practice", subject: "Biology", due: "Next week", status: "Not started" },
];

export const studentTimeline = [
  { time: "07:55", title: "Attendance marked", body: "You were marked present for morning attendance." },
  { time: "08:45", title: "Physics class", body: "Lab practical on Ohm's law completed." },
  { time: "10:30", title: "Result update", body: "Chemistry score has been approved by subject teacher." },
  { time: "13:20", title: "Teacher note", body: "Excellent participation in group lab activity." },
];

export function money(value: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);
}
