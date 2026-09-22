import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Request validation for every mutation endpoint.
 *
 * One schema per operation, shared by routes and tests. Bounds are generous
 * on purpose — they exist to reject malformed and abusive payloads, not to
 * police legitimate school data.
 */

const email = z.string().trim().toLowerCase().email("Enter a valid email address.").max(254);
const shortText = (label: string, max = 120) => z.string().trim().min(1, `${label} is required.`).max(max);
const optionalText = (max = 280) => z.string().trim().max(max).optional();
const code = (label: string) => z.string().trim().min(1, `${label} is required.`).max(40);
const money = z.number({ invalid_type_error: "Amount must be a number." }).finite().min(0).max(1_000_000_000_000);

export const studentSchema = z.object({
  firstName: shortText("First name"),
  lastName: shortText("Last name"),
  admissionNo: code("Admission number"),
  className: optionalText(),
  gender: optionalText(20),
  guardianName: optionalText(),
  guardianPhone: z.string().trim().max(30).optional(),
  guardianEmail: email.optional(),
  studentEmail: email.optional(),
  riskLevel: z.enum(["Low", "Medium", "High"]).optional(),
});

export const studentUpdateSchema = studentSchema.partial();

export const studentsBulkSchema = z.object({
  students: z.array(studentSchema).min(1, "At least one student is required.").max(500, "Import at most 500 students at a time."),
});

export const attendanceSingleSchema = z.object({
  admissionNo: code("Admission number"),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
  period: z.string().trim().min(1).max(40).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD.").optional(),
  note: optionalText(),
});

export const attendanceBulkSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD.").optional(),
  period: z.string().trim().min(1).max(40).optional(),
  marks: z.array(z.object({
    admissionNo: code("Admission number"),
    status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
    note: optionalText(),
  })).min(1, "At least one mark is required.").max(500, "Submit at most 500 marks at a time."),
});

export const invoiceSchema = z.object({
  admissionNo: code("Admission number"),
  invoiceNo: code("Invoice number"),
  title: z.string().trim().max(200).optional(),
  amount: money,
  amountPaid: money.optional(),
  status: z.enum(["PENDING", "PARTIAL", "PAID", "OVERDUE"]).optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must be YYYY-MM-DD.").optional(),
  paymentProbability: z.number().finite().min(0).max(100).optional(),
});

export const resultSchema = z.object({
  admissionNo: code("Admission number"),
  subjectName: shortText("Subject", 120),
  term: shortText("Term", 40),
  session: shortText("Session", 20),
  caScore: z.number({ invalid_type_error: "CA score must be a number." }).finite().min(0).max(40),
  examScore: z.number({ invalid_type_error: "Exam score must be a number." }).finite().min(0).max(60),
  grade: z.string().trim().max(5).optional(),
  remark: optionalText(),
  status: z.enum(["DRAFT", "REVIEW", "APPROVED", "PUBLISHED"]).optional(),
  teacherComment: z.string().trim().max(2000).optional(),
  principalComment: z.string().trim().max(2000).optional(),
});

export const resultPublishSchema = z.object({
  admissionNo: code("Admission number"),
  term: shortText("Term", 40),
  session: shortText("Session", 20),
  action: z.enum(["publish", "unlock"]),
  note: optionalText(2000),
});

export const invitationSchema = z.object({
  email,
  name: z.string().trim().max(120).optional(),
  role: z.enum(["SCHOOL_OWNER", "PRINCIPAL", "TEACHER", "ACCOUNTANT", "PARENT", "STUDENT", "SUPER_ADMIN"]),
});

export const announcementSchema = z.object({
  title: shortText("Title", 200),
  body: z.string().trim().min(1, "Message is required.").max(20000),
  audience: z.string().trim().max(20).optional(),
  publish: z.boolean().optional(),
});

export const sendEmailSchema = z.object({
  announcementId: z.string().uuid("Announcement id must be a valid id.").optional(),
  subject: shortText("Subject", 200),
  body: z.string().trim().min(1, "Email body is required.").max(20000),
  recipients: z.string().trim().min(1, "At least one recipient is required.").max(20000),
});

export const organizationSchema = z.object({
  name: shortText("School name", 200),
  slug: z.string().trim().max(120).optional(),
  email: email.optional(),
  phone: z.string().trim().max(30).optional(),
  address: z.string().trim().max(500).optional(),
});

export const sessionSchema = z.object({
  name: shortText("Session", 20),
  currentTerm: shortText("Current term", 40),
  startsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Dates must be YYYY-MM-DD.").optional().or(z.literal("")),
  endsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Dates must be YYYY-MM-DD.").optional().or(z.literal("")),
});

export const classesBulkSchema = z.object({
  classes: z.array(z.object({
    name: shortText("Class name"),
    level: optionalText(),
    arm: optionalText(),
    capacity: z.number().finite().min(0).max(100000).optional(),
  })).min(1, "At least one class is required.").max(500, "Import at most 500 classes at a time."),
});

export const teachersBulkSchema = z.object({
  teachers: z.array(z.object({
    staffNo: code("Staff number"),
    name: shortText("Full name"),
    email: email.optional(),
    phone: z.string().trim().max(30).optional(),
    department: optionalText(),
    title: optionalText(),
  })).min(1, "At least one staff record is required.").max(500, "Import at most 500 staff at a time."),
});

export const feesBulkSchema = z.object({
  fees: z.array(z.object({
    name: shortText("Fee name"),
    amount: money,
    billingCycle: z.string().trim().max(20).optional(),
    required: z.boolean().optional(),
  })).min(1, "At least one fee is required.").max(200, "Import at most 200 fees at a time."),
});

export const supportTicketSchema = z.object({
  requesterEmail: email.optional(),
  requesterName: z.string().trim().max(120).optional(),
  category: z.string().trim().max(40).optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  subject: shortText("Subject", 200),
  description: z.string().trim().min(1, "Description is required.").max(20000),
  path: z.string().trim().max(500).optional(),
});

export const errorEventSchema = z.object({
  userEmail: email.optional(),
  source: z.string().trim().max(40).optional(),
  severity: z.enum(["info", "warning", "error", "critical"]).optional(),
  message: z.string().trim().min(1, "Message is required.").max(5000),
  stack: z.string().max(20000).optional(),
  path: z.string().trim().max(500).optional(),
  userAgent: z.string().max(500).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const paystackInitializeSchema = z.object({
  invoiceNo: code("Invoice number"),
  email: email.optional(),
});

export const askSchema = z.object({
  question: z.string().trim().min(3, "Ask a question of at least a few words.").max(500),
});

export const invitationAcceptSchema = z.object({
  token: z.string().trim().min(1, "Invitation token is required.").max(200),
});

/** Reads ?limit=&offset= defensively; clamping happens in pageParams. */
export function readPageParams(request: Request): { limit?: number; offset?: number } {
  const params = new URL(request.url).searchParams;
  const limit = Number(params.get("limit"));
  const offset = Number(params.get("offset"));
  return {
    limit: Number.isFinite(limit) && limit > 0 ? limit : undefined,
    offset: Number.isFinite(offset) && offset >= 0 ? offset : undefined,
  };
}

/** Uniform 400 for schema failures: first problem in plain words. */
export function invalidInputResponse(result: { error: z.ZodError }) {
  const first = result.error.issues[0];
  const where = first.path.length ? `${String(first.path[first.path.length - 1])}: ` : "";
  return NextResponse.json(
    { status: "error", code: "invalid_input", message: `${where}${first.message}` },
    { status: 400 },
  );
}
