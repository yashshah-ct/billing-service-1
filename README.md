# Billing Service

Invoice lifecycle, payment capture status, and ledger exports for the Northwind Pay fintech platform.

## Overview

The billing service stores customer invoices, exposes PDF document retrieval for the customer portal, and records payment outcomes emitted by card processors and partner banks.

## Local development

```bash
npm install
npm run dev
```

Service listens on `http://localhost:3002` by default.

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [API.md](./API.md)
- [RUNBOOK.md](./RUNBOOK.md)

## Testing

```bash
npm test
```
