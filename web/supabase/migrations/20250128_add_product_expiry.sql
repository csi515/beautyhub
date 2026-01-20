-- 제품 배치/유통기한 관리 테이블
CREATE TABLE IF NOT EXISTS product_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES beautyhub_products(id) ON DELETE CASCADE,
  batch_number TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  expiry_date DATE NOT NULL,
  purchase_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner_id, product_id, batch_number)
);

-- 배치 인덱스
CREATE INDEX IF NOT EXISTS idx_product_batches_owner_id ON product_batches(owner_id);
CREATE INDEX IF NOT EXISTS idx_product_batches_product_id ON product_batches(product_id);
CREATE INDEX IF NOT EXISTS idx_product_batches_expiry_date ON product_batches(expiry_date);
CREATE INDEX IF NOT EXISTS idx_product_batches_batch_number ON product_batches(batch_number);

-- 배치 RLS 정책
ALTER TABLE product_batches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own product batches" ON product_batches;
CREATE POLICY "Users can view their own product batches"
  ON product_batches FOR SELECT
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can insert their own product batches" ON product_batches;
CREATE POLICY "Users can insert their own product batches"
  ON product_batches FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can update their own product batches" ON product_batches;
CREATE POLICY "Users can update their own product batches"
  ON product_batches FOR UPDATE
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete their own product batches" ON product_batches;
CREATE POLICY "Users can delete their own product batches"
  ON product_batches FOR DELETE
  USING (auth.uid() = owner_id);

-- 배치 업데이트 타임스탬프 트리거
DROP TRIGGER IF EXISTS update_product_batches_updated_at ON product_batches;
CREATE TRIGGER update_product_batches_updated_at
  BEFORE UPDATE ON product_batches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
