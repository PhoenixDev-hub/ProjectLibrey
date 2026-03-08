Server README

- Start in development (uses Ethereal for email if SMTP not configured):

  ```bash
  cd server
  cp .env.example .env
  # optionally fill .env with DATABASE_URL, SMTP_* for production
  NODE_ENV=development npm run start:dev
  ```

- Testing password reset email locally:
  - Use the test route: `POST /password-reset/test` with JSON `{ "email": "you@example.com" }`.
  - In development, the response will include `_devPreviewUrl` and logs will include an Ethereal preview link. Open that URL to view the message.
  - Or run the script: `NODE_ENV=development node --experimental-modules scripts/send_test_email.mjs`

- Production notes:
  - Provide SMTP credentials in environment variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`) or configure a transactional provider (SendGrid / Mailgun / SES) and set these accordingly.
  - Ensure `FRONTEND_URL` points to the client application so reset links are correct.
  - Keep tokens hashed, single-use and with short expiration. The system already stores a hashed token and marks it as used after password reset.

- Security:
  - Responses to password-reset requests are intentionally generic to avoid user enumeration.
  - Logs include errors for debugging but tokens are only returned in development.
