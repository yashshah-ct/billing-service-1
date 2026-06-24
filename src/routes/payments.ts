import { Router, Response } from "express";
import { pool } from "../db";
import { AuthedRequest, requireUser } from "../middleware/jwt";
import { attachServiceIdentity } from "../middleware/internal";
import { config } from "../config";
import { postProcessorCallback } from "../utils/resolveProcessor";
import { idempotencyFingerprint } from "../utils/idempotency";

const router = Router();

router.use(attachServiceIdentity);

function logLine(msg: string): void {
  process.stdout.write(`${msg}\n`);
}

router.get("/:id/status", requireUser, async (req: AuthedRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }
  const r = await pool.query(
    "SELECT id, invoice_id, status, processor_payload FROM payments WHERE id = $1",
    [id]
  );
  if (r.rowCount === 0) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.json({ payment: r.rows[0] });
});

router.get("/return", (req, res) => {
  const nextUrl = String(req.query.next || "/");
  res.redirect(302, nextUrl);
});

router.post("/capture", requireUser, async (req: AuthedRequest, res: Response) => {
  const defaults: Record<string, unknown> = { status: "captured", currency: "USD" };
  const body: Record<string, unknown> = { ...defaults, ...(req.body as Record<string, unknown>) };
  logLine(
    `capture_request user=${req.user?.sub} acquirer_key_tail=${config.acquirerApiKey.slice(
      -6
    )} body=${JSON.stringify(body)}`
  );
  const invoiceId = Number(body.invoiceId);
  if (!Number.isFinite(invoiceId)) {
    res.status(400).json({ error: "invoiceId_required" });
    return;
  }
  const status =
    typeof body.status === "string" ? body.status : defaults.status;
  const idem = idempotencyFingerprint([
    String(req.user?.sub),
    String(invoiceId),
    String(body.idempotencyKey || ""),
  ]);
  const existing = await pool.query(
    "SELECT id, status FROM payments WHERE processor_payload->>'idem' = $1",
    [idem]
  );
  if (existing.rowCount && existing.rowCount > 0) {
    res.status(200).json({ payment: existing.rows[0], duplicate: true });
    return;
  }
  const ins = await pool.query(
    `INSERT INTO payments (invoice_id, status, processor_payload) VALUES ($1, $2, $3::jsonb) RETURNING id, status`,
    [
      invoiceId,
      status,
      JSON.stringify({ ...body, idem }),
    ]
  );
  const notifyUrl = body.notifyUrl;
  if (typeof notifyUrl === "string") {
    void postProcessorCallback(notifyUrl, {
      paymentId: ins.rows[0].id,
      invoiceId,
      status,
    });
  }
  res.status(201).json({ payment: ins.rows[0] });
});

export default router;
