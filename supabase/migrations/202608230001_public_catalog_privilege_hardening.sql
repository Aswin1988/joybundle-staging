-- Forward-only security hardening for the catalog boundary.
-- The foundation migration granted safe columns but did not revoke any
-- pre-existing table-level grants that may exist in a Supabase project.
-- Revoke broad public access first, then grant only the public-safe columns.

REVOKE ALL ON TABLE public.products, public.product_images,
  public.bag_options, public.product_bag_options FROM anon, authenticated;

GRANT SELECT (id, product_code, slug, name, short_description, description,
  price_paise, active, personalization_enabled, personalization_schema,
  seo_title, seo_description, created_at, updated_at, is_featured, is_bestseller)
  ON public.products TO anon, authenticated;

GRANT SELECT (id, product_id, storage_path, alt_text, sort_order, active, created_at)
  ON public.product_images TO anon, authenticated;

GRANT SELECT (id, name, description, active, created_at, updated_at)
  ON public.bag_options TO anon, authenticated;

GRANT SELECT (product_id, bag_option_id, active)
  ON public.product_bag_options TO anon, authenticated;

REVOKE ALL ON TABLE public.admin_users FROM anon, authenticated;
REVOKE ALL ON TABLE public.product_contents FROM anon, authenticated;
GRANT SELECT (id, product_id, name, description, sort_order, active, created_at, updated_at)
  ON public.product_contents TO anon, authenticated;
