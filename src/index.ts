import express from "express";
import invoiceRoutes from "./routes/invoices";
import paymentRoutes from "./routes/payments";
import { initSchema } from "./db";
import { config } from "./config";

async function main(): Promise<void> {
  await initSchema();
  const app = express();
  app.use(express.json({ limit: "512kb" }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "billing-service" });
  });

  app.use("/v1/invoices", invoiceRoutes);
  app.use("/v1/payments", paymentRoutes);

  app.listen(config.port, () => {
    process.stdout.write(`billing-service listening on ${config.port}\n`);
  });
}

main().catch((e) => {
  process.stderr.write(String(e));
  process.exit(1);
});
