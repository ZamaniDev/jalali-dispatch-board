/**
 * Drag and drop handlers for schedule blocks
 */

/**
 * Handle drag start
 *
 * @param {Event} event
 * @param {Object} schedule
 * @returns {void}
 */
export function handleDragStart(event, schedule) {
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.dropEffect = 'move';
  event.dataTransfer.setData('text/plain', JSON.stringify(schedule));

  // Add dragging class to source element
  if (event.target) {
    event.target.classList.add('dragging');
  }
}

/**
 * Handle drag over (for drop targets)
 *
 * @param {Event} event
 * @returns {void}
 */
export function handleDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';

  // Add hover class to drop target
  if (event.currentTarget) {
    event.currentTarget.classList.add('drag-over');
  }
}

/**
 * Handle drag enter
 *
 * @param {Event} event
 * @returns {void}
 */
export function handleDragEnter(event) {
  event.preventDefault();
  if (event.currentTarget) {
    event.currentTarget.classList.add('drag-over');
  }
}

/**
 * Handle drag leave
 *
 * @param {Event} event
 * @returns {void}
 */
export function handleDragLeave(event) {
  if (event.currentTarget) {
    event.currentTarget.classList.remove('drag-over');
  }
}

/**
 * Handle drop
 *
 * @param {Event} event
 * @param {number} technicianId - Target technician ID
 * @param {string} date - Target date (Gregorian)
 * @param {Function} onDrop - Callback function
 * @returns {void}
 */
export function handleDrop(event, technicianId, date, onDrop) {
  event.preventDefault();
  event.stopPropagation();

  // Remove drag-over class
  if (event.currentTarget) {
    event.currentTarget.classList.remove('drag-over');
  }

  try {
    const scheduleData = event.dataTransfer.getData('text/plain');
    if (!scheduleData) return;

    const schedule = JSON.parse(scheduleData);

    // Call the onDrop callback with the schedule and target info
    if (onDrop) {
      onDrop({
        schedule,
        technicianId,
        date
      });
    }
  } catch (error) {
    console.error('Error handling drop:', error);
  }
}

/**
 * Handle drag end
 *
 * @param {Event} event
 * @returns {void}
 */
export function handleDragEnd(event) {
  // Remove dragging class
  if (event.target) {
    event.target.classList.remove('dragging');
  }

  // Clean up any remaining drag-over classes
  document.querySelectorAll('.drag-over').forEach(el => {
    el.classList.remove('drag-over');
  });
}

/**
 * Create drag handlers object for svelte-dnd-action
 *
 * @param {Function} onConsider - Callback for drag consideration (preview)
 * @param {Function} onFinalize - Callback for drag finalization (drop)
 * @returns {Object}
 */
export function createDndHandlers(onConsider, onFinalize) {
  return {
    handleConsider: (event) => {
      if (onConsider) {
        onConsider(event.detail);
      }
    },
    handleFinalize: (event) => {
      if (onFinalize) {
        onFinalize(event.detail);
      }
    }
  };
}

/**
 * Check if element is draggable
 *
 * @param {Object} schedule
 * @returns {boolean}
 */
export function isDraggable(schedule) {
  // Don't allow dragging of completed or cancelled schedules
  return schedule &&
         schedule.status !== 'completed' &&
         schedule.status !== 'cancelled';
}

/**
 * Get drag item for svelte-dnd-action
 *
 * @param {Object} schedule
 * @returns {Object}
 */
export function createDragItem(schedule) {
  return {
    id: schedule.id || `temp-${Date.now()}`,
    ...schedule
  };
}
