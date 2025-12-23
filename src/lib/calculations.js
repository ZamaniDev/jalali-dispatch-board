import moment from 'moment-jalaali';
import { JalaliHelper } from './jalali';

/**
 * Calculate total hours for a technician in a given month
 *
 * @param {number} technicianId
 * @param {Array} schedules
 * @param {Object} currentMonth - { year, month }
 * @returns {Object} { total, weeks: [{ week, hours, dates }] }
 */
export function calculateTechnicianHours(technicianId, schedules, currentMonth) {
  const techSchedules = schedules.filter(s => s.technician_id === technicianId);

  // Filter for current month
  const monthSchedules = techSchedules.filter(s => {
    const scheduleMonth = JalaliHelper.toJalali(s.scheduled_date).substring(0, 7);
    const currentMonthStr = `${currentMonth.year}/${String(currentMonth.month).padStart(2, '0')}`;
    return scheduleMonth === currentMonthStr;
  });

  // Calculate total hours
  const total = monthSchedules.reduce((sum, s) => sum + (parseFloat(s.scheduled_hours) || 0), 0);

  // Group by week (Saturday to Friday)
  const weeks = groupByWeek(monthSchedules, currentMonth);

  return {
    total,
    weeks,
    scheduleCount: monthSchedules.length
  };
}

/**
 * Calculate total hours for a company in a given month
 *
 * @param {number} companyId
 * @param {Array} schedules
 * @param {Object} currentMonth - { year, month }
 * @returns {Object} { total, limit, percentage }
 */
export function calculateCompanyHours(companyId, schedules, currentMonth) {
  const companySchedules = schedules.filter(s => s.company_id === companyId);

  // Filter for current month
  const monthSchedules = companySchedules.filter(s => {
    const scheduleMonth = JalaliHelper.toJalali(s.scheduled_date).substring(0, 7);
    const currentMonthStr = `${currentMonth.year}/${String(currentMonth.month).padStart(2, '0')}`;
    return scheduleMonth === currentMonthStr;
  });

  // Calculate total hours
  const total = monthSchedules.reduce((sum, s) => sum + (parseFloat(s.scheduled_hours) || 0), 0);

  return {
    total,
    scheduleCount: monthSchedules.length
  };
}

/**
 * Group schedules by week
 *
 * @param {Array} schedules
 * @param {Object} currentMonth - { year, month }
 * @returns {Array} Array of week objects
 */
function groupByWeek(schedules, currentMonth) {
  const weeks = [];
  const dates = JalaliHelper.getDatesInMonth(currentMonth.year, currentMonth.month);

  // Group dates by week (Saturday to Friday)
  let currentWeek = [];
  let weekIndex = 0;

  dates.forEach((date, index) => {
    currentWeek.push(date);

    // If Friday (end of week) or last day of month
    if (date.isWeekend || index === dates.length - 1) {
      const weekSchedules = schedules.filter(s =>
        currentWeek.some(d => d.gregorianDate === s.scheduled_date)
      );

      const weekHours = weekSchedules.reduce((sum, s) =>
        sum + (parseFloat(s.scheduled_hours) || 0), 0
      );

      weeks.push({
        week: weekIndex + 1,
        hours: weekHours,
        dates: [...currentWeek],
        scheduleCount: weekSchedules.length
      });

      currentWeek = [];
      weekIndex++;
    }
  });

  return weeks;
}

/**
 * Calculate daily hours for a technician
 *
 * @param {number} technicianId
 * @param {string} date - Gregorian date
 * @param {Array} schedules
 * @returns {number} Total hours for that day
 */
export function calculateDailyHours(technicianId, date, schedules) {
  const daySchedules = schedules.filter(s =>
    s.technician_id === technicianId &&
    s.scheduled_date === date
  );

  return daySchedules.reduce((sum, s) => sum + (parseFloat(s.scheduled_hours) || 0), 0);
}

/**
 * Get week number for a date
 *
 * @param {string} date - Gregorian date
 * @param {Object} currentMonth - { year, month }
 * @returns {number} Week number (1-based)
 */
export function getWeekNumber(date, currentMonth) {
  const dates = JalaliHelper.getDatesInMonth(currentMonth.year, currentMonth.month);
  const dateIndex = dates.findIndex(d => d.gregorianDate === date);

  if (dateIndex === -1) return 0;

  let weekNumber = 1;
  for (let i = 0; i <= dateIndex; i++) {
    if (dates[i].isWeekend) {
      weekNumber++;
    }
  }

  return weekNumber;
}

/**
 * Calculate company hours percentage
 *
 * @param {number} used - Hours used
 * @param {number} total - Total contracted hours
 * @returns {number} Percentage (0-100)
 */
export function calculatePercentage(used, total) {
  if (total === 0) return 0;
  return Math.round((used / total) * 100);
}

/**
 * Format hours for display
 *
 * @param {number} hours
 * @returns {string}
 */
export function formatHours(hours) {
  return hours.toFixed(1) + 'h';
}
