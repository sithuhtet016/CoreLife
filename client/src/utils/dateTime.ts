export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getBrowserTimezoneOffsetMinutes() {
  return new Date().getTimezoneOffset();
}

export function getMillisecondsUntilNextMinute(now = new Date()) {
  const nextMinute = new Date(now);
  nextMinute.setSeconds(0, 0);
  nextMinute.setMinutes(nextMinute.getMinutes() + 1);
  return Math.max(250, nextMinute.getTime() - now.getTime());
}

export function getMillisecondsUntilNextLocalMidnight(now = new Date()) {
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  return Math.max(250, nextMidnight.getTime() - now.getTime());
}

export function getRecentLocalWeekdayLabels(days = 7, locale = undefined) {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
  const labels: string[] = [];
  const now = new Date();

  for (let index = days - 1; index >= 0; index -= 1) {
    const day = new Date(now);
    day.setDate(now.getDate() - index);
    labels.push(formatter.format(day));
  }

  return labels;
}

export function scheduleAlignedInterval(
  callback: () => void,
  getInitialDelay: () => number,
  intervalMs: number,
) {
  let intervalId = 0;

  const timeoutId = window.setTimeout(() => {
    callback();
    intervalId = window.setInterval(callback, intervalMs);
  }, getInitialDelay());

  return () => {
    window.clearTimeout(timeoutId);
    window.clearInterval(intervalId);
  };
}
