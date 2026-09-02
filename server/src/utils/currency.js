// Meta's Marketing API takes budgets in the ad account currency's smallest
// unit (cents for RM); this codebase displays/stores budgets in whole RM.
export function centsFromRM(amount) {
  return Math.round(Number(amount) * 100);
}

export function rmFromCents(cents) {
  return Number((Number(cents) / 100).toFixed(2));
}

export default { centsFromRM, rmFromCents };
