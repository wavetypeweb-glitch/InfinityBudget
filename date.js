function startOfMonth(month, year) {
  return new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
}

function endOfMonth(month, year) {
  return new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
}

function getMonthYear(date = new Date()) {
  return {
    month: date.getUTCMonth() + 1,
    year: date.getUTCFullYear()
  };
}

function parseMonthYear(query = {}) {
  const now = new Date();
  const month = Number(query.month) || now.getUTCMonth() + 1;
  const year = Number(query.year) || now.getUTCFullYear();
  return { month, year };
}

function daysBetween(startDate, endDate) {
  const ms = Math.max(0, endDate.getTime() - startDate.getTime());
  return Math.max(1, Math.ceil(ms / (24 * 60 * 60 * 1000)));
}

function subtractDays(date, days) {
  const cloned = new Date(date);
  cloned.setUTCDate(cloned.getUTCDate() - days);
  return cloned;
}

module.exports = {
  daysBetween,
  endOfMonth,
  getMonthYear,
  parseMonthYear,
  startOfMonth,
  subtractDays
};
