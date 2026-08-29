export function getCatalogDataSource(env = process.env) {
  return env.CATALOG_DATA_SOURCE || (env.NODE_ENV === 'production' ? 'google-sheets' : 'fixture');
}
