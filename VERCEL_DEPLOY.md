# 🌐 Guia de Deploy no Vercel

Passo a passo para fazer deploy das duas apps no Vercel.

---

## 1️⃣ Preparar Repositório

```bash
# Certifique-se de que tudo está commitado
git status

# Setup automático (se não feito)
bash setup.sh

# Commit
git add .
git commit -m "Setup completo com 2 apps"
git push origin main
```

---

## 2️⃣ Deploy App Cliente (Barbearia)

### No Vercel Dashboard

1. Abra [vercel.com](https://vercel.com)
2. Clique **"Add New..."** → **"Project"**
3. Selecione o repositório `sitebarbeiro`
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `barbearia`
   - **Name**: `barbearia-cliente` (ou seu domínio)

### Adicione Variáveis de Ambiente

Settings → Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
JWT_SECRET=sua-string-longa-64-chars
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$12$seu-hash-bcrypt
NEXT_PUBLIC_BARBEIRO_WHATSAPP=5511999999999
NEXT_PUBLIC_BARBEIRO_NOME=Barbearia Premium
```

### Deploy

Clique **"Deploy"**

Salve a URL: `https://seu-dominio.vercel.app`

---

## 3️⃣ Deploy App Admin

### No Vercel Dashboard

1. Clique **"Add New..."** → **"Project"**
2. Selecione o repositório `sitebarbeiro` novamente
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `admin`
   - **Name**: `barbearia-admin` (ou seu domínio)

### Adicione as MESMAS Variáveis

Settings → Environment Variables

(Copy das variáveis da app cliente)

### Deploy

Clique **"Deploy"**

Salve a URL: `https://seu-dominio-admin.vercel.app`

---

## 4️⃣ Configurar Dominios Personalizados (Opcional)

### Adicionar Domínio Principal

1. Na app cliente, vá para **Settings**
2. **Domains** → **Add**
3. Digite seu domínio: `www.meubarbeiro.com`
4. Siga as instruções de DNS

### Adicionar Subdomínio Admin

1. Na app admin, vá para **Settings**
2. **Domains** → **Add**
3. Digite: `admin.meubarbeiro.com`
4. Configure DNS como indicado

---

## 5️⃣ Configurar DNS

Depende do seu registrador (GoDaddy, Route53, Cloudflare, etc.)

**Exemplo com Cloudflare:**

1. Acesse seu painel Cloudflare
2. Vá para **DNS**
3. Adicione registros:

```
CNAME  www    → cname.vercel-dns.com
CNAME  admin  → cname.vercel-dns.com
```

O Vercel fornecerá os CNAME exatos no painel.

---

## ✅ Checklist Final

- [ ] Ambas as apps deployadas
- [ ] Variáveis de ambiente setadas
- [ ] Domínios personalizados ativos
- [ ] DNS propagou (5-48 horas)
- [ ] HTTPS ativo (automático)
- [ ] Email de confirmação Vercel recebido
- [ ] Páginas respondem (sem erro 500)
- [ ] Autenticação funcionando
- [ ] Agendamentos salvam no Supabase

---

## 🧪 Testes

### App Cliente

```
GET https://seu-dominio.vercel.app/
```

Deve exibir a página de agendamento.

### App Admin

```
GET https://admin.seu-dominio.vercel.app/
```

Deve exibir o login.

**Credenciais padrão:**
- Usuário: `admin`
- Senha: `admin123`

---

## 🔧 Troubleshooting

### "Build failed"

- Verifique variáveis de ambiente
- Verifique sintaxe do `.env.local`
- Check logs do Vercel

### "Module not found"

- Rode `npm install` localmente
- Verifique imports (case-sensitive em Linux!)

### "Database connection error"

- Verifique Supabase URL
- Verifique chaves de API
- Verifique RLS policies

### "Page not found (404)"

- Limpe cache: Settings → Purge
- Redeploye: Deployments → Redeploy

---

## 📊 Monitorar Performance

**No Vercel Dashboard:**

1. Abra a app
2. Analytics → veja Core Web Vitals
3. Deployments → veja builds anteriores
4. Functions → veja API latency

---

## 🔄 Atualizar depois

Qualquer mudança no código:

```bash
git add .
git commit -m "fix: algo"
git push origin main
```

Vercel detecta automaticamente e faz redeploy!

---

## 🆘 Suporte Vercel

- Documentação: https://vercel.com/docs
- Status: https://www.vercel-status.com
- Email: support@vercel.com

---

**Está tudo funcionando? 🎉**

Seu sistema de agendamento está online!

- 🌐 Cliente: Seu domínio principal
- 🔐 Admin: Seu subdomínio admin
- ⚡ 99.9% uptime
- 📊 Analytics inclusos
