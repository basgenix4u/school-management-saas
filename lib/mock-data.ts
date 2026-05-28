export const metrics = [
  { label: "Students", value: "1,248", change: "+12%", tone: "good" },
  { label: "Teachers", value: "86", change: "+4", tone: "good" },
  { label: "Fees Collected", value: "₦18.4M", change: "78%", tone: "warn" },
  { label: "Attendance", value: "94.2%", change: "+3.1%", tone: "good" },
];

export const students = [
  { id: "STU-1001", name: "Amina Yusuf", className: "SS2 Science", guardian: "Mr. Yusuf", status: "Active", fee: "Paid" },
  { id: "STU-1002", name: "Daniel Okoro", className: "JSS3 Gold", guardian: "Mrs. Okoro", status: "Active", fee: "Partial" },
  { id: "STU-1003", name: "Fatima Bello", className: "SS1 Arts", guardian: "Alh. Bello", status: "Active", fee: "Pending" },
  { id: "STU-1004", name: "Victor James", className: "Primary 5", guardian: "Mrs. James", status: "Active", fee: "Paid" },
];

export const teachers = [
  { id: "TCH-201", name: "Mrs. Grace Adams", subject: "Mathematics", classes: "JSS1, JSS2", status: "Available" },
  { id: "TCH-202", name: "Mr. Ibrahim Musa", subject: "Physics", classes: "SS1, SS2, SS3", status: "In Class" },
  { id: "TCH-203", name: "Miss Ruth Daniel", subject: "English", classes: "Primary 6, JSS1", status: "Available" },
];

export const feeInvoices = [
  { invoice: "INV-2026-001", student: "Amina Yusuf", amount: "₦145,000", status: "Paid", due: "2026-06-10" },
  { invoice: "INV-2026-002", student: "Daniel Okoro", amount: "₦120,000", status: "Partial", due: "2026-06-12" },
  { invoice: "INV-2026-003", student: "Fatima Bello", amount: "₦135,000", status: "Pending", due: "2026-06-15" },
];

export const results = [
  { student: "Amina Yusuf", className: "SS2 Science", average: "86%", position: "2nd", status: "Published" },
  { student: "Daniel Okoro", className: "JSS3 Gold", average: "78%", position: "6th", status: "Draft" },
  { student: "Fatima Bello", className: "SS1 Arts", average: "91%", position: "1st", status: "Published" },
];

export const attendance = [
  { className: "SS2 Science", present: 42, absent: 3, rate: "93%" },
  { className: "JSS3 Gold", present: 38, absent: 2, rate: "95%" },
  { className: "Primary 5", present: 29, absent: 1, rate: "97%" },
];
