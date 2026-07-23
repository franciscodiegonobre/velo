/** Strip all non-digit characters from a string. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Validate a Brazilian CPF (with or without mask) using check digits.
 * Rejects repeated-digit sequences (e.g. 111.111.111-11).
 */
export function isValidCpf(value: string): boolean {
  const cpf = onlyDigits(value);

  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const checkDigit = (length: number, weightStart: number): number => {
    let sum = 0;
    for (let i = 0; i < length; i++) {
      sum += Number(cpf[i]) * (weightStart - i);
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  return (
    checkDigit(9, 10) === Number(cpf[9]) &&
    checkDigit(10, 11) === Number(cpf[10])
  );
}

/** Stricter email check: requires a domain with a TLD (rejects e.g. cliente@.com). */
export function isValidEmailStrict(value: string): boolean {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/.test(value.trim());
}
