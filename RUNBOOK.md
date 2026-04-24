# Billing Service Runbook

## Ownership

Revenue Operations and Core Payments share tier-2 ownership.

## Database

Migrations are applied through the deployment pipeline. For emergency read-only access, use the finance reporting role documented in the secrets vault.

## Key metrics

- Invoice generation latency P99
- Payment capture error rate by processor region

## Incident response

Processor-wide outages are coordinated via the payments status page and internal incident channel `#pay-incidents`.
