<script>
  import { createEventDispatcher } from 'svelte';
  import DayCell from './DayCell.svelte';
  import { calculateTechnicianHours } from '../lib/calculations';

  export let technician;
  export let dates = [];
  export let schedules = {};
  export let companies = [];
  export let allowOverlaps = false;

  const dispatch = createEventDispatcher();

  function handleScheduleDrop(event) {
    dispatch('scheduleDrop', event.detail);
  }

  function handleScheduleEdit(event) {
    dispatch('scheduleEdit', event.detail);
  }

  function handleScheduleDelete(event) {
    dispatch('scheduleDelete', event.detail);
  }

  function handleCellClick(event) {
    dispatch('cellClick', event.detail);
  }

  // Calculate total hours for this technician
  $: allSchedules = Object.values(schedules).flat();
  $: totalHours = allSchedules.reduce((sum, s) => sum + (parseFloat(s.scheduled_hours) || 0), 0);
  $: scheduleCount = allSchedules.length;
</script>

<div class="technician-row">
  <div class="tech-info">
    <div class="tech-name">{technician.full_name}</div>
    <div class="tech-stats">
      <span class="stat">
        {scheduleCount} schedule{scheduleCount !== 1 ? 's' : ''}
      </span>
      <span class="stat-separator">•</span>
      <span class="stat">
        {totalHours.toFixed(1)}h
      </span>
    </div>
  </div>

  <div class="tech-days">
    {#each dates as date}
      <DayCell
        date={date.gregorianDate}
        technicianId={technician.id}
        schedules={schedules[date.gregorianDate] || []}
        {companies}
        isWeekend={date.isWeekend}
        on:scheduleDrop={handleScheduleDrop}
        on:scheduleEdit={handleScheduleEdit}
        on:scheduleDelete={handleScheduleDelete}
        on:cellClick={handleCellClick}
      />
    {/each}
  </div>
</div>

<style>
  .technician-row {
    display: grid;
    grid-template-columns: 200px 1fr;
    border-bottom: 1px solid #dee2e6;
  }

  .tech-info {
    padding: 12px 16px;
    border-right: 1px solid #dee2e6;
    background: #f8f9fa;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: sticky;
    left: 0;
    z-index: 5;
  }

  .tech-name {
    font-weight: 600;
    font-size: 14px;
    color: #212529;
    margin-bottom: 4px;
  }

  .tech-stats {
    font-size: 12px;
    color: #6c757d;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .stat {
    white-space: nowrap;
  }

  .stat-separator {
    color: #dee2e6;
  }

  .tech-days {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  }

  @media (max-width: 768px) {
    .technician-row {
      grid-template-columns: 150px 1fr;
    }

    .tech-info {
      padding: 8px 12px;
    }

    .tech-name {
      font-size: 13px;
    }

    .tech-stats {
      font-size: 11px;
    }
  }
</style>
