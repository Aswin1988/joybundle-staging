CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_code TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_description TEXT NOT NULL,
  description TEXT NOT NULL,
  price_paise BIGINT NOT NULL CHECK (price_paise >= 0),
  estimated_unit_cost_paise BIGINT NOT NULL CHECK (estimated_unit_cost_paise >= 0),
  active BOOLEAN NOT NULL DEFAULT false,
  personalization_enabled BOOLEAN NOT NULL DEFAULT false,
  personalization_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bag_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_bag_options (
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  bag_option_id UUID NOT NULL REFERENCES public.bag_options(id) ON DELETE CASCADE,
  active BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY (product_id, bag_option_id)
);

CREATE TRIGGER products_set_updated_at BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER bag_options_set_updated_at BEFORE UPDATE ON public.bag_options
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS products_active_price_idx ON public.products (active, price_paise);
CREATE INDEX IF NOT EXISTS product_images_product_sort_idx ON public.product_images (product_id, sort_order);
CREATE INDEX IF NOT EXISTS product_bag_options_bag_idx ON public.product_bag_options (bag_option_id);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bag_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_bag_options ENABLE ROW LEVEL SECURITY;

-- Public access is column-restricted and active-only. Private cost columns are
-- deliberately absent from the anon/authenticated grants below.
GRANT SELECT (id, product_code, slug, name, short_description, description, price_paise, active, personalization_enabled, personalization_schema, seo_title, seo_description, created_at, updated_at) ON public.products TO anon, authenticated;
GRANT SELECT (id, product_id, storage_path, alt_text, sort_order, active, created_at) ON public.product_images TO anon, authenticated;
GRANT SELECT (id, name, description, active, created_at, updated_at) ON public.bag_options TO anon, authenticated;
GRANT SELECT (product_id, bag_option_id, active) ON public.product_bag_options TO anon, authenticated;

CREATE POLICY products_public_active_read ON public.products FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY product_images_public_active_read ON public.product_images FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY bag_options_public_active_read ON public.bag_options FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY product_bag_options_public_active_read ON public.product_bag_options FOR SELECT TO anon, authenticated USING (active = true);

-- Explicit safe views are the preferred public query boundary for future APIs.
CREATE OR REPLACE VIEW public.public_products WITH (security_invoker = true) AS
SELECT id, product_code, slug, name, short_description, description, price_paise,
       active, personalization_enabled, personalization_schema, seo_title,
       seo_description, created_at, updated_at
FROM public.products WHERE active = true;

CREATE OR REPLACE VIEW public.public_product_images WITH (security_invoker = true) AS
SELECT id, product_id, storage_path, alt_text, sort_order, active, created_at
FROM public.product_images WHERE active = true;

GRANT SELECT ON public.public_products, public.public_product_images TO anon, authenticated;

-- No INSERT/UPDATE/DELETE grants are given to public roles. Future admin
-- operations must use a server-side authenticated boundary.
