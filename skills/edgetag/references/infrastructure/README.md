# EdgeTag Infrastructure Reference

## Overview

EdgeTag is built on **Cloudflare Workers**, deployed across 1600+ edge locations globally. This document provides a high-level understanding of EdgeTag's architecture, isolation model, and hosting options.

## Architecture

### Cloudflare Workers Foundation

- Global edge computing platform with 1600+ locations
- Enables real-time event processing and data transformation at edge
- Sub-second latency for event collection and channel delivery
- Automatic scaling without infrastructure management

### Single-Tenant Isolation

Each customer receives a **completely isolated environment** including:

- Dedicated database
- Dedicated processing pipeline
- Dedicated API endpoints
- Dedicated file storage (R2)
- Dedicated KV storage
- Custom DNS configuration

This isolation ensures data privacy, performance guarantees, and independent scaling.

## Hosting Options

EdgeTag offers two hosting models with **identical features**:

### 1. Managed Hosting

- EdgeTag runs everything on Blotout's Cloudflare account
- No Cloudflare account required from customer
- Turnkey deployment and maintenance
- Blotout handles all infrastructure operations
- Ideal for: companies without Cloudflare experience or preference for outsourced ops

### 2. Self-Hosted

- Customer gets whole environment into their own Cloudflare account
- Customer maintains Cloudflare token and account
- EdgeTag provides deployment automation
- Full control over infrastructure and compliance
- Ideal for: enterprises with existing Cloudflare setup or strict control requirements

**Critical:** You cannot migrate between hosting options after initial selection. Choose carefully during onboarding.

## Self-Hosted Cloudflare Services

When self-hosting, EdgeTag uses:

- **Workers**: compute platform for event processing
- **Analytics Engine**: real-time analytics and aggregation
- **Custom Hostnames**: first-party subdomain SSL certificates
- **D1**: customer's isolated database
- **KV**: distributed key-value store for configuration/cache
- **Pipelines**: real-time event ingestion and transformation
- **Queues**: reliable event queueing and processing
- **R2**: S3-compatible file storage
- **R2 SQL**: SQL query engine for R2-stored event data (Edge Lake)
- **Workers for Platforms**: multi-tenancy support (applicable for apps/agencies that needs to support 1000+ customers)
- **Workflows**: orchestration of complex processing tasks

## DNS Architecture

EdgeTag uses DNS to route traffic and verify domain ownership:

### DNS Records Required

**Self-hosted with domain on the same Cloudflare account:**

- No TXT verification needed — EdgeTag automatically creates the CNAME record in your DNS
- This is the simplest setup path

**All other cases (managed hosting, or domain on a different DNS provider/account):**

1. **TXT Record** (ownership verification)

- Name: Provided by EdgeTag dashboard (e.g. `_cf-custom-hostname.<subdomain>` -- exact name varies per setup)
- Value: Provided by EdgeTag dashboard (typically a UUID)
- Purpose: Prove domain ownership to EdgeTag
- Note: Some DNS providers auto-append the domain; check your provider's requirements

2. **CNAME Record** (traffic routing)

- Name: Your tracking subdomain, chosen during setup (e.g. `d`, `bssql`, etc.)
- Points to: Value from EdgeTag dashboard (e.g. `<subdomain>.customers.edgetag.io`)
- Purpose: Route traffic to EdgeTag edge location
- Note: On Cloudflare, disable the Proxied option (use gray cloud / DNS-only)

### First-Party Subdomain Importance

The first-party subdomain (e.g., `d.mysite.com`) is **essential** because:

- Helps with Intelligent Tracking Prevention (ITP) in Safari
- Avoids third-party cookie restrictions
- Improves data collection accuracy
- Enables persistent user identification

Without proper first-party subdomain setup, cookie persistence and user stitching will be severely degraded.

## Key Concepts

### Event Collection

Events (page views, purchases, etc.) are sent to EdgeTag's edge workers for:

- Payload validation
- PII transformation
- Consent enforcement
- Real-time analytics
- Multi-channel delivery

### Consent Management

Built-in consent framework:

- Per-provider consent tracking
- Category-based consent (marketing, analytics, etc.)
- Regional compliance (GDPR, CCPA, etc.)
- Automatic enforcement on channel delivery

### Channel Delivery

EdgeTag delivers events to multiple platforms:

- Meta (Facebook, Instagram)
- Google (Ads, Analytics)
- Klaviyo
- TikTok
- Custom HTTP endpoints
- And more...

## Compliance & Security

Blotout (the company behind EdgeTag) maintains:

- **SOC 2 Type 2** certified
- **HIPAA** compliant
- **Do not sell, do not share** company — EdgeTag never sells or shares customer data

Managed hosting customers inherit these compliance guarantees without additional effort. Self-hosted customers manage their own Cloudflare account compliance but still benefit from EdgeTag's data handling policies.

## Monitoring & Observability

Real-time capabilities:

- Live event dashboards
- Anomaly detection
- Event validators for QA
- Live log streaming
- Performance metrics

## Getting Started

- **[Setup Guide](./setup-guide.md)** - Complete onboarding and configuration instructions
- **[Gotchas](./gotchas.md)** - Common pitfalls to avoid
- **[Patterns](./patterns.md)** - DNS setup examples and advanced configurations
