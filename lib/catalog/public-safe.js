export function serializePublicProduct(product, contents = [], bagOptions = []) {
  const publicContents = product.contents || contents;
  const publicBags = product.bag_options || bagOptions;
  return {
    product_code: product.product_code, slug: product.slug, name: product.name, short_description: product.short_description, description: product.description, price_paise: String(product.price_paise), active: product.active, featured: product.featured ?? product.is_featured ?? false, bestseller: product.bestseller ?? product.is_bestseller ?? false, personalization_enabled: product.personalization_enabled, primary_image_url: product.primary_image_url || null, image_alt: product.image_alt, seo_title: product.seo_title || null, seo_description: product.seo_description || null,
    contents: publicContents.filter((item) => item.active !== false).map(({ product_code, ...item }) => item), bag_options: publicBags.filter((item) => item.active !== false).map(({ product_code, ...item }) => item),
  };
}
