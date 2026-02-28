export function formatUGX(amount) {
  const n = Number(amount || 0);
  // No decimal places for UGX, use en-UG locale grouping
  return 'UGX ' + n.toLocaleString('en-UG', { maximumFractionDigits: 0 });
}
