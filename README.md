# Salarium

[Demo](https://salarium.everaldo.dev/)

## CI/CD

This repository includes GitHub Actions workflows for CI and deploy:

- `.github/workflows/ci.yml`: runs `npm ci`, tests, and production build on pushes and pull requests.
- `.github/workflows/deploy.yml`: rebuilds the app and deploys `build/` to your server via SSH on pushes to `main`.

### Required GitHub Secrets

Configure these repository or environment secrets before enabling deploy:

- `DEPLOY_HOST`: server hostname or IP.
- `DEPLOY_PORT`: SSH port. Optional if your server uses `22`.
- `DEPLOY_USER`: SSH user used for deploy.
- `DEPLOY_PATH`: target directory where the `build/` contents should be published.
- `DEPLOY_SSH_KEY`: private SSH key for the deploy user.

### Hosting Requirements

- SSH access enabled for the deploy user.
- `rsync` installed on the server.
- The target directory in `DEPLOY_PATH` must already exist and be writable by `DEPLOY_USER`.

### Notes

- The deploy workflow uses GitHub Actions `environment: production`, so you can attach protected secrets and manual approvals if needed.
- The deploy step syncs only the generated `build/` output.
- For a standard React SPA hosted in a PHP shared hosting account, the publish target is usually `public_html/`.
- The deploy uses `rsync --delete`, so files removed from the app will also be removed from the target directory.
- The workflow refuses to deploy to the `public_html` root and expects a subdirectory such as `/home/user123/domains/everaldo.dev/public_html/salarium`.
- You can test safely with `workflow_dispatch` and `dry_run=true`, which runs `rsync` in preview mode without changing remote files.
- If the app uses client-side routes beyond `/`, you may also need an `.htaccess` rewrite rule so direct URL access resolves to `index.html`.
