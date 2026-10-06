// Year → month grouping for the archive page (newest first).
export function groupByYearMonth(items, getDate = (item) => item.date) {
  const sorted = [...items].sort((a, b) => +getDate(b) - +getDate(a));
  const years = [];
  for (const item of sorted) {
    const date = getDate(item);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    let yearGroup = years.at(-1);
    if (!yearGroup || yearGroup.year !== year) {
      yearGroup = { year, count: 0, months: [] };
      years.push(yearGroup);
    }
    let monthGroup = yearGroup.months.at(-1);
    if (!monthGroup || monthGroup.month !== month) {
      monthGroup = { month, items: [] };
      yearGroup.months.push(monthGroup);
    }
    monthGroup.items.push(item);
    yearGroup.count += 1;
  }
  return years;
}

export function monthName(month, locale = 'tr-TR') {
  return new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' })
    .format(new Date(Date.UTC(2000, month - 1, 1)));
}

// ~200 wpm for analytical Turkish prose; never below one minute.
export function readingMinutes(text, wordsPerMinute = 200) {
  const words = String(text ?? '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / wordsPerMinute));
}

export function adjacentItems(items, id, getDate = (item) => item.date) {
  const sorted = [...items].sort((a, b) => +getDate(b) - +getDate(a));
  const index = sorted.findIndex((item) => item.id === id);
  if (index === -1) return { newer: null, older: null };
  return { newer: sorted[index - 1] ?? null, older: sorted[index + 1] ?? null };
}
