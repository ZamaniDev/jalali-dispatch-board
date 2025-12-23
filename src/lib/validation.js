import { calculateTechnicianHours, calculateCompanyHours, calculateDailyHours } from './calculations';

/**
 * Validation utilities for schedule conflicts and warnings
 */

/**
 * Check if a technician has overlapping schedules on a date
 *
 * @param {number} technicianId
 * @param {string} date - Gregorian date
 * @param {Array} schedules
 * @param {number} excludeScheduleId - Schedule to exclude from check (for edits)
 * @returns {boolean}
 */
export function hasScheduleConflict(technicianId, date, schedules, excludeScheduleId = null) {
  const conflicts = schedules.filter(s =>
    s.technician_id === technicianId &&
    s.scheduled_date === date &&
    s.id !== excludeScheduleId
  );

  return conflicts.length > 0;
}

/**
 * Check if adding this schedule would exceed technician's weekly hours
 *
 * @param {number} technicianId
 * @param {string} date
 * @param {number} hours
 * @param {Array} schedules
 * @param {Object} technician
 * @param {Object} currentMonth
 * @returns {Object} { exceeds: boolean, current: number, limit: number }
 */
export function checkWeeklyHoursLimit(technicianId, date, hours, schedules, technician, currentMonth) {
  const hoursData = calculateTechnicianHours(technicianId, schedules, currentMonth);
  const limit = technician.suggested_max_hours_week || 40;

  // Find which week this date falls into
  const weekData = hoursData.weeks.find(w =>
    w.dates.some(d => d.gregorianDate === date)
  );

  const currentHours = weekData ? weekData.hours : 0;
  const newTotal = currentHours + hours;

  return {
    exceeds: newTotal > limit,
    current: newTotal,
    limit: limit,
    week: weekData ? weekData.week : 0
  };
}

/**
 * Check if adding this schedule would exceed company's monthly hours
 *
 * @param {number} companyId
 * @param {number} hours
 * @param {Array} schedules
 * @param {Object} company
 * @param {Object} currentMonth
 * @returns {Object} { exceeds: boolean, current: number, limit: number }
 */
export function checkMonthlyHoursLimit(companyId, hours, schedules, company, currentMonth) {
  const hoursData = calculateCompanyHours(companyId, schedules, currentMonth);
  const limit = company.monthly_hours || 0;
  const newTotal = hoursData.total + hours;

  return {
    exceeds: newTotal > limit,
    current: newTotal,
    limit: limit,
    percentage: limit > 0 ? Math.round((newTotal / limit) * 100) : 0
  };
}

/**
 * Validate schedule data
 *
 * @param {Object} schedule
 * @returns {Object} { valid: boolean, errors: Array }
 */
export function validateSchedule(schedule) {
  const errors = [];

  if (!schedule.technician_id) {
    errors.push('Technician is required');
  }

  if (!schedule.company_id) {
    errors.push('Company is required');
  }

  if (!schedule.scheduled_date) {
    errors.push('Date is required');
  }

  if (!schedule.scheduled_hours || schedule.scheduled_hours <= 0) {
    errors.push('Hours must be greater than 0');
  }

  if (schedule.scheduled_hours > 24) {
    errors.push('Hours cannot exceed 24');
  }

  if (!['planned', 'confirmed', 'completed', 'cancelled'].includes(schedule.status)) {
    errors.push('Invalid status');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get all validation warnings for a schedule
 *
 * @param {Object} schedule
 * @param {Array} allSchedules
 * @param {Object} technician
 * @param {Object} company
 * @param {Object} currentMonth
 * @param {boolean} allowOverlaps
 * @returns {Array} Array of warning objects
 */
export function getScheduleWarnings(schedule, allSchedules, technician, company, currentMonth, allowOverlaps = false) {
  const warnings = [];

  // Check for schedule conflicts
  if (!allowOverlaps && hasScheduleConflict(
    schedule.technician_id,
    schedule.scheduled_date,
    allSchedules,
    schedule.id
  )) {
    warnings.push({
      type: 'conflict',
      severity: 'error',
      message: 'Technician already has a schedule on this date'
    });
  }

  // Check weekly hours
  const weeklyCheck = checkWeeklyHoursLimit(
    schedule.technician_id,
    schedule.scheduled_date,
    schedule.scheduled_hours,
    allSchedules,
    technician,
    currentMonth
  );

  if (weeklyCheck.exceeds) {
    warnings.push({
      type: 'weekly_hours',
      severity: 'warning',
      message: `Will exceed weekly hours: ${weeklyCheck.current}h / ${weeklyCheck.limit}h (week ${weeklyCheck.week})`
    });
  }

  // Check monthly hours
  const monthlyCheck = checkMonthlyHoursLimit(
    schedule.company_id,
    schedule.scheduled_hours,
    allSchedules,
    company,
    currentMonth
  );

  if (monthlyCheck.exceeds) {
    warnings.push({
      type: 'monthly_hours',
      severity: 'warning',
      message: `Will exceed company hours: ${monthlyCheck.current}h / ${monthlyCheck.limit}h (${monthlyCheck.percentage}%)`
    });
  }

  return warnings;
}

/**
 * Check if schedule can be created/updated
 * This is non-blocking - always returns true, but provides warnings
 *
 * @param {Object} schedule
 * @param {Array} allSchedules
 * @param {Object} technician
 * @param {Object} company
 * @param {Object} currentMonth
 * @param {boolean} allowOverlaps
 * @returns {Object} { canSave: boolean, warnings: Array }
 */
export function canSaveSchedule(schedule, allSchedules, technician, company, currentMonth, allowOverlaps = false) {
  const validation = validateSchedule(schedule);

  if (!validation.valid) {
    return {
      canSave: false,
      warnings: validation.errors.map(e => ({
        type: 'validation',
        severity: 'error',
        message: e
      }))
    };
  }

  const warnings = getScheduleWarnings(
    schedule,
    allSchedules,
    technician,
    company,
    currentMonth,
    allowOverlaps
  );

  // Always allow save, but return warnings
  return {
    canSave: true,
    warnings
  };
}
