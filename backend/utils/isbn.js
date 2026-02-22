// ISBN normalization utilities
// Provides conversion and validation for ISBN-10 and ISBN-13

const toDigits = (s = '') => (s || '').toString().replace(/[^0-9Xx]/g, '');

const computeIsbn13CheckDigit = (digits12) => {
    const chars = digits12.split('').map(Number);
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += chars[i] * (i % 2 === 0 ? 1 : 3);
    }
    const rem = sum % 10;
    return (rem === 0) ? '0' : String(10 - rem);
};

const computeIsbn10CheckDigit = (digits9) => {
    const chars = digits9.split('').map(Number);
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += chars[i] * (10 - i);
    }
    const rem = 11 - (sum % 11);
    if (rem === 10) return 'X';
    if (rem === 11) return '0';
    return String(rem);
};

const toIsbn13 = (raw) => {
    const d = toDigits(raw);
    if (!d) return null;
    if (d.length === 13) return d;
    if (d.length === 10) {
        // convert ISBN-10 to ISBN-13 by prefixing 978 and recomputing check digit
        const core = '978' + d.slice(0, 9);
        const check = computeIsbn13CheckDigit(core);
        return core + check;
    }
    if (d.length === 12) {
        const check = computeIsbn13CheckDigit(d);
        return d + check;
    }
    if (d.length === 11) {
        // unlikely, try last 10
        const maybe10 = d.slice(-10);
        return toIsbn13(maybe10);
    }
    if (d.length > 13) {
        // try to take last 13 digits
        return d.slice(-13);
    }
    return null;
};

module.exports = {
    toDigits,
    toIsbn13,
    computeIsbn10CheckDigit,
    computeIsbn13CheckDigit
};
