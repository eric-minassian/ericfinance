export function getPreviousDate(days: number = 1): Date {
  const today = new Date();
  const previousDate = new Date(today);
  previousDate.setDate(today.getDate() - days);
  return previousDate;
}
