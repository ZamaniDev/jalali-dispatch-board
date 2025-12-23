<script>
  import { createEventDispatcher } from 'svelte';
  import { handleDragOver, handleDragEnter, handleDragLeave, handleDrop } from '../lib/dragHandlers';
  import ScheduleBlock from './ScheduleBlock.svelte';

  export let date;
  export let technicianId;
  export let schedules = [];
  export let companies = [];
  export let isWeekend = false;

  const dispatch = createEventDispatcher();

  function onDragOver(event) {
    handleDragOver(event);
  }

  function onDragEnter(event) {
    handleDragEnter(event);
  }

  function onDragLeave(event) {
    handleDragLeave(event);
  }

  function onDrop(event) {
    handleDrop(event, technicianId, date, (dropData) => {
      dispatch('scheduleDrop', {
        technicianId,
        date,
        schedule: dropData.schedule
      });
    });
  }

  function handleCellClick() {
    dispatch('cellClick', { technicianId, date });
  }

  function handleScheduleEdit(event) {
    dispatch('scheduleEdit', event.detail);
  }

  function handleScheduleDelete(event) {
    dispatch('scheduleDelete', event.detail);
  }

  function getCompanyForSchedule(schedule) {
    return companies.find(c => c.id === schedule.company_id);
  }
</script>

<div
  class="day-cell"
  class:weekend={isWeekend}
  class:has-schedules={schedules.length > 0}
  on:dragover={onDragOver}
  on:dragenter={onDragEnter}
  on:dragleave={onDragLeave}
  on:drop={onDrop}
  on:click={handleCellClick}
  role="button"
  tabindex="0"
  on:keydown={(e) => e.key === 'Enter' && handleCellClick()}
>
  {#if schedules.length > 0}
    <div class="schedules-container">
      {#each schedules as schedule (schedule.id)}
        <ScheduleBlock
          {schedule}
          company={getCompanyForSchedule(schedule)}
          on:edit={handleScheduleEdit}
          on:delete={handleScheduleDelete}
        />
      {/each}
    </div>
  {:else}
    <div class="empty-cell">
      <span class="add-icon">+</span>
    </div>
  {/if}
</div>

<style>
  .day-cell {
    min-height: 80px;
    padding: 6px;
    border-right: 1px solid #e9ecef;
    border-bottom: 1px solid #e9ecef;
    background: white;
    cursor: pointer;
    transition: background 0.2s;
    position: relative;
  }

  .day-cell:hover {
    background: #f8f9fa;
  }

  .day-cell.weekend {
    background: #fffbeb;
  }

  .day-cell.weekend:hover {
    background: #fef3c7;
  }

  .day-cell.drag-over {
    background: #e0f2fe;
    border: 2px dashed #3b82f6;
  }

  .schedules-container {
    display: flex;
    flex-direction: column;
  }

  .empty-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 68px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .day-cell:hover .empty-cell {
    opacity: 1;
  }

  .add-icon {
    font-size: 24px;
    color: #adb5bd;
    font-weight: 300;
  }

  .day-cell.has-schedules .empty-cell {
    display: none;
  }

  @media (max-width: 768px) {
    .day-cell {
      min-height: 100px;
      padding: 8px;
    }
  }
</style>
