
export function getStartOfWeek(date: Date): Date {
  const start = new Date(date);
  const day = start.getDay();

  const difference = day === 0 ? -6 : 1 - day;

  start.setDate(start.getDate() + difference);
  start.setHours(0, 0, 0, 0);

  return start;
}

export function getWeekDays(date: Date): Date[] {
  const start = getStartOfWeek(date);

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return day;
  });
}

export function formatWeekRange(date: Date): string {
  const days = getWeekDays(date);

  const formatter = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
  });

  return `${formatter.format(days[0])} – ${formatter.format(days[6])}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
