# ✂️ Barbearia Premium — Sistema Completo

**Sistema de agendamento online split em duas apps separadas:**
- 🌐 **Frontend Cliente** — Site de agendamento (barbearia/)
- 🔐 **Painel Admin** — Gerenciamento completo (admin/)

Stack: Next.js 14 · TypeScript · Tailwind · Supabase · Vercel

---

## 🚀 Quick Start

### 1️⃣ Clone e configure

```bash
# Clonar repo
git clone https://github.com/seu-repo/sitebarbeiro.git
cd sitebarbeiro

# Setup automático (recomendado)
bash setup.sh
```

**O que o script faz:**
- ✅ Gera JWT_SECRET aleatório
- ✅ Gera hash de senha bcrypt
- ✅ Cria `.env.local` em ambas as apps
- ✅ Instala todas as dependências

### 2️⃣ Configure Supabase

1. Crie projeto em [supabase.com](https://supabase.com)
2. Copie as chaves (URL, anon key, service role key)
3. Edite os `.env.local`:
   - `barbearia/.env.local`
   - `admin/.env.local`

### 3️⃣ Rodar Localmente

```bash
# Terminal 1 — Frontend Cliente
cd barbearia
npm run dev
# http://localhost:3000

# Terminal 2 — Painel Admin
cd admin
npm run dev
# http://localhost:3001
```

### 4️⃣ Deploy no Vercel

```bash
# App Cliente
cd barbearia
vercel deploy --prod

# App Admin
cd admin
vercel deploy --prod
```

---

## 📁 Estrutura do Monorepo

```
sitebarbeiro/
├── barbearia/              # App cliente (agendamento)
│   ├── app/
│   │   ├── page.tsx        → Homepage com booking
│   │   ├── api/
│   │   │   ├── slots       → GET horários disponíveis
│   │   │   └── appointments → POST novo agendamento
│   │   └── admin/          → Integração admin (removida em breve)
│   ├── components/
│   │   └── client/
│   │       └── BookingPage.tsx
│   ├── lib/
│   ├── middleware.ts       → Proteção de rotas
│   ├── package.json
│   └── README.md
│
├── admin/                  # App admin (painel separado)
│   ├── app/
│   │   ├── page.tsx        → Login
│   │   ├── dashboard/      → Dashboard principal
│   │   └── api/
│   │       └── admin/
│   │           ├── login/      → Autenticação
│   │           ├── appointments/
│   │           ├── slots/
│   │           └── settings/
│   ├── components/
│   │   └── admin/
│   │       ├── AdminLoginClient.tsx
│   │       └── AdminDashboard.tsx
│   ├── lib/
│   ├── middleware.ts       → Proteção de rotas /dashboard
│   ├── package.json
│   └── README.md
│
├── setup.sh                # Script setup automático
├── vercel.json             # Configuração Vercel (2 apps)
└── README.md               # Este arquivo
```

---

## ⚙️ Configuração Vercel

O `vercel.json` já está configurado para fazer deploy de ambas as apps:

```json
{
  "projects": [
    { "rootDirectory": "barbearia", "name": "site-cliente" },
    { "rootDirectory": "admin", "name": "painel-admin" }
  ]
}
```

**Na dashboard do Vercel:**
1. Conecte o repo
2. Configure ambos os deployments
3. Adicione as variáveis de ambiente para cada app

---

## 🔐 Credenciais Padrão

Geradas automaticamente pelo `setup.sh`:

| Campo | Valor |
|-------|-------|
| Usuário | `admin` |
| Senha | `admin123` |
| JWT Secret | Aleatório (64 chars) |
| Senha Hash | bcrypt (custo 12) |

> ⚠️ **IMPORTANTE**: Mude a senha padrão após primeiro login!

---

## 📋 Processo de Booking

```
Cliente Web
    ↓
1. Escolhe serviço (Corte R$ 20)
2. Escolhe data (próximos 30 dias)
3. Escolhe horário (slots disponíveis)
4. Escreve nome e telefone
5. Confirma
    ↓
Backend Valida
    ↓
- Zod validation
- Sanitização
- Rate limit
- Duplo agendamento?
    ↓
Salva no Supabase
    ↓
Redireciona para WhatsApp
```

---

## 🔒 Segurança

### Implementações

| Camada | Proteção |
|--------|----------|
| **Autenticação** | JWT + HttpOnly cookie |
| **Senha** | Bcrypt custo 12 |
| **Sessions** | 8 horas de validade |
| **Rate Limit** | 5 tentativas / 15min (login) |
| **Validação** | Zod server-side |
| **Sanitização** | Regex + remoção de caracteres |
| **Database** | Supabase RLS ativo |
| **HTTPS** | Automático Vercel |
| **Headers** | CSP, CORS, X-Frame-Options |
| **SQL** | Prepared statements |

### Checklist Pré-Deploy

- [ ] Senha admin alterada
- [ ] JWT_SECRET único gerado
- [ ] Variáveis Supabase configuradas
- [ ] HTTPS ativo na produção
- [ ] Dados sensíveis NÃO no git
- [ ] Rate limit testado

---

## 📚 Documentação

- **[Client App](./barbearia/README.md)** — Frontend de agendamento
- **[Admin App](./admin/README.md)** — Painel administrativo

---

## 🛠️ Tecnologias

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript strict
- **Styling**: Tailwind CSS + PostCSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: JWT + bcrypt
- **Validation**: Zod
- **Hosting**: Vercel
- **Rate Limit**: In-memory (Redis ready)

---

## 🤝 Contribuindo

1. Clone o repo
2. Rode `bash setup.sh`
3. Configure Supabase
4. Crie branch: `git checkout -b feature/sua-feature`
5. Commit: `git commit -m "feat: descrição"`
6. Push: `git push origin feature/sua-feature`
7. Abra PR

---

## 📞 Suporte

- 📖 Leia os READMEs das apps individuais
- 🐛 Reporte bugs com detalhes
- 💡 Sugira melhorias nas issues

---

## 📄 Licença

MIT License — veja LICENSE para detalhes.

---

## 🎯 Roadmap

- [ ] Dashboard com gráficos
- [ ] Export relatórios (PDF)
- [ ] SMS para confirmação
- [ ] Integração Google Calendar
- [ ] Backup automático
- [ ] Múltiplos prestadores
- [ ] App mobile (React Native)

---

**© 2025 Barbearia Premium** — Desenvolvido com ❤️