# Billing Service Architecture

## Responsibilities

- Persist invoices and line items in PostgreSQL.
- Serve invoice PDFs and payment status to authenticated portal clients.
- Integrate with external acquirers using server-to-server APIs.

## Components

| Layer | Technology |
|-------|------------|
| HTTP API | Express on Node.js |
| Persistence | PostgreSQL (`invoices`, `payments`) |

## Platform integration

- Consumes user identity context from JWTs issued by `identity-service`.
- Publishes payment events to `webhook-service` for merchant-configured callbacks.
