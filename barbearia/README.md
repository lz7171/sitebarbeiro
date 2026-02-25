# ✂️ Barbearia Premium — Sistema de Agendamento

Sistema de agendamento online completo para barbearia.
Next.js 14 · TypeScript · Tailwind CSS · Supabase · Vercel

---

## 🚀 Deploy em 10 minutos

### 1. Supabase (banco de dados)

1. Acesse https://supabase.com e crie um projeto gratuito
2. No painel, vá em **SQL Editor**
3. Cole e execute todo o conteúdo de `supabase-setup.sql`
4. Em **Project Settings → API**, copie:
   - `Project URL`
   - `anon public` key
   - `service_role` key (mantenha em segredo!)

---

### 2. Variáveis de Ambiente

Crie `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key

# Gere com: openssl rand -base64 64
JWT_SECRET=string_aleatoria_muito_longa_aqui_minimo_64_caracteres

# Hash bcrypt da sua senha — gere assim:
# node -e "const b=require('bcryptjs'); console.log(b.hashSync('SUASENHA',12))"
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$12$HASH_AQUI

NEXT_PUBLIC_BARBEIRO_WHATSAPP=5511999999999
NEXT_PUBLIC_BARBEIRO_NOME=Barbearia Premium
```

> ⚠️ **NUNCA** versione o `.env.local`. Ele está no `.gitignore`.

---

### 3. Gerar hash da senha

No terminal (com Node instalado):

```bash
node -e "const b=require('bcryptjs'); console.log(b.hashSync('MINHA_SENHA_AQUI', 12))"
```

Cole o resultado em `ADMIN_PASSWORD_HASH`.

---

### 4. Rodar localmente

```bash
npm install
npm run dev
```

Acesse:
- Site cliente: http://localhost:3000
- Login admin: http://localhost:3000/admin-login-secreto-nao-divulgar

---

### 5. Deploy na Vercel

```bash
# Instale a CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Adicione as variáveis de ambiente na Vercel:**
- Acesse seu projeto no painel da Vercel
- Settings → Environment Variables
- Adicione todas as variáveis do `.env.local`

---

## 🔐 Segurança

| Camada | Implementação |
|--------|---------------|
| Senha admin | Hash bcrypt (custo 12) |
| Sessão | JWT HttpOnly cookie (8h) |
| Rate limit login | 5 tentativas / 15min → bloqueio 30min |
| Rate limit agendamentos | 5 / minuto por IP |
| Validação | Zod server-side em todas as rotas |
| Sanitização | Inputs higienizados antes de persistir |
| Duplo agendamento | Constraint UNIQUE no PostgreSQL |
| Valor do corte | Fixo no backend (R$ 20,00) — nunca do frontend |
| RLS | Supabase Row Level Security ativo |
| Headers | X-Frame-Options, CSP, nosniff, etc |
| Rota admin | URL oculta, não indexada |
| HTTPS | Automático pela Vercel |

---

## 📁 Estrutura

```
/app
  page.tsx                          → Site público (agendamento)
  layout.tsx                        → Layout raiz
  globals.css                       → Estilos globais
  /admin
    page.tsx                        → Painel admin (protegido)
  /admin-login-secreto-nao-divulgar
    page.tsx                        → Login admin
  /api
    /slots            GET           → Horários disponíveis (público)
    /appointments     POST          → Criar agendamento (público)
    /admin/login      POST          → Autenticação admin
    /admin/slots      GET/POST/DEL  → Gerenciar horários (protegido)
    /admin/appointments GET/DEL     → Gerenciar agendamentos (protegido)
    /admin/settings   GET/PATCH/DEL → Configurações (GET público, resto protegido)

/components
  /client
    BookingPage.tsx                 → Interface do cliente
  /admin
    AdminDashboard.tsx              → Painel do barbeiro
    AdminLoginClient.tsx            → Tela de login

/lib
  supabase.ts                       → Clientes Supabase
  auth.ts                           → JWT helpers
  rate-limit.ts                     → Rate limiter
  sanitize.ts                       → Sanitização de inputs
  validations.ts                    → Schemas Zod

/types
  index.ts                          → TypeScript interfaces

middleware.ts                       → Proteção de rotas /admin/*
supabase-setup.sql                  → Script SQL completo
```

---

## 🎯 Fluxo do cliente

1. **Escolhe serviço** → Corte Masculino (R$ 20,00)
2. **Escolhe data** → Calendário dos próximos 30 dias
3. **Escolhe horário** → Apenas horários liberados pelo barbeiro
4. **Preenche nome e telefone**
5. **Confirma** → Backend valida, salva, redireciona para WhatsApp

---

## 🔧 Painel do barbeiro

Acesso: `/admin-login-secreto-nao-divulgar`

- **Abrir/Fechar** barbearia (desativa botão de agendamento)
- **Criar horários** por data
- **Remover horários** individualmente
- **Ver agendamentos** filtrado por data com total do dia
- **Cancelar agendamentos** manualmente
- **Criar anúncios** que aparecem no topo do site

---

## ⚙️ Customização

Para trocar o nome da barbearia e WhatsApp, edite as variáveis:

```env
NEXT_PUBLIC_BARBEIRO_NOME=Barbearia do João
NEXT_PUBLIC_BARBEIRO_WHATSAPP=5511987654321
```

Para mudar o preço (fixo no servidor):

```typescript
// app/api/appointments/route.ts
const FIXED_PRICE = 25.00  // linha 12
const FIXED_SERVICE = 'Corte + Barba'  // linha 13
```

---

## 🛠 Tecnologias

- **Next.js 14** App Router
- **TypeScript** strict mode
- **Tailwind CSS** design system
- **Supabase** PostgreSQL + RLS
- **jose** JWT (mais seguro que jsonwebtoken em Edge Runtime)
- **bcryptjs** hash de senha
- **Zod** validação de schemas
- **Vercel** hosting + HTTPS automático
