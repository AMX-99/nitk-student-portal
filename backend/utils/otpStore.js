/**
 * In-memory OTP store with expiry (5 minutes).
 * Maps email -> { otp, expiresAt, verified }
 */
const store = new Map();

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
}

export function saveOtp(email, otp) {
    store.set(email.toLowerCase(), {
        otp,
        expiresAt: Date.now() + OTP_TTL_MS,
        verified: false,
    });
}

export function verifyOtp(email, otp) {
    const entry = store.get(email.toLowerCase());
    if (!entry) return { valid: false, reason: 'No OTP found for this email' };
    if (Date.now() > entry.expiresAt) {
        store.delete(email.toLowerCase());
        return { valid: false, reason: 'OTP has expired. Please request a new one.' };
    }
    if (entry.otp !== otp) return { valid: false, reason: 'Invalid OTP' };
    // Mark as verified so reset-password can proceed
    entry.verified = true;
    return { valid: true };
}

export function isVerified(email) {
    const entry = store.get(email.toLowerCase());
    return !!(entry && entry.verified && Date.now() <= entry.expiresAt);
}

export function clearOtp(email) {
    store.delete(email.toLowerCase());
}
