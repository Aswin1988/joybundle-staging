const completed = new Map();
const inFlight = new Map();

export async function withIdempotency(key, operation) {
  if (!key) return operation();
  if (completed.has(key)) return completed.get(key);
  if (inFlight.has(key)) return inFlight.get(key);
  const promise = operation().then((result) => { completed.set(key, result); if (completed.size > 1000) completed.delete(completed.keys().next().value); return result; }).finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}
