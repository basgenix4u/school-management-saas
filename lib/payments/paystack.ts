import crypto from "crypto";

export type PaystackInitializeResponse = {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

export type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data?: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    paid_at: string;
    channel: string;
    customer?: { email?: string };
    metadata?: Record<string, unknown>;
  };
};

export function hasPaystackConfig() {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}

export async function initializePaystackTransaction(input: {
  email: string;
  amount: number;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}) {
  if (!process.env.PAYSTACK_SECRET_KEY) throw new Error("Paystack is not configured. Add PAYSTACK_SECRET_KEY to your environment variables.");

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: Math.round(input.amount * 100),
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
  });

  const payload = await response.json() as PaystackInitializeResponse;
  if (!response.ok || !payload.status) throw new Error(payload.message || "Unable to initialize Paystack payment");
  return payload;
}

export async function verifyPaystackTransaction(reference: string) {
  if (!process.env.PAYSTACK_SECRET_KEY) throw new Error("Paystack is not configured. Add PAYSTACK_SECRET_KEY to your environment variables.");

  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
  });
  const payload = await response.json() as PaystackVerifyResponse;
  if (!response.ok || !payload.status) throw new Error(payload.message || "Unable to verify Paystack payment");
  return payload;
}

export function verifyPaystackSignature(rawBody: string, signature: string | null) {
  if (!process.env.PAYSTACK_SECRET_KEY || !signature) return false;
  const hash = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}

export function generatePaymentReference(invoiceNo: string) {
  const clean = invoiceNo.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return `EDU-${clean}-${Date.now()}`;
}
