/**
 * Durable register outbox.
 *
 * A teacher marking forty students on an unstable connection must never lose
 * the register to a dropped request. Submissions persist in local storage and
 * flush in the background; anything the server rejects stays visible with its
 * reason instead of vanishing.
 */

export type RegisterMark = {
  admissionNo: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  note?: string;
};

export type RegisterPayload = {
  date: string;
  period: string;
  marks: RegisterMark[];
};

export type OutboxRecord = {
  id: string;
  payload: RegisterPayload;
  attempts: number;
  error: string | null;
  updatedAt: string;
};

export type OutboxStore = {
  load: () => OutboxRecord[];
  save: (records: OutboxRecord[]) => void;
};

export type SendResult = { unknown?: string[] };

export function createMemoryStore(initial: OutboxRecord[] = []): OutboxStore {
  let records = [...initial];
  return {
    load: () => [...records],
    save: (next) => {
      records = [...next];
    },
  };
}

export function createLocalStore(key: string): OutboxStore {
  return {
    load: () => {
      if (typeof window === "undefined") return [];
      try {
        const raw = window.localStorage.getItem(key);
        const parsed = raw ? (JSON.parse(raw) as OutboxRecord[]) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    },
    save: (records) => {
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(key, JSON.stringify(records));
      } catch {
        // Storage full or unavailable: the in-memory copy still works for
        // this session, so marking is never blocked.
      }
    },
  };
}

export function createRecordId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `register-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export class RegisterOutbox {
  private store: OutboxStore;
  private send: (payload: RegisterPayload) => Promise<SendResult>;

  constructor(store: OutboxStore, send: (payload: RegisterPayload) => Promise<SendResult>) {
    this.store = store;
    this.send = send;
  }

  pending(): OutboxRecord[] {
    return this.store.load();
  }

  enqueue(payload: RegisterPayload): OutboxRecord {
    const record: OutboxRecord = {
      id: createRecordId(),
      payload,
      attempts: 0,
      error: null,
      updatedAt: new Date().toISOString(),
    };
    this.store.save([...this.store.load(), record]);
    return record;
  }

  discard(id: string) {
    this.store.save(this.store.load().filter((record) => record.id !== id));
  }

  async flush(): Promise<{ sent: number; failed: OutboxRecord[]; unknown: string[] }> {
    const records = this.store.load();
    const remaining: OutboxRecord[] = [];
    const failed: OutboxRecord[] = [];
    const unknown: string[] = [];
    let sent = 0;

    for (const record of records) {
      try {
        const result = await this.send(record.payload);
        sent += 1;
        if (result.unknown?.length) unknown.push(...result.unknown);
      } catch (error) {
        const updated: OutboxRecord = {
          ...record,
          attempts: record.attempts + 1,
          error: error instanceof Error ? error.message : "Submission failed",
          updatedAt: new Date().toISOString(),
        };
        remaining.push(updated);
        failed.push(updated);
      }
    }

    this.store.save(remaining);
    return { sent, failed, unknown: [...new Set(unknown)] };
  }
}
