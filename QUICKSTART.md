# 🚀 Quick Start — Desenvolvimento Local

Guia rápido para começar a desenvolver localmente.

---

## ⚡ 1 minuto setup

```bash
# Clone
git clone <seu-repo>
cd sitebarbeiro

# Setup automático
bash setup.sh

# Pronto!
```

---

## Rodar apps

### Opção A: 2 Terminais (Recomendado)

**Terminal 1 — Cliente:**
```bash
cd barbearia
npm run dev
```
📱 Abre em: `http://localhost:3000`

**Terminal 2 — Admin:**
```bash
cd admin
npm run dev
```
🔐 Abre em: `http://localhost:3001`

### Opção B: 1 Terminal com Background

```bash
cd barbearia && npm run dev &
cd ../admin && npm run dev &
```

Pare com: `killall node`

---

## Credenciais Padrão

- **Usuário:** `admin`
- **Senha:** `admin123`

> 🔒 Mude após primeiro login!

---

## Editar Código

### Estrutura:

**Cliente** (`barbearia/`)
```
app/page.tsx                     ← Página principal
components/client/BookingPage    ← Formulário agendamento
api/appointments, api/slots      ← APIs backend
```

**Admin** (`admin/`)
```
app/page.tsx                     ← Login page
app/dashboard/page.tsx           ← Dashboard (protegida)
components/admin/AdminDashboard  ← Interface admin
api/admin/*                      ← APIs admin
```

### Atualizar styles

Ambas usam Tailwind CSS. Edite direto em `.tsx`:

```tsx
// Antes
<button className="bg-blue-500 text-white">Agendar</button>

// Depois
<button className="bg-green-600 text-white px-4 py-2 rounded">
  Agendar Agora
</button>
```

### Criar nova rota API

**Cliente:**
```bash
touch barbearia/app/api/novo/route.ts
```

```typescript
// barbearia/app/api/novo/route.ts
export async function POST(req: Request) {
  const data = await req.json()
  return Response.json({ success: true, data })
}
```

**Admin:**
```bash
touch admin/app/api/admin/novo/route.ts
```

---

## Testes Rápidos

### Verificar se funciona

```bash
# Cliente
curl http://localhost:3000

# Admin login
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Ver logs do servidor

Ambas mostram logs direto no terminal onde rodou `npm run dev`.

Procure por:
- `✓ Ready in X.Xs` → Server iniciou
- `> GET /api/slots` → Request recebido
- Erros em vermelho

---

## Parar/Reiniciar

### Stop
```bash
# No terminal das apps:
Ctrl+C
```

### Restart
```bash
npm run dev
```

---

## Modificar Variáveis

Edite `.env.local` de cada app:

```bash
# Cliente
nano barbearia/.env.local

# Admin
nano admin/.env.local
```

**Depois redeploy:**
```bash
npm run dev  # Reinicia automaticamente
```

---

## Build para Produção

```bash
# Cliente
cd barbearia
npm run build
npm start  # Roda versão otimizada

# Admin
cd admin
npm run build
npm start
```

---

## Commitar Código

```bash
git add .
git commit -m "feat: adiciona novo recurso"
git push origin main
```

> Não commita `.env.local`! (Já está em .gitignore)

---

## Palavras-Chave

| Comando | O que faz |
|---------|-----------|
| `npm run dev` | Dev server (hot reload) |
| `npm run build` | Build para produção |
| `npm start` | Roda build compilado |
| `npm run lint` | Verifica erros TypeScript |
| `npm install` | Instala dependências |

---

## 🐛 Debug

### Ver variáveis carregadas

Adicione em qualquer página/API:

```typescript
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
```

Verá no console onde rodou `npm run dev`.

### Abrir DevTools Frontend

Cliente: `F12` no navegador
Admin: `F12` no navegador

### Network tab

No DevTools:
1. Clique em **Network**
2. Faça uma ação (agendamento, login)
3. Veja requisição e resposta

---

## 🎨 Customizar Ui

**Cores:** Edit `tailwind.config.ts`

```typescript
theme: {
  colors: {
    primary: '#FF6B35',  // Cor principal
  }
}
```

**Fonts:** Edit `app/layout.tsx`

```typescript
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
```

---

## 📚 Docs

- [Next.js](https://nextjs.org/docs)
- [Tailwind](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs)
- [Supabase](https://supabase.com/docs)

---

**Pronto? Vamos!** 🎉

```bash
bash setup.sh && echo "✅ Tudo certo!"
```
