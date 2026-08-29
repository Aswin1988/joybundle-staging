ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin')),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.product_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER admin_users_set_updated_at BEFORE UPDATE ON public.admin_users
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER product_contents_set_updated_at BEFORE UPDATE ON public.product_contents
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX IF NOT EXISTS product_contents_product_sort_idx ON public.product_contents (product_id, sort_order);
CREATE INDEX IF NOT EXISTS products_featured_idx ON public.products (active, is_featured);
CREATE INDEX IF NOT EXISTS products_bestseller_idx ON public.products (active, is_bestseller);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_contents ENABLE ROW LEVEL SECURITY;

-- Admin tables are intentionally not readable or writable by anon/authenticated
-- clients. Server-side service-role operations perform the role check first.
REVOKE ALL ON public.admin_users FROM anon, authenticated;
REVOKE ALL ON public.product_contents FROM anon, authenticated;

GRANT SELECT (id, product_id, name, description, sort_order, active, created_at, updated_at)
  ON public.product_contents TO anon, authenticated;
CREATE POLICY product_contents_public_active_read ON public.product_contents
  FOR SELECT TO anon, authenticated USING (active = true);

INSERT INTO public.bag_options (name, description, active)
VALUES
  ('Pink', 'Pink gift bag, subject to availability.', true),
  ('Blue', 'Blue gift bag, subject to availability.', true),
  ('Sky', 'Sky gift bag, subject to availability.', true),
  ('Assorted', 'Assorted colour selected based on availability.', true)
ON CONFLICT (name) DO NOTHING;

GRANT SELECT (is_featured, is_bestseller) ON public.products TO anon, authenticated;

CREATE OR REPLACE VIEW public.public_products WITH (security_invoker = true) AS
SELECT id, product_code, slug, name, short_description, description, price_paise,
       active, personalization_enabled, personalization_schema, seo_title,
       seo_description, created_at, updated_at, is_featured, is_bestseller
FROM public.products WHERE active = true;

GRANT SELECT ON public.public_products TO anon, authenticated;

-- Public product media can be read, while writes remain service-role only.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-media', 'product-media', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY product_media_public_read ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'product-media');

-- The product-media bucket should be created through the Supabase dashboard or
-- deployment process with public read enabled. Uploads remain server-side.
