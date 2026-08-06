# Salarium

[Demo](https://salarium.everaldo.dev/)

Calculadora para MEI/PJ brasileiros descobrirem quanto reservar por mês para
aproximar sua renda de um pacote CLT equivalente. A partir do salário bruto
informado, calcula e permite ativar/desativar individualmente as seguintes
reservas, com base na legislação vigente em 2026 (sem dependentes):

- **INSS** — alíquotas progressivas por faixa (7,5% a 14%), com teto de contribuição.
- **IRRF** — tabela progressiva, com a isenção/redução para renda até R$ 7.350
  e escolha automática entre dedução legal (INSS) ou desconto simplificado
  mensal, o que for mais vantajoso.
- **FGTS** — 8% do salário bruto (custo do empregador no regime CLT).
- **13º salário** — reserva mensal equivalente a 1/12 do salário.
- **Férias** — reserva mensal equivalente a 1/12 do salário.
- **1/3 constitucional de férias** — reserva mensal equivalente a 1/36 do salário.

O app soma as reservas marcadas e mostra o valor líquido estimado que
sobraria para o PJ, comparável ao salário líquido de um CLT. É um SPA React
(Create React App) sem backend, sem banco de dados e sem autenticação — todo
o cálculo acontece no navegador. A lógica de cálculo fica isolada em
`src/businessRules.js` (com testes em `src/businessRules.test.js`), e a
interface em `src/App.js`.

## Como rodar localmente

```bash
npm install
npm start   # inicia o app em modo de desenvolvimento (http://localhost:3000)
npm test    # roda os testes das regras de negócio
npm run build   # gera a build de produção em build/
```

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
