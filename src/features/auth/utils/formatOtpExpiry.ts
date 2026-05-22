export function formatOtpExpiry(expiresInSeconds: number): string {
  if (expiresInSeconds < 60) {
    return `Code expires in ${expiresInSeconds} seconds.`;
  }
  const minutes = Math.round(expiresInSeconds / 60);
  return minutes === 1
    ? "Code expires in 1 minute."
    : `Code expires in ${minutes} minutes.`;
}
