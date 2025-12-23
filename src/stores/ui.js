import { writable } from 'svelte/store';

/**
 * UI state management
 */

// Modal state
export const modalOpen = writable(false);
export const editingSchedule = writable(null);

// Loading state
export const loading = writable(false);

// Drag state
export const isDragging = writable(false);
export const draggedSchedule = writable(null);

// Selection state
export const selectedTechnician = writable(null);
export const selectedCompany = writable(null);

// View state
export const viewMode = writable('grid'); // 'grid' | 'list' | 'calendar'
export const sidebarCollapsed = writable(false);

/**
 * Open modal for creating new schedule
 */
export function openCreateModal(technicianId, date) {
  editingSchedule.set({
    technician_id: technicianId,
    scheduled_date: date,
    scheduled_hours: 8,
    status: 'planned'
  });
  modalOpen.set(true);
}

/**
 * Open modal for editing existing schedule
 */
export function openEditModal(schedule) {
  editingSchedule.set(schedule);
  modalOpen.set(true);
}

/**
 * Close modal
 */
export function closeModal() {
  modalOpen.set(false);
  editingSchedule.set(null);
}

/**
 * Start dragging
 */
export function startDrag(schedule) {
  isDragging.set(true);
  draggedSchedule.set(schedule);
}

/**
 * End dragging
 */
export function endDrag() {
  isDragging.set(false);
  draggedSchedule.set(null);
}
