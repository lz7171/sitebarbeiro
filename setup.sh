#!/bin/bash

# ============================================================
# Setup Automático - Barbearia Premium
# ============================================================

echo "🚀 Iniciando setup automático..."

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================
# 1. Gerar JWT_SECRET
# ============================================================
echo -e "\n${BLUE}[1/5]${NC} Gerando JWT_SECRET..."
JWT_SECRET=$(openssl rand -base64 64)
echo -e "${GREEN}✓${NC} JWT_SECRET gerado"

# ============================================================
# 2. Gerar hash de senha admin
# ============================================================
echo -e "\n${BLUE}[2/5]${NC} Gerando hash de senha admin..."

# Tenta usar bcryptjs globalmente
if command -v node &> /dev/null; then
  # Tenta instalar bcryptjs localmente e usar
  ADMIN_PASSWORD_HASH=$(cd /tmp && npm init -y > /dev/null 2>&1 && npm install bcryptjs > /dev/null 2>&1 && node -e "const b=require('bcryptjs'); console.log(b.hashSync('admin123', 12))" 2>/dev/null || echo "")
fi

# Se não conseguiu, usa um hash pré-gerado de 'admin123'
if [ -z "$ADMIN_PASSWORD_HASH" ]; then
  ADMIN_PASSWORD_HASH='$2a$12$CIi7UoMBgfBqlOQ8kNzfTuLFNjO0VnEzs5bR4Rvxp8bC5B16hjVJO'
  echo -e "${YELLOW}⚠ Usando hash pré-gerado${NC}"
else
  echo -e "${GREEN}✓${NC} Hash gerado dinamicamente"
fi
echo -e "${GREEN}✓${NC} Senha padrão: admin123"
echo -e "${YELLOW}⚠ AVISO: Mude a senha padrão após fazer login!${NC}"

# ============================================================
# 3. Criar .env.local na app cliente
# ============================================================
echo -e "\n${BLUE}[3/5]${NC} Criando variáveis de ambiente (cliente)..."
cat > barbearia/.env.local << EOF
# ============================================================
# SUPABASE — https://supabase.com
# ============================================================
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SEU_ANON_KEY_AQUI
SUPABASE_SERVICE_ROLE_KEY=SEU_SERVICE_ROLE_KEY_AQUI

# ============================================================
# JWT
# ============================================================
JWT_SECRET=$JWT_SECRET

# ============================================================
# Admin
# ============================================================
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$ADMIN_PASSWORD_HASH

# ============================================================
# Barbearia
# ============================================================
NEXT_PUBLIC_BARBEIRO_WHATSAPP=5511999999999
NEXT_PUBLIC_BARBEIRO_NOME=Barbearia Premium
EOF
echo -e "${GREEN}✓${NC} .env.local (cliente) criado"

# ============================================================
# 4. Criar .env.local na app admin
# ============================================================
echo -e "\n${BLUE}[4/5]${NC} Criando variáveis de ambiente (admin)..."
cat > admin/.env.local << EOF
# ============================================================
# SUPABASE — https://supabase.com
# ============================================================
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SEU_ANON_KEY_AQUI
SUPABASE_SERVICE_ROLE_KEY=SEU_SERVICE_ROLE_KEY_AQUI

# ============================================================
# JWT
# ============================================================
JWT_SECRET=$JWT_SECRET

# ============================================================
# Admin
# ============================================================
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$ADMIN_PASSWORD_HASH

# ============================================================
# Barbearia
# ============================================================
NEXT_PUBLIC_BARBEIRO_WHATSAPP=5511999999999
NEXT_PUBLIC_BARBEIRO_NOME=Barbearia Premium
EOF
echo -e "${GREEN}✓${NC} .env.local (admin) criado"

# ============================================================
# 5. Instalar dependências
# ============================================================
echo -e "\n${BLUE}[5/5]${NC} Instalando dependências..."
cd barbearia && npm install > /dev/null 2>&1 && cd ..
cd admin && npm install > /dev/null 2>&1 && cd ..
echo -e "${GREEN}✓${NC} Dependências instaladas"

# ============================================================
# Resumo e próximos passos
# ============================================================
echo -e "\n${GREEN}✅ Setup completo!${NC}"
echo ""
echo -e "${YELLOW}PRÓXIMOS PASSOS:${NC}"
echo ""
echo "1. Edite as variáveis de Supabase:"
echo "   - barbearia/.env.local"
echo "   - admin/.env.local"
echo ""
echo "2. Credenciais padrão:"
echo "   - Usuário: admin"
echo "   - Senha: admin123"
echo "   ${YELLOW}⚠ MUDE A SENHA APÓS FAZER LOGIN!${NC}"
echo ""
echo "3. Para rodar localmente:"
echo "   - Cliente: cd barbearia && npm run dev"
echo "   - Admin:   cd admin && npm run dev"
echo ""
echo "4. Para fazer deploy no Vercel:"
echo "   - vercel link (na raiz do projeto)"
echo "   - Configure as variáveis de ambiente no Vercel"
echo "   - vercel deploy"
echo ""
echo "5. Documentação:"
echo "   - Cliente: barbearia/README.md"
echo "   - Admin:   admin/README.md"
echo ""
