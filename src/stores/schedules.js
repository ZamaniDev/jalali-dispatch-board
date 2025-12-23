import { writable, derived } from 'svelte/store';

/**
 * Schedule state management
 */
export const schedules = writable([]);
export const selectedSchedule = writable(null);

/**
 * Group schedules by technician and date
 */
export function createScheduleGrid(schedulesData, technicians, dates) {
  const grid = {};

  technicians.forEach(tech => {
    grid[tech.id] = {};
    dates.forEach(date => {
      grid[tech.id][date.gregorianDate] = schedulesData.filter(s =>
        s.technician_id === tech.id &&
        s.scheduled_date === date.gregorianDate
      );
    });
  });

  return grid;
}

/**
 * Get schedules for a specific technician
 */
export function getSchedulesForTechnician(schedulesData, technicianId) {
  return schedulesData.filter(s => s.technician_id === technicianId);
}

/**
 * Get schedules for a specific company
 */
export function getSchedulesForCompany(schedulesData, companyId) {
  return schedulesData.filter(s => s.company_id === companyId);
}

/**
 * Get schedules for a specific date
 */
export function getSchedulesForDate(schedulesData, date) {
  return schedulesData.filter(s => s.scheduled_date === date);
}
