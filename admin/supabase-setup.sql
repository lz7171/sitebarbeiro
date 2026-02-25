-- ============================================================
-- SETUP DO BANCO — Execute no SQL Editor do Supabase
-- ============================================================

-- 1. TABELA: appointments
-- ============================================================
CREATE TABLE IF NOT EXISTS appointments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(100) NOT NULL,
  phone       VARCHAR(15)  NOT NULL,
  date        DATE         NOT NULL,
  time        TIME         NOT NULL,
  service     VARCHAR(100) NOT NULL DEFAULT 'Corte Masculino',
  price       DECIMAL(10,2) NOT NULL DEFAULT 20.00,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Garante ZERO conflito de horários — constraint no banco (camada mais segura)
ALTER TABLE appointments
  ADD CONSTRAINT appointments_date_time_unique UNIQUE (date, time);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments (date);
CREATE INDEX IF NOT EXISTS idx_appointments_created ON appointments (created_at DESC);


-- 2. TABELA: available_slots
-- ============================================================
CREATE TABLE IF NOT EXISTS available_slots (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  date         DATE    NOT NULL,
  time         TIME    NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true
);

-- Impede slots duplicados para mesma data/hora
ALTER TABLE available_slots
  ADD CONSTRAINT slots_date_time_unique UNIQUE (date, time);

CREATE INDEX IF NOT EXISTS idx_slots_date ON available_slots (date, is_available);


-- 3. TABELA: settings
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  id           INTEGER PRIMARY KEY DEFAULT 1,  -- sempre 1 linha
  is_open      BOOLEAN NOT NULL DEFAULT true,
  announcement TEXT
);

-- Garante que exista exatamente 1 linha
ALTER TABLE settings ADD CONSTRAINT settings_singleton CHECK (id = 1);

-- Insere configuração inicial
INSERT INTO settings (id, is_open, announcement)
VALUES (1, true, NULL)
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Ativa RLS em todas as tabelas
ALTER TABLE appointments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE available_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings        ENABLE ROW LEVEL SECURITY;

-- appointments: só o service role (backend) pode ler/escrever
-- O cliente público NÃO tem acesso direto
CREATE POLICY "Backend only - appointments"
  ON appointments
  FOR ALL
  USING (false)   -- bloqueia leitura pelo anon
  WITH CHECK (false);  -- bloqueia escrita pelo anon

-- available_slots: leitura pública, escrita apenas backend
CREATE POLICY "Public read - slots"
  ON available_slots
  FOR SELECT
  USING (true);

CREATE POLICY "Backend write - slots"
  ON available_slots
  FOR INSERT
  USING (false)
  WITH CHECK (false);

-- settings: leitura pública (para saber se está aberto/anúncio)
CREATE POLICY "Public read - settings"
  ON settings
  FOR SELECT
  USING (true);

CREATE POLICY "Backend write - settings"
  ON settings
  FOR UPDATE
  USING (false)
  WITH CHECK (false);


-- ============================================================
-- 5. FUNÇÃO UTILITÁRIA: limpar slots passados (opcional)
-- Execute manualmente ou agende com pg_cron se disponível
-- ============================================================
CREATE OR REPLACE FUNCTION clean_past_slots()
RETURNS void AS $$
BEGIN
  DELETE FROM available_slots WHERE date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Para agendar limpeza automática com pg_cron (se disponível no seu plano):
-- SELECT cron.schedule('clean-slots', '0 3 * * *', 'SELECT clean_past_slots()');
