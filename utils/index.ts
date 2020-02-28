export const expiresInDays = (days: number) =>
  Math.floor(Date.now() / 1000) + days * 24 * 60 * 60;