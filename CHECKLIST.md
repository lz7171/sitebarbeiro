# 📋 Checklist de Deploy & Troubleshooting

## ✅ Checklist Pré-Deploy Vercel

### Ambiente & Configuração

- [ ] Rodou `bash setup.sh` com sucesso
- [ ] `barbearia/.env.local` existe e está preenchido
- [ ] `admin/.env.local` existe e está preenchido
- [ ] JWT_SECRET possui pelo menos 64 caracteres
- [ ] ADMIN_PASSWORD_HASH começa com `$2a$12$`
- [ ] Repositório está commitado (`git log`)

### Apps Testadas Localmente

**Cliente (barbearia):**
- [ ] `npm run dev` inicia sem erros
- [ ] `http://localhost:3000` carrega
- [ ] Página de agendamento aparece
- [ ] Botão "Agendar" funciona

**Admin (admin):**
- [ ] `npm run dev` inicia sem erros (porta 3001)
- [ ] `http://localhost:3001` carrega login
- [ ] Credenciais (admin/admin123) funcionam
- [ ] Dashboard carrega após autenticação

### Supabase

- [ ] Projeto criado em [supabase.com](https://supabase.com)
- [ ] SQL setup executado (supabase-setup.sql)
- [ ] Tabelas criadas: `appointments`, `available_slots`, `admin_settings`
- [ ] RLS policies ativas
- [ ] Chaves de API copiadas corretamente

### Código

- [ ] `npm run build` funciona em ambas apps
- [ ] `npm run lint` sem erros
- [ ] Nenhum `console.log()` sensível em produção
- [ ] `.env.local` está em `.gitignore` (não commitado)

### Vercel

- [ ] Conta Vercel criada e verificada
- [ ] Repositório GitHub conectado
- [ ] Domínios personalizados configurados (opcional)
- [ ] DNS propagou (5-48 horas)

---

## 🔧 Troubleshooting

### Build falha com "Module not found"

**Problema:** `Error: Cannot find module 'next'`

**Solução:**
```bash
# No diretório do problema (barbearia ou admin)
npm install
npm run build
```

### "Cannot find variable JWT_SECRET"

**Problema:** Erro de runtime sobre variáveis de ambiente

**Solução:**
```bash
# Verifique .env.local
cat barbearia/.env.local

# Recrie se necessário
bash setup.sh
```

### "Database connection refused"

**Problema:** Conexão com Supabase falha

**Solução:**
1. Verifique `NEXT_PUBLIC_SUPABASE_URL` (deve ser URL completa)
2. Verifique `SUPABASE_SERVICE_ROLE_KEY` (não confunda com anon key)
3. Teste no Supabase Dashboard:
   - SQL Editor → rode um simples `SELECT 1`
   - Verifique RLS policies

### "Port 3000/3001 já está em uso"

**Problema:** Outra app rodando na porta

**Solução:**
```bash
# Encontre o processo
lsof -i :3000
lsof -i :3001

# Mate o processo
kill -9 <PID>

# Ou use porta diferente
npm run dev -- -p 3002
```

### "Login fails with 401"

**Problema:** Credenciais não funcionam

**Solução:**
1. Verifique `ADMIN_PASSWORD_HASH` em ambos `.env.local`
2. Se diferente entre apps, será problema
3. Recrie hash:
   ```bash
   cd barbearia
   node -e "const b=require('bcryptjs'); console.log(b.hashSync('admin123',12))"
   ```
4. Atualize ambos `.env.local` com o mesmo hash

### "Next.js 14.2.3 has security vulnerability"

**Problema:** Aviso npm sobre versão desatualizada

**Solução:** (Opcional, mas recomendado)
```bash
# Em barbearia/
npm update next

# Em admin/
npm update next
```

### "Middlew are not executing"

**Problema:** Rotas `/dashboard/*` não estão protegidas

**Solução:**
1. Verifique `middleware.ts` está na raiz (não em pasta)
2. Verifique matcher em middleware:
   ```typescript
   export const config = {
     matcher: ['/dashboard/:path*', '/api/admin/:path*'],
   }
   ```
3. Rebuild: `npm run build`

### "Rate limit não funciona"

**Problema:** Usuário consegue fazer muitas tentativas de login

**Solução:**
1. Taxa está em-memória (reseta ao redeployed)
2. Para produção, considere Redis (Upstash)
3. Teste local:
   ```bash
   # Tente login 6+ vezes rapidamente
   # Deve bloquear na 6ª tentativa
   ```

---

## 📱 Testar APIs

### Listar slots disponíveis

```bash
curl "http://localhost:3000/api/slots?date=2025-03-01"
```

**Esperado:**
```json
{
  "slots": [
    { "id": "...", "time": "09:00", "is_available": true },
    { "id": "...", "time": "10:00", "is_available": true }
  ]
}
```

### Criar agendamento

```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "phone": "11987654321",
    "date": "2025-03-01",
    "time": "09:00"
  }'
```

**Esperado:**
```json
{
  "success": true,
  "appointment": { "id": "...", "name": "João Silva", ... }
}
```

### Fazer login

```bash
curl -X POST http://localhost:3001/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

**Esperado:**
```json
{ "success": true }
```

---

## 🧹 Limpar Cache & Rebuild

### Remover .next (Dev Cache)

```bash
cd barbearia && rm -rf .next
cd admin && rm -rf .next
```

### Fresh install

```bash
cd barbearia
rm -rf node_modules package-lock.json
npm install

cd ../admin
rm -rf node_modules package-lock.json
npm install
```

### Limpar Vercel Cache

Vercel Dashboard:
1. Seu projeto
2. Settings → Git
3. Clique em "Redeploy"

---

## 📊 Monitoramento Vercel

**Logs em tempo real:**
1. Vercel Dashboard → Seu projeto
2. Deployments → Última deploy
3. Clique em "View Logs"

**Performance:**
1. Analytics → Core Web Vitals
2. Functions → API latency

**Alertas:**
1. Settings → Integrations
2. Adicione Slack/Discord para notificações

---

## 🆘 Quando tudo falha

1. **Verifique git status:**
   ```bash
   git status
   git log --oneline -5
   ```

2. **Limpe tudo:**
   ```bash
   rm -rf barbearia/.next admin/.next
   rm -rf barbearia/node_modules admin/node_modules
   bash setup.sh
   npm run dev
   ```

3. **Abra uma issue com:**
   - Output completo do erro
   - `.env.local` (com chaves substituídas por XXX)
   - Versões do Node e npm
   - Verifica a última linha do seu `.gitignore`

---

## 🎓 Referências Rápidas

| Problema | Comando |
|----------|---------|
| Verificar portas | `lsof -i :3000` |
| Ver variáveis | `cat .env.local` |
| Testar build | `npm run build` |
| Lint | `npm run lint` |
| Atualizar deps | `npm update` |
| Limpar tudo | `bash setup.sh` |

---

**Pronto para ir para produção?**
- [ ] Todos os itens do checklist ✅
- [ ] Documentação lida
- [ ] Vercel conectado
- [ ] Domínios configurados

**Boa sorte! 🚀**
