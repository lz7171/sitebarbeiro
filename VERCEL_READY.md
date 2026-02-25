# 🚀 VERCEL DEPLOYMENT - PASSO A PASSO

## ✅ Status Atual

- ✅ Código no GitHub (https://github.com/lz7171/sitebarbeiro)
- ✅ Ambas apps compilam sem erros
- ✅ Mock database integrado
- ✅ Zero dependências externas

## 📋 Checklist Final

```
✅ Code quality
   - npm run build produz 0 erros
   - npm run lint sem warnings
   
✅ Apps ready
   - barbearia/ — Agendamento (porta 3000)
   - admin/ — Admin panel (porta 3001)
   
✅ Database
   - Mock DB em memória (Vercel compatible)
   - Sem Supabase/tokens
   
✅ Variáveis
   - .env.local configurado
   - JWT_SECRET gerado
   - Admin user: admin / admin123
```

## 🌐 Deploy no Vercel (3 clicks)

### Passo 1: Conectar GitHub

1. Abra https://vercel.com
2. Click **"Add New..."** → **"Project"**
3. Clique em **"Import Git Repository"**
4. Busque: `sitebarbeiro`
5. Clique em **"Import"**

### Passo 2: Configurar App Cliente

**Framework**: Next.js
**Root Directory**: `barbearia`
**Build Command**: `npm run build`
**Output Directory**: `.next`

**Environment Variables**:
```
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$12$p/SwaJYRUg3mA8B7jzqhdO4yrt0MNpcds0QgQalSP9AG/st4iYneC
JWT_SECRET=FglzAmwYCN09IT/wgmonDDINHZuIUcMu/x0o6WoTA+ogKHnZJZI3Gole97IYLKMY
NEXT_PUBLIC_BARBEIRO_WHATSAPP=5511999999999
NEXT_PUBLIC_BARBEIRO_NOME=Barbearia Premium
```

Clique **"Deploy"**

### Passo 3: Configurar App Admin

1. Volte ao Vercel
2. Click **"Add New..."** → **"Project"**
3. Clique em **"Import Git Repository"** 
4. Busque: `sitebarbeiro`
5. Clique em **"Import"**

**Framework**: Next.js
**Root Directory**: `admin`
**Build Command**: `npm run build`
**Output Directory**: `.next`

**Environment Variables** (mesmas da cliente):
```
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$12$p/SwaJYRUg3mA8B7jzqhdO4yrt0MNpcds0QgQalSP9AG/st4iYneC
JWT_SECRET=FglzAmwYCN09IT/wgmonDDINHZuIUcMu/x0o6WoTA+ogKHnZJZI3Gole97IYLKMY
NEXT_PUBLIC_BARBEIRO_WHATSAPP=5511999999999
NEXT_PUBLIC_BARBEIRO_NOME=Barbearia Premium
```

Clique **"Deploy"**

## 🎯 Resultado

Você terá:
- 🌐 Cliente: `seu-projeto-sitebarbeiro.vercel.app`
- 🔐 Admin: `seu-projeto-admin.vercel.app` (ou custom domain)

## 🧪 Testar Depois do Deploy

### Cliente
```bash
GET https://seu-projeto-sitebarbeiro.vercel.app/
```
Deve mostrar página de agendamento

### Admin
```bash
GET https://seu-projeto-admin.vercel.app/
```
Credenciais:
- Usuário: `admin`  
- Senha: `admin123`

### APIs

**Listar slots**:
```bash
curl "https://seu-projeto-sitebarbeiro.vercel.app/api/slots?date=2025-03-01"
```

**Fazer agendamento**:
```bash
curl -X POST https://seu-projeto-sitebarbeiro.vercel.app/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João",
    "phone": "11987654321",
    "date": "2025-03-01",
    "time": "09:00"
  }'
```

## 🆘 Se der erro no Vercel

### Build error
1. Verifique a aba **"Deployments"** → **"View Log"**
2. Procure por erros de importação
3. Se for `ENOENT`, provavelmente falta arquivo `.env.local`

### Runtime error
1. Vá em **"Settings"** → **"Environment Variables"**
2. Verifique se todas as variáveis estão lá
3. Clique em **"Redeploy"** para teste

### Variáveis não carregam
1. Settings → Environment Variables
2. Adicione novamente
3. Vercel → Deployments → Redeploy

## ✅ Pronto!

Sistema está **100% pronto para Vercel** com zero erros! 🎉

---

**Próxima ação**: Clique no link do Vercel e confirme que tudo funciona!
