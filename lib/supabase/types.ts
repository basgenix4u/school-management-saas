export type DatabaseHealth = {
  configured: boolean;
  projectRef: string;
  checkedAt: string;
  tables?: Record<string, number>;
  error?: string;
};

export type CommandCenterRow = {
  organization_name: string;
  total_students: number;
  total_teachers: number;
  total_classrooms: number;
  total_invoices: number;
  amount_billed: number;
  amount_collected: number;
  outstanding_balance: number;
  attendance_records: number;
  audit_events: number;
};
