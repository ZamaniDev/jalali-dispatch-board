<script>
  import { createEventDispatcher } from 'svelte';
  import { JalaliHelper } from '../lib/jalali';

  export let currentMonth;

  const dispatch = createEventDispatcher();

  function goToPreviousMonth() {
    let newMonth = currentMonth.month - 1;
    let newYear = currentMonth.year;

    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }

    dispatch('monthChange', { year: newYear, month: newMonth });
  }

  function goToNextMonth() {
    let newMonth = currentMonth.month + 1;
    let newYear = currentMonth.year;

    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }

    dispatch('monthChange', { year: newYear, month: newMonth });
  }

  function goToCurrentMonth() {
    dispatch('monthChange', JalaliHelper.getCurrentMonth());
  }

  $: monthName = JalaliHelper.getMonthName(currentMonth.month);
  $: isCurrentMonth = (() => {
    const current = JalaliHelper.getCurrentMonth();
    return current.year === currentMonth.year && current.month === currentMonth.month;
  })();
</script>

<div class="board-header">
  <div class="header-left">
    <h2 class="board-title">Dispatch Calendar</h2>
    <div class="month-display">
      <span class="month-name">{monthName}</span>
      <span class="year">{currentMonth.year}</span>
    </div>
  </div>

  <div class="header-center">
    <div class="month-navigation">
      <button
        type="button"
        class="nav-btn"
        on:click={goToPreviousMonth}
        aria-label="Previous month"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
        </svg>
      </button>

      <button
        type="button"
        class="today-btn"
        class:active={isCurrentMonth}
        on:click={goToCurrentMonth}
        disabled={isCurrentMonth}
      >
        Today
      </button>

      <button
        type="button"
        class="nav-btn"
        on:click={goToNextMonth}
        aria-label="Next month"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
        </svg>
      </button>
    </div>
  </div>

  <div class="header-right">
    <div class="legend">
      <div class="legend-item">
        <span class="legend-color status-planned"></span>
        <span class="legend-label">Planned</span>
      </div>
      <div class="legend-item">
        <span class="legend-color status-confirmed"></span>
        <span class="legend-label">Confirmed</span>
      </div>
      <div class="legend-item">
        <span class="legend-color status-completed"></span>
        <span class="legend-label">Completed</span>
      </div>
    </div>
  </div>
</div>

<style>
  .board-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    background: white;
    border-bottom: 1px solid #dee2e6;
    gap: 24px;
    flex-wrap: wrap;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .board-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #212529;
  }

  .month-display {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .month-name {
    font-size: 18px;
    font-weight: 600;
    color: #495057;
  }

  .year {
    font-size: 14px;
    color: #6c757d;
  }

  .header-center {
    flex: 1;
    display: flex;
    justify-content: center;
  }

  .month-navigation {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .nav-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    border: 1px solid #dee2e6;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    color: #495057;
    transition: all 0.2s;
  }

  .nav-btn:hover {
    background: #f8f9fa;
    border-color: #adb5bd;
  }

  .nav-btn:active {
    background: #e9ecef;
  }

  .today-btn {
    padding: 8px 16px;
    border: 1px solid #dee2e6;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: #495057;
    transition: all 0.2s;
  }

  .today-btn:hover:not(:disabled) {
    background: #f8f9fa;
    border-color: #adb5bd;
  }

  .today-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .today-btn.active {
    background: #e7f5ff;
    border-color: #74c0fc;
    color: #1971c2;
  }

  .header-right {
    display: flex;
    align-items: center;
  }

  .legend {
    display: flex;
    gap: 16px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .legend-color {
    width: 12px;
    height: 12px;
    border-radius: 2px;
  }

  .legend-label {
    font-size: 13px;
    color: #6c757d;
  }

  .status-planned {
    background: #3b82f6;
  }

  .status-confirmed {
    background: #10b981;
  }

  .status-completed {
    background: #6c757d;
  }

  @media (max-width: 768px) {
    .board-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .header-center {
      justify-content: flex-start;
    }

    .legend {
      flex-wrap: wrap;
    }
  }
</style>
