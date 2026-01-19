-- Add notes column to customer_product_ledger table
ALTER TABLE public.customer_product_ledger 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Comment for documentation
COMMENT ON COLUMN public.customer_product_ledger.notes IS 'Session notes or additional details for this ledger entry';
