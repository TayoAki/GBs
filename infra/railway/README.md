# Deploy and Host Hire Shelby on Railway

## About Hosting Hire Shelby

The template runs Hire Shelby, PostgreSQL and agent computers on Railway. No Docker host or separate sandbox provider is needed. Railway usage and any connected model provider are billed separately.

## Deploy

The public Railway template deploys upstream Rakazo, not this fork. To host Hire Shelby, build this
repository instead:

- A PostgreSQL service and a service built from this repository. `railway.json` selects
  `infra/railway/Dockerfile`.
- A volume mounted at `/data` on the app service, and a public domain targeting port 5173.
- The app service variables listed by the upstream template: `OWNER_EMAIL`, `OWNER_PASSWORD`,
  `BETTER_AUTH_SECRET`, `ENCRYPTION_KEY` (64 hex characters), `SCREEN_PROXY_SECRET`,
  `DATABASE_URL=${{Postgres.DATABASE_URL}}`, `BETTER_AUTH_URL` and `WEB_ORIGIN` set to
  `https://${{RAILWAY_PUBLIC_DOMAIN}}`, `RAKAZO_HOST=${{RAILWAY_PUBLIC_DOMAIN}}`, `DATA_DIR=/data`,
  `PORT=5173`, `RAILWAY_RUN_UID=0`, `API_HOST=127.0.0.1`, `API_URL` and `API_PROXY_TARGET` set to
  `http://127.0.0.1:3100`, `AGENT_RUNTIME=pi`, `WAKEUP_DRIVER=graphile` and `SIGNUPS_ENABLED=false`.

Without a Railway API token, set `SANDBOX_PROVIDER=none`: Hire Shelby runs without bot computers. To
turn computers on, add `RAILWAY_API_TOKEN` and set `SANDBOX_PROVIDER=railway`.

1. Deploy the service.
2. Wait for Hire Shelby to become healthy. Open its generated HTTPS domain.
3. Sign in with your email and the generated `OWNER_PASSWORD` from the Hire Shelby service's Variables tab. Change the password in account settings.
4. Connect your model account in Hire Shelby and send Chief a message.

The token must be able to create environments and sandboxes in the project. Prefer a dedicated Railway workspace. Never place it in a bot's files or model connection settings.

## Why Deploy Hire Shelby on Railway

- The initial ordinary account is created before the public web server starts. Public registration is closed on every start; this template is intended for a personal deployment.
- Every install gets separate random database, authentication, encryption, screen and initial owner secrets. Keep the encryption key and database password stable across redeploys.
- PostgreSQL has no public endpoint. Only the web port is published; the API binds to loopback.
- Computers run in a separate, empty Railway environment, so they cannot reach the application's private database network. Startup creates one environment per application service and application environment, then reuses it on restart.
- App processes run as the unprivileged `node` user. The entrypoint briefly uses root to set the mounted volume's owner, then drops privileges.
- The API, worker and web share one service and `/data` volume. PostgreSQL has its own volume. The template requests daily backups for both volumes; Railway requires a Pro workspace to use managed backups. Run one application replica; do not enable service sleeping.
- Any process failure restarts the application service. Database migrations finish before startup. Idle computers stop after ten minutes; each user can create up to three computers.

## Updates and backups

To update, connect the service to the desired source branch and deploy its latest commit in the application environment. Do not deploy application services into the sandbox environment. The private account bootstrap keeps existing accounts and passwords. Changing `OWNER_PASSWORD` later does not reset an account password.

Back up PostgreSQL, `/data`, and `ENCRYPTION_KEY` before upgrades. Railway volume persistence is not a backup. Keep backups private and test restoring them together. Do not delete volumes to fix a failed deploy.

For installations using the older service-only sandbox name, rename the existing sandbox environment before upgrading. The new name is `sbx-` followed by the first 24 hexadecimal characters of the SHA-256 hash of `<service-id>:<application-environment-id>`. Renaming keeps the environment ID and existing computers intact. Do not delete or duplicate the environment. If multiple application environments already share it, checkpoint their computers and move each deployment to its own sandbox environment before upgrading.

The sandbox environment is separate from the app environment. Do not put trusted services or secrets there. If you delete the application project, check for and remove its remaining computers.

## Common Use Cases

A personal AI assistant with browser access, persistent files and scheduled tasks. Choose your model through Hire Shelby's connection settings.

## Dependencies for Hire Shelby

The template cannot generate a Railway API credential or a model account for you. These are the only outside account setup steps; no third-party sandbox service is required.

### Deployment Dependencies

The template supplies Node.js 22, PostgreSQL 16, the application image and two persistent volumes. Railway supplies HTTPS and sandbox computers. No local software installation is needed.
