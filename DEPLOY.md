# Deploy — Versatti Contábil

- **Backend** (NestJS) + **PostgreSQL** + **Redis** + **volume de arquivos** → [Railway](https://railway.com)
- **Frontend** (Vite/React) → [Vercel](https://vercel.com)

Ambos fazem deploy automático a cada push na branch configurada (sugestão: `main`).

---

## 0. Antes de começar

1. O código precisa estar no GitHub, na branch que será publicada (`main`).
2. Gere um `JWT_SECRET` forte (não reutilize o de desenvolvimento):
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
3. Tenha em mãos as credenciais de SMTP (veja a seção de e-mail no `backend/.env.example`).

---

## 1. Railway — banco, Redis e backend

1. Crie um projeto em railway.com → **New Project → Deploy from GitHub repo** → selecione `versatti-contabil`.
2. No serviço criado (o backend), em **Settings**:
   - **Root Directory:** `/backend`
   - **Config file path:** `/backend/railway.json` (o Railway não procura o arquivo dentro do Root Directory sozinho)
   - **Branch:** `main`
3. No projeto, **+ Create → Database → PostgreSQL** e **+ Create → Database → Redis**.
4. **Volume para os documentos** (sem ele, todo arquivo enviado some no próximo deploy):
   clique com o botão direito no serviço do backend → **Attach Volume** → **Mount path:** `/data`
5. No backend, aba **Variables**, adicione:

   | Variável | Valor |
   |---|---|
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
   | `REDIS_URL` | `${{Redis.REDIS_URL}}` |
   | `STORAGE_PATH` | `/data/uploads` |
   | `JWT_SECRET` | o valor gerado no passo 0 |
   | `NODE_ENV` | `production` |
   | `CORS_ORIGINS` | a URL da Vercel (passo 3 abaixo); pode deixar para depois |
   | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | dados do SMTP |

   As referências `${{...}}` usam a rede privada do Railway (sem SSL, `DB_SSL` fica de fora).

6. Em **Settings → Networking → Generate Domain** para ganhar uma URL pública, ex: `versatti-backend-production.up.railway.app`.
7. Faça o deploy (**Deploy** ou um push). Cada deploy:
   - roda `yarn build`
   - roda as migrations (`yarn migration:run:prod`) **antes** de trocar a versão — se uma migration falhar, a versão antiga continua no ar
   - sobe com `yarn start:prod` e só libera o tráfego quando `GET /health` responder

   Teste: abra `https://SUA-URL-RAILWAY/health` → deve mostrar `{"status":"ok"}`.

---

## 2. Primeiro usuário administrador

O banco de produção começa vazio. Crie o primeiro admin pela mesma forma usada no desenvolvimento
(rota de cadastro / insert no banco). Para acessar o Postgres do Railway pelo seu computador,
use **Postgres → Connect → Public Network** (essa conexão exige SSL).

---

## 3. Vercel — frontend

1. Em vercel.com → **Add New → Project** → importe `versatti-contabil`.
2. **Root Directory:** `frontend` (o `vercel.json` já define build, saída e as rotas do React).
3. **Environment Variables:**

   | Variável | Valor |
   |---|---|
   | `VITE_API_PROD` | `https://SUA-URL-RAILWAY` (sem barra no final) |
   | `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_PUBLIC_KEY` | os mesmos do `.env` local (recuperação de senha) |

4. **Deploy.** A Vercel gera a URL, ex: `versatti-contabil.vercel.app`.
5. Volte ao Railway e coloque essa URL em `CORS_ORIGINS` (ex: `https://versatti-contabil.vercel.app`).
   O backend reinicia sozinho.

> Variáveis `VITE_*` entram no build: depois de alterar alguma na Vercel, faça **Redeploy**.

---

## 4. Checklist pós-deploy

- [ ] `https://SUA-URL-RAILWAY/health` responde `ok`
- [ ] Login funciona no front publicado
- [ ] Recarregar a página em `/documents` ou `/dashboard` não dá 404
- [ ] Enviar um documento e baixá-lo de volta
- [ ] Fazer um novo deploy do backend e confirmar que o documento **continua** baixando (prova de que o volume funciona)
- [ ] Envio de e-mail ao responsável chega (e não cai no spam)
- [ ] Nenhum aviso `SMTP não configurado` nos logs do Railway

---

## Domínio próprio (depois)

- Vercel: **Settings → Domains** → ex: `app.seudominio.com.br`
- Railway: **Settings → Networking → Custom Domain** → ex: `api.seudominio.com.br`
- Atualize `VITE_API_PROD` (Vercel, com redeploy) e `CORS_ORIGINS` (Railway).

## Backup

O volume e o Postgres do Railway têm backups configuráveis em cada serviço (**Backups**).
Ative os dois: o banco tem os registros e o volume tem os arquivos — um sem o outro não restaura os documentos.
