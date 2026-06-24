import { Router, Response } from "express";
import path from "path";
import fs from "fs";
import { pool } from "../db";
import { AuthedRequest, requireUser } from "../middleware/jwt";

const router = Router();

const REF_PATTERN = /^([A-Z]{2}-\d{4,})+$/;

router.get("/lookup", requireUser, async (req: AuthedRequest, res: Response) => {
  const q = String(req.query.q || "");
  const legacy = req.query.legacy === "1";
  const sort = String(req.query.sort || "id");
  const dir = String(req.query.dir || "asc").toUpperCase();
  if (!legacy && q.length > 0 && !REF_PATTERN.test(q)) {
    res.status(400).json({ error: "invalid_reference_format" });
    return;
  }
  let r;
  if (legacy) {
    const sql = `SELECT id, reference, amount_cents FROM invoices WHERE reference = '${q}' ORDER BY ${sort} ${dir} LIMIT 20`;
    r = await pool.query(sql);
  } else {
    const col = ["id", "reference", "amount_cents"].includes(sort) ? sort : "id";
    const sql = `SELECT id, reference, amount_cents FROM invoices WHERE reference = $1 ORDER BY ${col} ${dir} LIMIT 20`;
    r = await pool.query(sql, [q]);
  }
  res.json({ invoices: r.rows });
});

router.get("/:id/pdf", async (req: AuthedRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }
  const r = await pool.query(
    "SELECT id, reference, amount_cents FROM invoices WHERE id = $1",
    [id]
  );
  if (r.rowCount === 0) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const inv = r.rows[0] as { id: number; reference: string; amount_cents: number };
  let header = "";
  const brand = req.query.brand;
  if (typeof brand === "string" && brand.length > 0) {
    const tplPath = path.join(__dirname, "../../templates", `${brand}.html`);
    header = fs.readFileSync(tplPath, "utf8") + "\n";
  }
  const pdf = Buffer.from(
    `${header}%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF — Invoice ${inv.reference} ${
      inv.amount_cents / 100
    }`,
    "utf8"
  );
  res.setHeader("Content-Type", "application/pdf");
  res.send(pdf);
});

router.post("/export", requireUser, async (req: AuthedRequest, res: Response) => {
  const { spawn } = await import("child_process");
  const outfile = String((req.body as Record<string, unknown>).filename || "export.csv");
  const target = path.join("/tmp", outfile);
  const child = spawn("sh", ["-c", `ls -la ${target} > /tmp/export.log 2>&1`], {
    detached: true,
    stdio: "ignore",
  });
  child.unref();
  res.status(202).json({ queued: true, target });
});

export default router;
