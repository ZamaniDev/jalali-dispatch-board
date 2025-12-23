import { writable, derived } from 'svelte/store';
import { calculateTechnicianHours, calculateCompanyHours } from '../lib/calculations';

/**
 * Warnings state management
 */
export const warnings = writable([]);

/**
 * Warning types
 */
export const WARNING_TYPES = {
  TECH_OVERLOAD: 'tech_overload',
  COMPANY_OVERAGE: 'company_overage',
  SCHEDULE_CONFLICT: 'schedule_conflict',
  TECH_UNDERUTILIZED: 'tech_underutilized',
  COMPANY_UNDERUTILIZED: 'company_underutilized'
};

/**
 * Warning severity levels
 */
export const WARNING_SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error'
};

/**
 * Generate warnings for technician overload
 */
export function generateTechWarnings(technician, schedules, currentMonth) {
  const warnings = [];
  const hoursData = calculateTechnicianHours(technician.id, schedules, currentMonth);

  // Weekly overload warnings
  hoursData.weeks.forEach((week, index) => {
    if (week.hours > technician.suggested_max_hours_week) {
      warnings.push({
        id: `tech-week-${technician.id}-${index}`,
        type: WARNING_TYPES.TECH_OVERLOAD,
        severity: WARNING_SEVERITY.WARNING,
        technicianId: technician.id,
        message: `${technician.full_name} has ${week.hours}h in week ${index + 1} (suggested: ${technician.suggested_max_hours_week}h)`,
        week: index + 1
      });
    }
  });

  // Monthly summary
  if (hoursData.total > technician.suggested_max_hours_week * 4) {
    warnings.push({
      id: `tech-month-${technician.id}`,
      type: WARNING_TYPES.TECH_OVERLOAD,
      severity: WARNING_SEVERITY.ERROR,
      technicianId: technician.id,
      message: `${technician.full_name} has ${hoursData.total}h this month (exceeds monthly target)`,
      total: hoursData.total
    });
  }

  return warnings;
}

/**
 * Generate warnings for company hour usage
 */
export function generateCompanyWarnings(company, schedules, currentMonth) {
  const warnings = [];
  const hoursData = calculateCompanyHours(company.id, schedules, currentMonth);

  if (hoursData.total > company.monthly_hours) {
    warnings.push({
      id: `company-${company.id}`,
      type: WARNING_TYPES.COMPANY_OVERAGE,
      severity: WARNING_SEVERITY.WARNING,
      companyId: company.id,
      message: `${company.name} will use ${hoursData.total}h / ${company.monthly_hours}h this month`,
      total: hoursData.total,
      limit: company.monthly_hours
    });
  }

  return warnings;
}

/**
 * Generate warnings for schedule conflicts
 */
export function generateConflictWarnings(schedules) {
  const warnings = [];
  const dateMap = {};

  // Group schedules by technician and date
  schedules.forEach(schedule => {
    const key = `${schedule.technician_id}-${schedule.scheduled_date}`;
    if (!dateMap[key]) {
      dateMap[key] = [];
    }
    dateMap[key].push(schedule);
  });

  // Check for conflicts
  Object.entries(dateMap).forEach(([key, daySchedules]) => {
    if (daySchedules.length > 1) {
      const [techId, date] = key.split('-');
      warnings.push({
        id: `conflict-${key}`,
        type: WARNING_TYPES.SCHEDULE_CONFLICT,
        severity: WARNING_SEVERITY.ERROR,
        technicianId: parseInt(techId),
        date: date,
        message: `Technician has ${daySchedules.length} schedules on ${date}`,
        count: daySchedules.length
      });
    }
  });

  return warnings;
}

/**
 * Generate all warnings
 */
export function generateAllWarnings(schedules, technicians, companies, currentMonth) {
  const allWarnings = [];

  // Technician warnings
  technicians.forEach(tech => {
    const techWarnings = generateTechWarnings(tech, schedules, currentMonth);
    allWarnings.push(...techWarnings);
  });

  // Company warnings
  companies.forEach(company => {
    const companyWarnings = generateCompanyWarnings(company, schedules, currentMonth);
    allWarnings.push(...companyWarnings);
  });

  // Conflict warnings
  const conflictWarnings = generateConflictWarnings(schedules);
  allWarnings.push(...conflictWarnings);

  return allWarnings;
}
