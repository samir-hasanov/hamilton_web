/** Backend-dən gələn user obyekti üçün görünən ad (displayName və ya username). */
export function userDisplayName(user) {
  if (!user) return '';
  const d = user.displayName;
  if (typeof d === 'string' && d.trim() !== '') return d.trim();
  return user.username || '';
}
