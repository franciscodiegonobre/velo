export function generateOrderId() {
    const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    const randomFrom = (chars, length) =>
        Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

    const suffix = randomFrom(alphanumeric, 6);

    return `VLO-${suffix}`;
}