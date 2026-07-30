# Evidence

Sanitized observations and provenance records.

## Rules

- No raw HAR files, no tokens, no cookies, no passwords, no personal data.
- Each evidence file must reference its capture date, source, and sanitization steps.
- Evidence supports the source-of-truth precedence in AGENTS.md:
  1. Correlated, sanitized request/response capture
  2. Official runtime OpenAPI/Swagger/AsyncAPI
  3. Official vendor documentation
  4. First-party frontend call-site structure
  5. First-party endpoint registry
  6. Inference from names or analogous operations
