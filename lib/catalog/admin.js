import { createServiceRoleClient, isServiceRoleConfigured } from '@/lib/supabase/server';
import { publicImageUrl } from '@/lib/catalog/public';

function serializeAdminProduct(product, contents = [], bags = [], images = []) {
  return {
    ...product,
    price_paise: String(product.price_paise),
    estimated_unit_cost_paise: String(product.estimated_unit_cost_paise),
    personalization_schema: product.personalization_schema || {},
    seo_title: product.seo_title || '',
    seo_description: product.seo_description || '',
    contents: contents.sort((a, b) => a.sort_order - b.sort_order),
    bag_option_ids: bags.filter((item) => item.active).map((item) => item.bag_option_id),
    images: images.map((image) => ({ ...image, public_url: publicImageUrl(image.storage_path) })),
  };
}

export async function getAdminProducts() {
  if (!isServiceRoleConfigured()) return [];
  const client = createServiceRoleClient();
  const { data, error } = await client.from('products').select('*').order('updated_at', { ascending: false });
  if (error) throw new Error('Unable to load admin products.');
  return (data || []).map((product) => serializeAdminProduct(product));
}

export async function getAdminProduct(id) {
  if (!isServiceRoleConfigured()) return null;
  const client = createServiceRoleClient();
  const [{ data: product, error }, { data: contents }, { data: bags }, { data: images }] = await Promise.all([
    client.from('products').select('*').eq('id', id).maybeSingle(),
    client.from('product_contents').select('id,product_id,name,description,sort_order,active').eq('product_id', id).order('sort_order'),
    client.from('product_bag_options').select('product_id,bag_option_id,active').eq('product_id', id),
    client.from('product_images').select('id,product_id,storage_path,alt_text,sort_order,active,created_at').eq('product_id', id).order('sort_order'),
  ]);
  if (error || !product) return null;
  return serializeAdminProduct(product, contents || [], bags || [], images || []);
}

export async function getBagOptions() {
  if (!isServiceRoleConfigured()) return [];
  const { data, error } = await createServiceRoleClient().from('bag_options').select('id,name,description,active').order('name');
  if (error) throw new Error('Unable to load bag options.');
  return data || [];
}

function productRow(input) {
  const { bag_option_ids, contents, images, ...row } = input;
  return { ...row, price_paise: input.price_paise.toString(), estimated_unit_cost_paise: input.estimated_unit_cost_paise.toString() };
}

async function saveRelations(client, productId, input) {
  const { data: existingContents = [] } = await client.from('product_contents').select('id').eq('product_id', productId);
  const incomingIds = new Set(input.contents.filter((item) => item.id).map((item) => item.id));
  const omittedIds = existingContents.map((item) => item.id).filter((id) => !incomingIds.has(id));
  if (omittedIds.length) await client.from('product_contents').update({ active: false }).in('id', omittedIds);
  if (input.contents.length) {
    const contentRows = input.contents.map((item, index) => ({
      ...(item.id ? { id: item.id } : {}),
      product_id: productId,
      name: item.name,
      description: item.description || null,
      sort_order: index,
      active: item.active,
    }));
    const { error } = await client.from('product_contents').upsert(contentRows);
    if (error) throw error;
  }
  for (const image of input.images) {
    const { error } = await client.from('product_images').update({ alt_text: image.alt_text, sort_order: image.sort_order, active: image.active }).eq('id', image.id).eq('product_id', productId);
    if (error) throw error;
  }
  await client.from('product_bag_options').delete().eq('product_id', productId);
  if (input.bag_option_ids.length) {
    const { error } = await client.from('product_bag_options').insert(input.bag_option_ids.map((bag_option_id) => ({ product_id: productId, bag_option_id, active: true })));
    if (error) throw error;
  }
}

export async function createAdminProduct(input) {
  const client = createServiceRoleClient();
  const { data, error } = await client.from('products').insert(productRow(input)).select('id').single();
  if (error) throw error;
  await saveRelations(client, data.id, input);
  return data.id;
}

export async function updateAdminProduct(id, input) {
  const client = createServiceRoleClient();
  const { error } = await client.from('products').update(productRow(input)).eq('id', id);
  if (error) throw error;
  await saveRelations(client, id, input);
}
