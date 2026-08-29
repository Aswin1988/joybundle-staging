import { getGoogleAccessToken } from './client.js';

async function googleRequest(path, options = {}) {
  const token = await getGoogleAccessToken();
  const spreadsheetId = encodeURIComponent(process.env.GOOGLE_SHEETS_SPREADSHEET_ID);
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}${path}`, {
    ...options,
    headers: { authorization: `Bearer ${token}`, ...(options.body ? { 'content-type': 'application/json' } : {}), ...options.headers },
  });
  if (!response.ok) throw new Error(`Google Sheets request failed (HTTP ${response.status})`);
  return response.json();
}

export async function getSheetValues(tabName) {
  const token = await getGoogleAccessToken();
  const spreadsheetId = encodeURIComponent(process.env.GOOGLE_SHEETS_SPREADSHEET_ID);
  const range = encodeURIComponent(`${tabName}!A:Z`);
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`, {
    headers: { authorization: `Bearer ${token}` },
    next: { revalidate: 180, tags: ['joybundle-catalog'] },
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const detail = errorBody?.error?.message ? `: ${errorBody.error.message}` : '';
    throw new Error(`Unable to read the ${tabName} sheet (Google API HTTP ${response.status})${detail}`);
  }
  const body = await response.json();
  return body.values || [];
}

function cell(value) {
  if (typeof value === 'number') return { userEnteredValue: { numberValue: value } };
  return { userEnteredValue: { stringValue: String(value ?? '') } };
}

async function getSheetIds(tabNames) {
  const body = await googleRequest('?fields=sheets.properties');
  const ids = new Map((body.sheets || []).map((sheet) => [sheet.properties.title, sheet.properties.sheetId]));
  const missing = tabNames.find((tab) => !ids.has(tab));
  if (missing) throw new Error(`Google Sheets tab ${missing} is unavailable.`);
  return ids;
}

/** Append one order and all its items in one Sheets batchUpdate request. */
export async function appendOrderAndItems(orderRow, itemRows) {
  const orderTab = 'Orders';
  const itemTab = 'Order_Items';
  const ids = await getSheetIds([orderTab, itemTab]);
  const rowRequest = (sheetId, values) => ({ appendCells: { sheetId, rows: [{ values: values.map(cell) }], fields: 'userEnteredValue' } });
  await googleRequest(':batchUpdate', {
    method: 'POST',
    body: JSON.stringify({ requests: [rowRequest(ids.get(orderTab), orderRow), ...itemRows.map((row) => rowRequest(ids.get(itemTab), row))] }),
  });
}

export function rowsToObjects(rows) {
  if (!Array.isArray(rows) || rows.length < 1) return [];
  const headers = rows[0].map((header) => String(header || '').trim());
  return rows.slice(1).filter((row) => row.some((value) => String(value ?? '').trim() !== '')).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])));
}
