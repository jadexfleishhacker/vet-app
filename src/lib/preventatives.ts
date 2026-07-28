/**
 * Self-administered monthly preventatives (flea/tick) are recurring reminders,
 * not vet-scheduled shots — they should never read as "overdue".
 */
export function isMonthlyPreventative(name: string): boolean {
  return /flea|tick/i.test(name);
}
