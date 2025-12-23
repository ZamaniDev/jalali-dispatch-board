<script>
  import { generateAllWarnings, WARNING_TYPES, WARNING_SEVERITY } from '../stores/warnings';
  import { calculateTechnicianHours, calculateCompanyHours } from '../lib/calculations';

  export let schedules = [];
  export let technicians = [];
  export let companies = [];
  export let currentMonth;

  let collapsed = false;

  $: allWarnings = generateAllWarnings(schedules, technicians, companies, currentMonth);
  $: errorCount = allWarnings.filter(w => w.severity === WARNING_SEVERITY.ERROR).length;
  $: warningCount = allWarnings.filter(w => w.severity === WARNING_SEVERITY.WARNING).length;
  $: infoCount = allWarnings.filter(w => w.severity === WARNING_SEVERITY.INFO).length;

  function toggleCollapse() {
    collapsed = !collapsed;
  }

  function getWarningIcon(severity) {
    switch (severity) {
      case WARNING_SEVERITY.ERROR:
        return '⚠️';
      case WARNING_SEVERITY.WARNING:
        return '⚡';
      case WARNING_SEVERITY.INFO:
        return 'ℹ️';
      default:
        return '•';
    }
  }

  function getSeverityClass(severity) {
    return `severity-${severity}`;
  }
</script>

<div class="warning-panel" class:collapsed>
  <div class="panel-header" on:click={toggleCollapse} role="button" tabindex="0" on:keydown={(e) => e.key === 'Enter' && toggleCollapse()}>
    <div class="header-title">
      <span class="title-text">Warnings</span>
      <div class="warning-counts">
        {#if errorCount > 0}
          <span class="count error">{errorCount}</span>
        {/if}
        {#if warningCount > 0}
          <span class="count warning">{warningCount}</span>
        {/if}
        {#if infoCount > 0}
          <span class="count info">{infoCount}</span>
        {/if}
      </div>
    </div>
    <button type="button" class="collapse-btn" aria-label={collapsed ? 'Expand' : 'Collapse'}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        style="transform: rotate({collapsed ? 180 : 0}deg); transition: transform 0.2s;"
      >
        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
      </svg>
    </button>
  </div>

  {#if !collapsed}
    <div class="panel-body">
      {#if allWarnings.length === 0}
        <div class="no-warnings">
          <span class="success-icon">✓</span>
          <span class="success-text">No warnings</span>
        </div>
      {:else}
        <div class="warnings-list">
          {#each allWarnings as warning (warning.id)}
            <div class="warning-item {getSeverityClass(warning.severity)}">
              <span class="warning-icon">{getWarningIcon(warning.severity)}</span>
              <span class="warning-message">{warning.message}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .warning-panel {
    width: 320px;
    background: white;
    border-left: 1px solid #dee2e6;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .warning-panel.collapsed {
    width: 60px;
  }

  .panel-header {
    padding: 16px;
    border-bottom: 1px solid #dee2e6;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    user-select: none;
  }

  .panel-header:hover {
    background: #f8f9fa;
  }

  .header-title {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
  }

  .collapsed .header-title {
    flex-direction: column;
    align-items: flex-start;
  }

  .title-text {
    font-weight: 600;
    font-size: 14px;
    color: #212529;
    white-space: nowrap;
  }

  .collapsed .title-text {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
  }

  .warning-counts {
    display: flex;
    gap: 6px;
  }

  .collapsed .warning-counts {
    flex-direction: column;
    gap: 4px;
  }

  .count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 600;
  }

  .count.error {
    background: #fee2e2;
    color: #991b1b;
  }

  .count.warning {
    background: #fef3c7;
    color: #92400e;
  }

  .count.info {
    background: #dbeafe;
    color: #1e40af;
  }

  .collapse-btn {
    padding: 4px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: #6c757d;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .collapsed .collapse-btn {
    display: none;
  }

  .panel-body {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
  }

  .no-warnings {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 16px;
    gap: 8px;
  }

  .success-icon {
    font-size: 32px;
    color: #10b981;
  }

  .success-text {
    font-size: 14px;
    color: #6c757d;
  }

  .warnings-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .warning-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 10px;
    border-radius: 6px;
    font-size: 13px;
    line-height: 1.4;
  }

  .warning-item.severity-error {
    background: #fef2f2;
    border-left: 3px solid #ef4444;
  }

  .warning-item.severity-warning {
    background: #fffbeb;
    border-left: 3px solid #f59e0b;
  }

  .warning-item.severity-info {
    background: #eff6ff;
    border-left: 3px solid #3b82f6;
  }

  .warning-icon {
    flex-shrink: 0;
    font-size: 16px;
  }

  .warning-message {
    flex: 1;
    color: #374151;
  }

  @media (max-width: 1024px) {
    .warning-panel {
      position: absolute;
      right: 0;
      top: 0;
      bottom: 0;
      z-index: 20;
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
    }
  }
</style>
