<script>
  import { createEventDispatcher } from 'svelte';
  import { handleDragStart, handleDragEnd, isDraggable } from '../lib/dragHandlers';

  export let schedule;
  export let company;

  const dispatch = createEventDispatcher();

  function handleClick(event) {
    event.stopPropagation();
    dispatch('edit', schedule);
  }

  function handleDelete(event) {
    event.stopPropagation();
    dispatch('delete', schedule);
  }

  function onDragStart(event) {
    handleDragStart(event, schedule);
  }

  function onDragEnd(event) {
    handleDragEnd(event);
  }

  $: statusClass = `status-${schedule.status}`;
  $: draggable = isDraggable(schedule);
  $: companyName = company?.name || 'Unknown';
</script>

<div
  class="schedule-block {statusClass}"
  class:draggable
  draggable={draggable}
  on:dragstart={onDragStart}
  on:dragend={onDragEnd}
  on:click={handleClick}
  role="button"
  tabindex="0"
  on:keydown={(e) => e.key === 'Enter' && handleClick(e)}
>
  <div class="schedule-content">
    <div class="schedule-header">
      <span class="company-name" title={companyName}>
        {companyName}
      </span>
      <button
        type="button"
        class="delete-btn"
        on:click={handleDelete}
        aria-label="Delete schedule"
      >
        ×
      </button>
    </div>
    <div class="schedule-hours">
      {schedule.scheduled_hours}h
    </div>
    {#if schedule.notes}
      <div class="schedule-notes" title={schedule.notes}>
        {schedule.notes}
      </div>
    {/if}
  </div>
</div>

<style>
  .schedule-block {
    padding: 6px 8px;
    margin-bottom: 4px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s;
    border-left: 3px solid;
    background: white;
  }

  .schedule-block.draggable {
    cursor: move;
  }

  .schedule-block:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }

  .schedule-block.dragging {
    opacity: 0.5;
  }

  .schedule-block.status-planned {
    border-left-color: #3b82f6;
    background: #eff6ff;
  }

  .schedule-block.status-confirmed {
    border-left-color: #10b981;
    background: #f0fdf4;
  }

  .schedule-block.status-completed {
    border-left-color: #6c757d;
    background: #f8f9fa;
    opacity: 0.7;
  }

  .schedule-block.status-cancelled {
    border-left-color: #ef4444;
    background: #fef2f2;
    opacity: 0.6;
    text-decoration: line-through;
  }

  .schedule-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .schedule-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
  }

  .company-name {
    flex: 1;
    font-weight: 600;
    color: #212529;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .delete-btn {
    display: none;
    width: 18px;
    height: 18px;
    padding: 0;
    border: none;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
    color: #6c757d;
    transition: all 0.2s;
  }

  .schedule-block:hover .delete-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .delete-btn:hover {
    background: #ef4444;
    color: white;
  }

  .schedule-hours {
    font-size: 11px;
    color: #495057;
    font-weight: 500;
  }

  .schedule-notes {
    font-size: 11px;
    color: #6c757d;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-style: italic;
  }

  @media (max-width: 768px) {
    .schedule-block {
      padding: 8px;
      margin-bottom: 6px;
    }

    .delete-btn {
      display: flex;
    }
  }
</style>
