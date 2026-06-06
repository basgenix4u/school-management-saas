import { createServerSupabaseClient, hasSupabaseConfig } from "@/lib/supabase/server";

export const DEFAULT_ORG_SLUG = "your-school";

type SupabaseClient = ReturnType<typeof createServerSupabaseClient>;

type OrganizationRow = { id: string; name: string; slug: string };
type ClassroomRow = { id: string; name: string; organization_id: string };
type StudentRow = {
  id: string;
  organization_id: string;
  classroom_id: string | null;
  admission_no: string;
  first_name: string;
  last_name: string;
  gender: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  guardian_email: string | null;
  student_email: string | null;
  risk_level: string;
  status: string;
  active: boolean;
};

type StudentViewRow = {
  id: string;
  admission_no: string;
  student_name: string;
  classroom: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  risk_level: string | null;
  attendance_records: number | null;
  invoices: number | null;
  balance: string | number | null;
};

type InvoiceRow = {
  id: string;
  invoice_no: string;
  title: string;
  amount: string | number;
  amount_paid: string | number;
  status: string;
  due_date: string | null;
  payment_probability: number;
  student_id: string;
  organization_id: string;
};

type SubjectRow = { id: string; name: string; organization_id: string; classroom_id: string | null };

type ResultRow = {
  id: string;
  student_id: string;
  subject_id: string;
  term: string;
  session: string;
  ca_score: string | number;
  exam_score: string | number;
  total_score: string | number;
  grade: string | null;
  remark: string | null;
  status: string;
  teacher_comment: string | null;
  principal_comment: string | null;
};

export type StudentCreateInput = {
  firstName: string;
  lastName: string;
  admissionNo: string;
  className?: string;
  gender?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  studentEmail?: string;
  riskLevel?: string;
};

export type AttendanceCreateInput = {
  admissionNo: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  period?: string;
  date?: string;
  note?: string;
};

export type InvoiceCreateInput = {
  admissionNo: string;
  invoiceNo: string;
  title?: string;
  amount: number;
  amountPaid?: number;
  status?: "PENDING" | "PARTIAL" | "PAID" | "OVERDUE";
  dueDate?: string;
  paymentProbability?: number;
};

export type ResultUpsertInput = {
  admissionNo: string;
  subjectName: string;
  term: string;
  session: string;
  caScore: number;
  examScore: number;
  grade?: string;
  remark?: string;
  status?: "DRAFT" | "REVIEW" | "APPROVED" | "PUBLISHED";
  teacherComment?: string;
  principalComment?: string;
};

export function configuredOrNull() {
  if (!hasSupabaseConfig()) return null;
  return createServerSupabaseClient();
}

export async function getOrganization(client: SupabaseClient, slug = DEFAULT_ORG_SLUG) {
  const { data, error } = await client.from("organizations").select("id,name,slug").eq("slug", slug).single<OrganizationRow>();
  if (error) throw error;
  return data;
}

export async function getClassroomByName(client: SupabaseClient, organizationId: string, className?: string) {
  if (!className) return null;
  const { data, error } = await client
    .from("classrooms")
    .select("id,name,organization_id")
    .eq("organization_id", organizationId)
    .eq("name", className)
    .maybeSingle<ClassroomRow>();
  if (error) throw error;
  return data;
}

export async function getStudentByAdmission(client: SupabaseClient, organizationId: string, admissionNo: string) {
  const { data, error } = await client
    .from("students")
    .select("id,organization_id,classroom_id,admission_no,first_name,last_name,gender,guardian_name,guardian_phone,guardian_email,student_email,risk_level,status,active")
    .eq("organization_id", organizationId)
    .eq("admission_no", admissionNo)
    .maybeSingle<StudentRow>();
  if (error) throw error;
  return data;
}

export async function listLiveStudents(client: SupabaseClient) {
  const { data, error } = await client
    .from("v_student_360")
    .select("id,admission_no,student_name,classroom,guardian_name,guardian_phone,risk_level,attendance_records,invoices,balance")
    .order("student_name", { ascending: true })
    .returns<StudentViewRow[]>();
  if (error) throw error;
  const students = data ?? [];
  return {
    summary: {
      total: students.length,
      highRisk: students.filter((student) => student.risk_level === "High").length,
      withBalance: students.filter((student) => Number(student.balance ?? 0) > 0).length,
    },
    data: students,
  };
}

export async function createLiveStudent(client: SupabaseClient, input: StudentCreateInput) {
  const organization = await getOrganizationForWrite(client);
  const classroom = await getClassroomByName(client, organization.id, input.className);
  const payload = {
    organization_id: organization.id,
    classroom_id: classroom?.id ?? null,
    admission_no: input.admissionNo,
    first_name: input.firstName,
    last_name: input.lastName,
    gender: input.gender ?? null,
    guardian_name: input.guardianName ?? null,
    guardian_phone: input.guardianPhone ?? null,
    guardian_email: input.guardianEmail ?? null,
    student_email: input.studentEmail ?? null,
    risk_level: input.riskLevel ?? "Low",
  };
  const { data, error } = await client.from("students").upsert(payload, { onConflict: "organization_id,admission_no" }).select("*").single<StudentRow>();
  if (error) throw error;
  await linkExistingUsersForStudent(client, data).catch(() => []);
  return data;
}

export async function updateLiveStudent(client: SupabaseClient, admissionNo: string, changes: Partial<StudentCreateInput>) {
  const organization = await getOrganizationForWrite(client);
  const classroom = await getClassroomByName(client, organization.id, changes.className);
  const payload: Record<string, string | null> = {};
  if (changes.firstName) payload.first_name = changes.firstName;
  if (changes.lastName) payload.last_name = changes.lastName;
  if (changes.gender !== undefined) payload.gender = changes.gender ?? null;
  if (changes.guardianName !== undefined) payload.guardian_name = changes.guardianName ?? null;
  if (changes.guardianPhone !== undefined) payload.guardian_phone = changes.guardianPhone ?? null;
  if (changes.guardianEmail !== undefined) payload.guardian_email = changes.guardianEmail ?? null;
  if (changes.studentEmail !== undefined) payload.student_email = changes.studentEmail ?? null;
  if (changes.riskLevel !== undefined) payload.risk_level = changes.riskLevel ?? "Low";
  if (classroom) payload.classroom_id = classroom.id;

  const { data, error } = await client
    .from("students")
    .update(payload)
    .eq("organization_id", organization.id)
    .eq("admission_no", admissionNo)
    .select("*")
    .single<StudentRow>();
  if (error) throw error;
  return data;
}

export async function listLiveAttendance(client: SupabaseClient) {
  const { data, error } = await client
    .from("attendance_records")
    .select("id,attendance_date,period,status,note,students(admission_no,first_name,last_name),classrooms(name)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function createLiveAttendance(client: SupabaseClient, input: AttendanceCreateInput) {
  const organization = await getOrganizationForWrite(client);
  const student = await getStudentByAdmission(client, organization.id, input.admissionNo);
  if (!student) throw new Error(`Student ${input.admissionNo} not found`);
  const payload = {
    organization_id: organization.id,
    student_id: student.id,
    classroom_id: student.classroom_id,
    attendance_date: input.date ?? new Date().toISOString().slice(0, 10),
    period: input.period ?? "Morning",
    status: input.status,
    note: input.note ?? null,
  };
  const { data, error } = await client.from("attendance_records").upsert(payload, { onConflict: "student_id,attendance_date,period" }).select("*").single();
  if (error) throw error;
  return data;
}

export async function listLiveInvoices(client: SupabaseClient) {
  const { data, error } = await client
    .from("invoices")
    .select("id,organization_id,invoice_no,title,amount,amount_paid,status,due_date,payment_probability,student_id,students(admission_no,first_name,last_name,guardian_name,guardian_email,student_email)")
    .order("created_at", { ascending: false })
    .returns<Array<InvoiceRow & { students: Record<string, unknown> | null }>>();
  if (error) throw error;
  return data ?? [];
}

export async function getLiveInvoice(client: SupabaseClient, invoiceNo: string) {
  const { data, error } = await client
    .from("invoices")
    .select("id,organization_id,invoice_no,title,amount,amount_paid,status,due_date,payment_probability,student_id,students(admission_no,first_name,last_name,guardian_name,guardian_email,student_email)")
    .eq("invoice_no", invoiceNo)
    .maybeSingle<InvoiceRow & { students: Record<string, unknown> | null }>();
  if (error) throw error;
  return data;
}

export async function createLiveInvoice(client: SupabaseClient, input: InvoiceCreateInput) {
  const organization = await getOrganizationForWrite(client);
  const student = await getStudentByAdmission(client, organization.id, input.admissionNo);
  if (!student) throw new Error(`Student ${input.admissionNo} not found`);
  const payload = {
    organization_id: organization.id,
    student_id: student.id,
    invoice_no: input.invoiceNo,
    title: input.title ?? "School Fees",
    amount: input.amount,
    amount_paid: input.amountPaid ?? 0,
    status: input.status ?? "PENDING",
    due_date: input.dueDate ?? null,
    payment_probability: input.paymentProbability ?? 50,
  };
  const { data, error } = await client.from("invoices").insert(payload).select("*").single<InvoiceRow>();
  if (error) throw error;
  return data;
}

export async function getOrCreateSubject(client: SupabaseClient, organizationId: string, subjectName: string) {
  const { data: existing, error: findError } = await client
    .from("subjects")
    .select("id,name,organization_id,classroom_id")
    .eq("organization_id", organizationId)
    .eq("name", subjectName)
    .maybeSingle<SubjectRow>();
  if (findError) throw findError;
  if (existing) return existing;

  const { data, error } = await client
    .from("subjects")
    .insert({ organization_id: organizationId, name: subjectName })
    .select("id,name,organization_id,classroom_id")
    .single<SubjectRow>();
  if (error) throw error;
  return data;
}

export async function listLiveResults(client: SupabaseClient) {
  const { data, error } = await client
    .from("results")
    .select("id,student_id,subject_id,term,session,ca_score,exam_score,total_score,grade,remark,status,teacher_comment,principal_comment,students(admission_no,first_name,last_name),subjects(name)")
    .order("created_at", { ascending: false })
    .returns<Array<ResultRow & { students: Record<string, unknown> | null; subjects: Record<string, unknown> | null }>>();
  if (error) throw error;
  return data ?? [];
}

export async function getLiveResultByStudent(client: SupabaseClient, admissionNo: string) {
  const organization = await getOrganizationForWrite(client);
  const student = await getStudentByAdmission(client, organization.id, admissionNo);
  if (!student) return null;
  const { data, error } = await client
    .from("results")
    .select("id,student_id,subject_id,term,session,ca_score,exam_score,total_score,grade,remark,status,teacher_comment,principal_comment,subjects(name)")
    .eq("student_id", student.id)
    .returns<Array<ResultRow & { subjects: Record<string, unknown> | null }>>();
  if (error) throw error;
  return { student, results: data ?? [] };
}

export async function upsertLiveResult(client: SupabaseClient, input: ResultUpsertInput) {
  const organization = await getOrganizationForWrite(client);
  const student = await getStudentByAdmission(client, organization.id, input.admissionNo);
  if (!student) throw new Error(`Student ${input.admissionNo} not found`);
  const subject = await getOrCreateSubject(client, organization.id, input.subjectName);
  const total = input.caScore + input.examScore;
  const payload = {
    organization_id: organization.id,
    student_id: student.id,
    subject_id: subject.id,
    term: input.term,
    session: input.session,
    ca_score: input.caScore,
    exam_score: input.examScore,
    grade: input.grade ?? calculateGrade(total),
    remark: input.remark ?? calculateRemark(total),
    status: input.status ?? "DRAFT",
    teacher_comment: input.teacherComment ?? null,
    principal_comment: input.principalComment ?? null,
  };
  const { data, error } = await client
    .from("results")
    .upsert(payload, { onConflict: "student_id,subject_id,term,session" })
    .select("*")
    .single<ResultRow>();
  if (error) throw error;
  return data;
}

function calculateGrade(score: number) {
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}

function calculateRemark(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Very Good";
  if (score >= 60) return "Good";
  if (score >= 50) return "Fair";
  return "Needs Improvement";
}

export type OrganizationSetupInput = {
  name: string;
  slug?: string;
  email?: string;
  phone?: string;
  address?: string;
};

export type AcademicSessionInput = {
  name: string;
  currentTerm: string;
  startsOn?: string;
  endsOn?: string;
};

export type ClassroomSetupInput = {
  name: string;
  level?: string;
  arm?: string;
  capacity?: number;
};

export type TeacherSetupInput = {
  staffNo: string;
  name: string;
  email?: string;
  phone?: string;
  department?: string;
  title?: string;
};

export type FeeCategoryInput = {
  name: string;
  amount: number;
  billingCycle?: string;
  required?: boolean;
};


function relationName(value: unknown) {
  if (!value) return null;
  if (Array.isArray(value)) return String((value[0] as Record<string, unknown> | undefined)?.name ?? "") || null;
  if (typeof value === "object") return String((value as Record<string, unknown>).name ?? "") || null;
  return null;
}

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || DEFAULT_ORG_SLUG;
}

export async function getPrimaryOrganization(client: SupabaseClient) {
  const { data, error } = await client.from("organizations").select("id,name,slug").order("created_at", { ascending: true }).limit(1).maybeSingle<OrganizationRow>();
  if (error) throw error;
  return data;
}

export async function getOrganizationForWrite(client: SupabaseClient) {
  const primary = await getPrimaryOrganization(client);
  if (primary) return primary;
  throw new Error("Create a school profile before adding records.");
}

export async function upsertOrganization(client: SupabaseClient, input: OrganizationSetupInput) {
  const slug = input.slug ? slugify(input.slug) : slugify(input.name);
  const { data, error } = await client.from("organizations").upsert({
    name: input.name,
    slug,
    email: input.email ?? null,
    phone: input.phone ?? null,
    address: input.address ?? null,
    active: true,
  }, { onConflict: "slug" }).select("id,name,slug").single<OrganizationRow>();
  if (error) throw error;
  return data;
}

export async function upsertAcademicSession(client: SupabaseClient, organizationId: string, input: AcademicSessionInput) {
  const { data, error } = await client.from("academic_sessions").upsert({
    organization_id: organizationId,
    name: input.name,
    current_term: input.currentTerm,
    starts_on: input.startsOn || null,
    ends_on: input.endsOn || null,
    active: true,
  }, { onConflict: "organization_id,name" }).select("*").single();
  if (error) throw error;
  return data;
}

export async function upsertClassrooms(client: SupabaseClient, organizationId: string, classes: ClassroomSetupInput[]) {
  const rows = classes.filter((item) => item.name).map((item) => ({
    organization_id: organizationId,
    name: item.name,
    level: item.level ?? null,
    arm: item.arm ?? null,
    capacity: item.capacity ?? null,
  }));
  if (!rows.length) return [];
  const { data, error } = await client.from("classrooms").upsert(rows, { onConflict: "organization_id,name" }).select("*");
  if (error) throw error;
  return data ?? [];
}

export async function upsertTeachers(client: SupabaseClient, organizationId: string, teachers: TeacherSetupInput[]) {
  const rows = teachers.filter((item) => item.staffNo && item.name).map((item) => ({
    organization_id: organizationId,
    staff_no: item.staffNo,
    name: item.name,
    email: item.email ?? null,
    phone: item.phone ?? null,
    department: item.department ?? null,
    title: item.title ?? null,
    active: true,
  }));
  if (!rows.length) return [];
  const { data, error } = await client.from("teachers").upsert(rows, { onConflict: "organization_id,staff_no" }).select("*");
  if (error) throw error;
  return data ?? [];
}

export async function upsertFeeCategories(client: SupabaseClient, organizationId: string, fees: FeeCategoryInput[]) {
  const rows = fees.filter((item) => item.name).map((item) => ({
    organization_id: organizationId,
    name: item.name,
    amount: item.amount,
    billing_cycle: item.billingCycle ?? "termly",
    required: item.required ?? true,
    active: true,
  }));
  if (!rows.length) return [];
  const { data, error } = await client.from("fee_categories").upsert(rows, { onConflict: "organization_id,name" }).select("*");
  if (error) throw error;
  return data ?? [];
}

export async function getSetupReadiness(client: SupabaseClient) {
  const { data, error } = await client.from("v_setup_readiness").select("*").order("readiness_score", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

export type InvitationInput = {
  email: string;
  name?: string;
  role: "SCHOOL_OWNER" | "PRINCIPAL" | "TEACHER" | "ACCOUNTANT" | "PARENT" | "STUDENT" | "SUPER_ADMIN";
};

export async function getAccessSummary(client: SupabaseClient) {
  const { data, error } = await client.from("v_user_access_summary").select("*").limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

export async function listInvitations(client: SupabaseClient) {
  const organization = await getOrganizationForWrite(client);
  const { data, error } = await client
    .from("user_invitations")
    .select("id,email,name,role,status,token,expires_at,created_at")
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createInvitation(client: SupabaseClient, input: InvitationInput) {
  const organization = await getOrganizationForWrite(client);
  const { data, error } = await client
    .from("user_invitations")
    .upsert({
      organization_id: organization.id,
      email: input.email.toLowerCase().trim(),
      name: input.name ?? null,
      role: input.role,
      status: "pending",
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: "organization_id,email" })
    .select("id,email,name,role,status,token,expires_at,created_at")
    .single();
  if (error) throw error;
  return data;
}

export async function acceptInvitation(client: SupabaseClient, token: string, authUserId: string, email: string) {
  const { data: invitation, error: inviteError } = await client
    .from("user_invitations")
    .select("id,organization_id,email,name,role,status,expires_at")
    .eq("token", token)
    .maybeSingle<{ id: string; organization_id: string; email: string; name: string | null; role: string; status: string; expires_at: string }>();
  if (inviteError) throw inviteError;
  if (!invitation) throw new Error("Invitation not found");
  if (invitation.status !== "pending") throw new Error("Invitation is no longer pending");
  if (new Date(invitation.expires_at).getTime() < Date.now()) throw new Error("Invitation has expired");
  if (invitation.email.toLowerCase() !== email.toLowerCase()) throw new Error("Invitation email does not match authenticated user");

  const { data: profile, error: profileError } = await client
    .from("app_users")
    .upsert({
      organization_id: invitation.organization_id,
      auth_user_id: authUserId,
      email: invitation.email.toLowerCase(),
      name: invitation.name ?? email,
      role: invitation.role,
      active: true,
    }, { onConflict: "email" })
    .select("*")
    .single();
  if (profileError) throw profileError;

  const { error: updateError } = await client
    .from("user_invitations")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("id", invitation.id);
  if (updateError) throw updateError;

  return profile;
}


export async function findAppUserByEmail(client: SupabaseClient, email: string) {
  const { data, error } = await client
    .from("app_users")
    .select("id,organization_id,name,email,role")
    .eq("email", email.toLowerCase())
    .maybeSingle<{ id: string; organization_id: string; name: string; email: string; role: string }>();
  if (error) throw error;
  return data;
}

export async function linkExistingUsersForStudent(client: SupabaseClient, student: StudentRow) {
  const links = [];
  if (student.guardian_email) {
    const parent = await findAppUserByEmail(client, student.guardian_email);
    if (parent) {
      const { data, error } = await client.from("user_student_links").upsert({
        organization_id: student.organization_id,
        app_user_id: parent.id,
        student_id: student.id,
        relationship: "PARENT",
        active: true,
      }, { onConflict: "app_user_id,student_id,relationship" }).select("*").single();
      if (error) throw error;
      links.push(data);
    }
  }
  if (student.student_email) {
    const studentUser = await findAppUserByEmail(client, student.student_email);
    if (studentUser) {
      const { data, error } = await client.from("user_student_links").upsert({
        organization_id: student.organization_id,
        app_user_id: studentUser.id,
        student_id: student.id,
        relationship: "STUDENT",
        active: true,
      }, { onConflict: "app_user_id,student_id,relationship" }).select("*").single();
      if (error) throw error;
      links.push(data);
    }
  }
  return links;
}

export async function getPortalStudentsForUser(client: SupabaseClient, userEmail: string, relationship: "PARENT" | "STUDENT") {
  const profile = await findAppUserByEmail(client, userEmail);
  if (!profile) return { profile: null, students: [] as Array<Record<string, unknown>> };

  const { data: linked, error: linkError } = await client
    .from("v_portal_student_links")
    .select("*")
    .eq("app_user_id", profile.id)
    .eq("relationship", relationship)
    .eq("active", true);
  if (linkError) throw linkError;

  let students = linked ?? [];
  if (!students.length && relationship === "PARENT") {
    const { data, error } = await client
      .from("students")
      .select("id,organization_id,admission_no,first_name,last_name,student_email,guardian_name,guardian_email,guardian_phone,risk_level,classrooms(name)")
      .eq("guardian_email", userEmail.toLowerCase());
    if (error) throw error;
    students = (data ?? []).map((student) => ({
      student_id: student.id,
      organization_id: student.organization_id,
      admission_no: student.admission_no,
      student_name: `${student.first_name ?? ""} ${student.last_name ?? ""}`.trim(),
      student_email: student.student_email,
      guardian_name: student.guardian_name,
      guardian_email: student.guardian_email,
      guardian_phone: student.guardian_phone,
      risk_level: student.risk_level,
      classroom: relationName(student.classrooms),
      relationship: "PARENT",
    }));
  }

  if (!students.length && relationship === "STUDENT") {
    const { data, error } = await client
      .from("students")
      .select("id,organization_id,admission_no,first_name,last_name,student_email,guardian_name,guardian_email,guardian_phone,risk_level,classrooms(name)")
      .eq("student_email", userEmail.toLowerCase());
    if (error) throw error;
    students = (data ?? []).map((student) => ({
      student_id: student.id,
      organization_id: student.organization_id,
      admission_no: student.admission_no,
      student_name: `${student.first_name ?? ""} ${student.last_name ?? ""}`.trim(),
      student_email: student.student_email,
      guardian_name: student.guardian_name,
      guardian_email: student.guardian_email,
      guardian_phone: student.guardian_phone,
      risk_level: student.risk_level,
      classroom: relationName(student.classrooms),
      relationship: "STUDENT",
    }));
  }

  return { profile, students };
}

export async function getStudentPortalBundle(client: SupabaseClient, userEmail: string, relationship: "PARENT" | "STUDENT") {
  const portal = await getPortalStudentsForUser(client, userEmail, relationship);
  const studentIds = portal.students.map((student) => String(student.student_id)).filter(Boolean);
  if (!studentIds.length) return { ...portal, invoices: [], results: [], attendance: [] };

  const [invoicesResult, resultsResult, attendanceResult] = await Promise.all([
    client.from("invoices").select("id,invoice_no,title,amount,amount_paid,status,due_date,student_id").in("student_id", studentIds),
    client.from("results").select("id,student_id,term,session,ca_score,exam_score,total_score,grade,remark,status,subjects(name)").in("student_id", studentIds),
    client.from("attendance_records").select("id,student_id,attendance_date,period,status,note").in("student_id", studentIds).order("attendance_date", { ascending: false }).limit(50),
  ]);
  if (invoicesResult.error) throw invoicesResult.error;
  if (resultsResult.error) throw resultsResult.error;
  if (attendanceResult.error) throw attendanceResult.error;

  return {
    ...portal,
    invoices: invoicesResult.data ?? [],
    results: resultsResult.data ?? [],
    attendance: attendanceResult.data ?? [],
  };
}

export async function recordVerifiedPayment(client: SupabaseClient, input: {
  invoiceNo: string;
  reference: string;
  amount: number;
  provider: string;
  payerEmail?: string;
  metadata?: Record<string, unknown>;
}) {
  const invoice = await getLiveInvoice(client, input.invoiceNo);
  if (!invoice) throw new Error("Invoice not found");

  const paid = Number(invoice.amount_paid ?? 0);
  const amount = Number(invoice.amount ?? 0);
  const nextPaid = Math.min(amount, paid + input.amount);
  const status = nextPaid >= amount ? "PAID" : nextPaid > 0 ? "PARTIAL" : "PENDING";

  const { data: payment, error: paymentError } = await client
    .from("payments")
    .upsert({
      organization_id: invoice.organization_id,
      invoice_id: invoice.id,
      amount: input.amount,
      provider: input.provider,
      reference: input.reference,
      paid_at: new Date().toISOString(),
      metadata: input.metadata ?? {},
    }, { onConflict: "reference" })
    .select("*")
    .single();
  if (paymentError) throw paymentError;

  const { error: invoiceError } = await client
    .from("invoices")
    .update({ amount_paid: nextPaid, status })
    .eq("id", invoice.id);
  if (invoiceError) throw invoiceError;

  const receiptNo = `RCPT-${input.reference}`;
  const { data: receipt, error: receiptError } = await client
    .from("payment_receipts")
    .upsert({
      organization_id: payment.organization_id,
      invoice_id: invoice.id,
      payment_id: payment.id,
      receipt_no: receiptNo,
      payer_email: input.payerEmail ?? null,
      amount: input.amount,
      provider: input.provider,
      reference: input.reference,
      metadata: input.metadata ?? {},
    }, { onConflict: "reference" })
    .select("*")
    .single();
  if (receiptError) throw receiptError;

  return { payment, receipt, invoiceStatus: status, amountPaid: nextPaid };
}

export async function getReceiptByReference(client: SupabaseClient, reference: string) {
  const { data, error } = await client
    .from("v_payment_receipts")
    .select("*")
    .eq("reference", reference)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export type ResultPublishInput = {
  admissionNo: string;
  term: string;
  session: string;
  action: "publish" | "unlock";
  actorEmail?: string;
  note?: string;
};

export async function publishOrUnlockResults(client: SupabaseClient, input: ResultPublishInput) {
  const organization = await getOrganizationForWrite(client);
  const student = await getStudentByAdmission(client, organization.id, input.admissionNo);
  if (!student) throw new Error(`Student ${input.admissionNo} not found`);

  const update = input.action === "publish"
    ? { status: "PUBLISHED", published_at: new Date().toISOString(), locked_at: new Date().toISOString(), unlocked_at: null, lock_reason: input.note ?? "Published by authorized user" }
    : { status: "REVIEW", unlocked_at: new Date().toISOString(), locked_at: null, lock_reason: input.note ?? "Unlocked for correction" };

  const { data, error } = await client
    .from("results")
    .update(update)
    .eq("student_id", student.id)
    .eq("term", input.term)
    .eq("session", input.session)
    .select("*");
  if (error) throw error;
  if (!data?.length) throw new Error("No result records found for this student, term and session");

  const { error: eventError } = await client.from("result_publication_events").insert({
    organization_id: organization.id,
    student_id: student.id,
    term: input.term,
    session: input.session,
    action: input.action,
    actor_email: input.actorEmail ?? null,
    note: input.note ?? null,
  });
  if (eventError) throw eventError;

  return { student, updated: data.length, action: input.action };
}

export async function getResultPublicationEvents(client: SupabaseClient) {
  const organization = await getOrganizationForWrite(client);
  const { data, error } = await client
    .from("result_publication_events")
    .select("id,student_id,term,session,action,actor_email,note,created_at")
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

export type AnnouncementInput = {
  title: string;
  body: string;
  audience?: string;
  publish?: boolean;
};

export async function listAnnouncements(client: SupabaseClient) {
  const organization = await getOrganizationForWrite(client);
  const { data, error } = await client
    .from("announcements")
    .select("id,title,body,audience,published_at,created_at")
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createAnnouncement(client: SupabaseClient, input: AnnouncementInput) {
  const organization = await getOrganizationForWrite(client);
  const { data, error } = await client
    .from("announcements")
    .insert({
      organization_id: organization.id,
      title: input.title,
      body: input.body,
      audience: input.audience ?? "ALL",
      published_at: input.publish ? new Date().toISOString() : null,
    })
    .select("id,title,body,audience,published_at,created_at")
    .single();
  if (error) throw error;
  return data;
}

export async function getCommunicationSummary(client: SupabaseClient) {
  const { data, error } = await client.from("v_communication_summary").select("*").limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

export async function listCommunicationDeliveries(client: SupabaseClient) {
  const organization = await getOrganizationForWrite(client);
  const { data, error } = await client
    .from("communication_deliveries")
    .select("id,announcement_id,channel,recipient_email,subject,status,provider,provider_message_id,error_message,sent_at,created_at")
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function recordCommunicationDelivery(client: SupabaseClient, input: {
  announcementId?: string;
  recipientEmail: string;
  subject: string;
  status: "queued" | "sent" | "failed";
  provider?: string;
  providerMessageId?: string;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}) {
  const organization = await getOrganizationForWrite(client);
  const { data, error } = await client
    .from("communication_deliveries")
    .insert({
      organization_id: organization.id,
      announcement_id: input.announcementId ?? null,
      channel: "email",
      recipient_email: input.recipientEmail.toLowerCase(),
      subject: input.subject,
      status: input.status,
      provider: input.provider ?? null,
      provider_message_id: input.providerMessageId ?? null,
      error_message: input.errorMessage ?? null,
      sent_at: input.status === "sent" ? new Date().toISOString() : null,
      metadata: input.metadata ?? {},
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
