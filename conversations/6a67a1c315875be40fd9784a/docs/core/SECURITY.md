# Security Policy & Operational Guidelines

## Credential & Data Security
- **Zero Credentials in Repository**: No access tokens, session cookies, passwords, API keys, or raw authentication tokens may be committed to source control or included in mock fixtures.
- **Environment Variables**: Authentication and configuration must be supplied strictly via environment variables or a secure secret manager.
  - `PROGRESSME_TOKEN`: OAuth/session bearer token.
  - `PROGRESSME_EMAIL`: Account email address for authentication.
  - `PROGRESSME_PASSWORD`: Account password for authentication.

## Evidence Protection & Sanitization
- Network capture files in `evidence/` must be thoroughly sanitized prior to commit. All personally identifiable information (PII), session tokens, passwords, and sensitive cookies must be stripped or replaced with redacted placeholders (e.g., `<REDACTED_TOKEN>`).
- `.gitignore` MUST protect and ignore `.env`, local `.env.*` files, raw HAR captures, un-sanitized trace logs, and private evidence files.

## Safe Execution Guardrails
- **`DRY_RUN=true` Default**: Outbound adapter operations and network clients must default to `DRY_RUN=true` mode to prevent unintended state mutations or data overwrites on target LMS platforms during testing and development. Live mutation requests require explicit `DRY_RUN=false` confirmation.

## Vendor Integrity & Terms of Service
- **Vendor API Transparency**: Private or reverse-engineered APIs must NEVER be described or represented as official vendor APIs or public developer products.
- **ToS Compliance**: Production deployments and automated pipelines must confirm and maintain compliance with target vendor Terms of Service (ToS) and platform policies.
