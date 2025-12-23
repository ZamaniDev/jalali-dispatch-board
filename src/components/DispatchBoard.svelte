<script>
  import { writable } from 'svelte/store';
  import BoardHeader from './BoardHeader.svelte';
  import TechnicianRow from './TechnicianRow.svelte';
  import WarningPanel from './WarningPanel.svelte';
  import ScheduleModal from './ScheduleModal.svelte';
  import { JalaliHelper } from '../lib/jalali';

  export let schedules = [];
  export let technicians = [];
  export let companies = [];
  export let defaultHours = 8;
  export let showWarnings = true;
  export let allowOverlaps = false;
  export let onScheduleCreate;
  export let onScheduleUpdate;
  export let onScheduleDelete;

  // Current month state
  let currentMonth = JalaliHelper.getCurrentMonth();
  let dates = [];

  // Modal state
  let modalOpen = false;
  let editingSchedule = null;

  // Calculate dates when month changes
  $: dates = JalaliHelper.getDatesInMonth(currentMonth.year, currentMonth.month);

  // Filter schedules for current month
  $: monthSchedules = schedules.filter(s => {
    const scheduleMonth = JalaliHelper.toJalali(s.scheduled_date).substring(0, 7);
    const currentMonthStr = `${currentMonth.year}/${String(currentMonth.month).padStart(2, '0')}`;
    return scheduleMonth === currentMonthStr;
  });

  // Group schedules by technician and date
  $: scheduleGrid = buildScheduleGrid(monthSchedules, technicians, dates);

  function buildScheduleGrid(schedules, techs, dates) {
    const grid = {};
    
    techs.forEach(tech => {
      grid[tech.id] = {};
      dates.forEach(date => {
        grid[tech.id][date.gregorianDate] = schedules.filter(s => 
          s.technician_id === tech.id && 
          s.scheduled_date === date.gregorianDate
        );
      });
    });
    
    return grid;
  }

  function handleMonthChange(newMonth) {
    currentMonth = newMonth;
  }

  function handleScheduleDrop(event) {
    const { technicianId, date, schedule } = event.detail;
    
    // Update schedule with new date/technician
    const updated = {
      ...schedule,
      technician_id: technicianId,
      scheduled_date: date,
      scheduled_date_jalali: JalaliHelper.toJalali(date)
    };
    
    onScheduleUpdate?.(updated);
  }

  function handleScheduleEdit(schedule) {
    editingSchedule = schedule;
    modalOpen = true;
  }

  function handleScheduleDelete(schedule) {
    if (confirm('Delete this schedule?')) {
      onScheduleDelete?.(schedule);
    }
  }

  function handleCellClick(event) {
    const { technicianId, date } = event.detail;
    editingSchedule = {
      technician_id: technicianId,
      scheduled_date: date,
      scheduled_date_jalali: JalaliHelper.toJalali(date),
      scheduled_hours: defaultHours,
      status: 'planned'
    };
    modalOpen = true;
  }

  function handleModalSave(schedule) {
    if (schedule.id) {
      onScheduleUpdate?.(schedule);
    } else {
      onScheduleCreate?.(schedule);
    }
    modalOpen = false;
    editingSchedule = null;
  }

  function handleModalClose() {
    modalOpen = false;
    editingSchedule = null;
  }
</script>

<div class="dispatch-board">
  <BoardHeader
    {currentMonth}
    on:monthChange={e => handleMonthChange(e.detail)}
  />

  <div class="board-content">
    <div class="board-grid">
      <!-- Date headers -->
      <div class="grid-header">
        <div class="tech-name-header">Technician</div>
        {#each dates as date}
          <div class="date-header" class:weekend={date.isWeekend}>
            <div class="date-day">{date.day}</div>
            <div class="date-weekday">{date.weekday}</div>
          </div>
        {/each}
      </div>

      <!-- Technician rows -->
      <div class="grid-body">
        {#each technicians as technician}
          <TechnicianRow
            {technician}
            {dates}
            schedules={scheduleGrid[technician.id] || {}}
            {companies}
            {allowOverlaps}
            on:scheduleDrop={handleScheduleDrop}
            on:scheduleEdit={e => handleScheduleEdit(e.detail)}
            on:scheduleDelete={e => handleScheduleDelete(e.detail)}
            on:cellClick={handleCellClick}
          />
        {/each}
      </div>
    </div>

    {#if showWarnings}
      <WarningPanel
        {schedules}
        {technicians}
        {companies}
        {currentMonth}
      />
    {/if}
  </div>
</div>

{#if modalOpen}
  <ScheduleModal
    schedule={editingSchedule}
    {technicians}
    {companies}
    on:save={e => handleModalSave(e.detail)}
    on:close={handleModalClose}
  />
{/if}

<style>
  .dispatch-board {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #f8f9fa;
  }

  .board-content {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  .board-grid {
    flex: 1;
    overflow: auto;
    background: white;
  }

  .grid-header {
    display: grid;
    grid-template-columns: 200px repeat(auto-fit, minmax(80px, 1fr));
    position: sticky;
    top: 0;
    background: white;
    border-bottom: 2px solid #dee2e6;
    z-index: 10;
  }

  .tech-name-header {
    padding: 16px;
    font-weight: 600;
    border-right: 1px solid #dee2e6;
  }

  .date-header {
    padding: 8px;
    text-align: center;
    border-right: 1px solid #e9ecef;
    font-size: 14px;
  }

  .date-header.weekend {
    background: #fff3cd;
  }

  .date-day {
    font-weight: 600;
    font-size: 16px;
  }

  .date-weekday {
    font-size: 11px;
    color: #6c757d;
    margin-top: 2px;
  }

  .grid-body {
    min-height: 500px;
  }
</style>