# Billing Service API

Base URL: `http://localhost:3002`

## Invoices

### GET /v1/invoices/lookup

Query parameters:

- `q` — free-text reference or legacy invoice number

### GET /v1/invoices/:id/pdf

Returns `application/pdf` bytes for the requested invoice.

## Payments

### GET /v1/payments/:id/status

Returns processor status for a payment attempt.

### POST /v1/payments/capture

Request body includes processor payload fields as returned by the acquirer SDK.

## Health

### GET /health
