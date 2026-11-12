export const MAX_TRANSFER_MINOR = 100000000;
export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseAmount(value) {
  const text = String(value).trim();
  if (!/^\d{1,7}([.,]\d{1,2})?$/.test(text)) throw new Error("INVALID_AMOUNT");
  const [whole, decimal = ""] = text.replace(",", ".").split(".");
  const minor = Number(whole) * 100 + Number(decimal.padEnd(2, "0"));
  if (!Number.isSafeInteger(minor) || minor < 1 || minor > MAX_TRANSFER_MINOR)
    throw new Error("INVALID_AMOUNT");
  return minor;
}
export function paymentTitle(value) {
  const title = String(value).trim();
  if (!title || Array.from(title).length > 140)
    throw new Error("INVALID_TITLE");
  return title;
}
export function encodeRequest(id) {
  if (!UUID_PATTERN.test(id)) throw new Error("INVALID_QR");
  return `p2pwallet://request/${id}`;
}
export function decodeRequest(value) {
  if (typeof value !== "string" || value.length > 100)
    throw new Error("INVALID_QR");
  const match = /^p2pwallet:\/\/request\/([0-9a-f-]+)$/i.exec(value);
  if (!match || !UUID_PATTERN.test(match[1])) throw new Error("INVALID_QR");
  return match[1].toLowerCase();
}
export function validatePending(value) {
  if (
    !value ||
    !UUID_PATTERN.test(value.userId) ||
    !UUID_PATTERN.test(value.key) ||
    !Number.isSafeInteger(value.amountMinor) ||
    value.amountMinor < 1 ||
    value.amountMinor > MAX_TRANSFER_MINOR ||
    (value.requestId != null && !UUID_PATTERN.test(value.requestId)) ||
    typeof value.title !== "string" ||
    paymentTitle(value.title) !== value.title ||
    typeof value.displayName !== "string" ||
    value.displayName.length > 120
  )
    throw new Error("INVALID_PAYMENT");
  return value;
}
