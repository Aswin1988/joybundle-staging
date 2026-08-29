export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const routes = ['/', '/shop/under-100', '/shop/100-149', '/shop/150-199', '/shop/200-249', '/shop/250-299', '/shop/300-400', '/track-order', '/delivery-policy', '/cancellation-policy', '/damage-replacement-policy', '/privacy-policy', '/terms'];
  return routes.map((path) => ({ url: `${base}${path}`, changeFrequency: path === '/' ? 'weekly' : 'monthly', priority: path === '/' ? 1 : 0.6 }));
}
