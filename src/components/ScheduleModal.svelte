<script>
  import { createEventDispatcher } from 'svelte';
  import { JalaliHelper } from '../lib/jalali';
  import { validateSchedule, getScheduleWarnings } from '../lib/validation';

  export let schedule;
  export let technicians = [];
  export let companies = [];

  const dispatch = createEventDispatcher();

  let formData = { ...schedule };
  let errors = [];
  let warnings = [];

  // Initialize form
  $: {
    formData = { ...schedule };
    if (!formData.status) formData.status = 'planned';
    if (!formData.scheduled_hours) formData.scheduled_hours = 8;
  }

  function handleSubmit() {
    // Validate
    const validation = validateSchedule(formData);
    errors = validation.errors;

    if (!validation.valid) {
      return;
    }

    // Emit save event
    dispatch('save', formData);
  }

  function handleClose() {
    dispatch('close');
  }

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') {
      handleClose();
    }
  }

  $: jalaliDate = formData.scheduled_date
    ? JalaliHelper.toJalali(formData.scheduled_date)
    : '';

  $: isEdit = !!schedule.id;
  $: modalTitle = isEdit ? 'Edit Schedule' : 'Create Schedule';
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="modal-overlay" on:click={handleOverlayClick}>
  <div class="modal-container">
    <div class="modal-header">
      <h3 class="modal-title">{modalTitle}</h3>
      <button type="button" class="close-btn" on:click={handleClose} aria-label="Close">
        ×
      </button>
    </div>

    <form class="modal-body" on:submit|preventDefault={handleSubmit}>
      {#if errors.length > 0}
        <div class="error-banner">
          {#each errors as error}
            <div class="error-message">⚠️ {error}</div>
          {/each}
        </div>
      {/if}

      <div class="form-group">
        <label for="technician" class="form-label">
          Technician <span class="required">*</span>
        </label>
        <select
          id="technician"
          class="form-control"
          bind:value={formData.technician_id}
          required
        >
          <option value="">Select technician...</option>
          {#each technicians as tech}
            <option value={tech.id}>{tech.full_name}</option>
          {/each}
        </select>
      </div>

      <div class="form-group">
        <label for="company" class="form-label">
          Company <span class="required">*</span>
        </label>
        <select
          id="company"
          class="form-control"
          bind:value={formData.company_id}
          required
        >
          <option value="">Select company...</option>
          {#each companies as company}
            <option value={company.id}>
              {company.name}
              {#if company.monthly_hours}
                ({company.monthly_hours}h/month)
              {/if}
            </option>
          {/each}
        </select>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="date" class="form-label">
            Date <span class="required">*</span>
          </label>
          <input
            id="date"
            type="date"
            class="form-control"
            bind:value={formData.scheduled_date}
            required
          />
          {#if jalaliDate}
            <div class="form-hint">Jalali: {jalaliDate}</div>
          {/if}
        </div>

        <div class="form-group">
          <label for="hours" class="form-label">
            Hours <span class="required">*</span>
          </label>
          <input
            id="hours"
            type="number"
            class="form-control"
            bind:value={formData.scheduled_hours}
            min="0.5"
            max="24"
            step="0.5"
            required
          />
        </div>
      </div>

      <div class="form-group">
        <label for="status" class="form-label">
          Status <span class="required">*</span>
        </label>
        <select
          id="status"
          class="form-control"
          bind:value={formData.status}
          required
        >
          <option value="planned">Planned</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div class="form-group">
        <label for="notes" class="form-label">
          Notes
        </label>
        <textarea
          id="notes"
          class="form-control"
          bind:value={formData.notes}
          rows="3"
          placeholder="Add any notes or details..."
        ></textarea>
      </div>

      {#if isEdit && formData.override_reason !== undefined}
        <div class="form-group">
          <label for="override_reason" class="form-label">
            Override Reason
          </label>
          <textarea
            id="override_reason"
            class="form-control"
            bind:value={formData.override_reason}
            rows="2"
            placeholder="Reason for overriding warnings..."
          ></textarea>
        </div>
      {/if}

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" on:click={handleClose}>
          Cancel
        </button>
        <button type="submit" class="btn btn-primary">
          {isEdit ? 'Save Changes' : 'Create Schedule'}
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }

  .modal-container {
    background: white;
    border-radius: 8px;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    max-width: 600px;
    width: 100%;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    padding: 20px 24px;
    border-bottom: 1px solid #dee2e6;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .modal-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #212529;
  }

  .close-btn {
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    background: transparent;
    font-size: 28px;
    line-height: 1;
    color: #6c757d;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: #f8f9fa;
    color: #212529;
  }

  .modal-body {
    padding: 24px;
    overflow-y: auto;
    flex: 1;
  }

  .error-banner {
    padding: 12px 16px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 6px;
    margin-bottom: 20px;
  }

  .error-message {
    font-size: 14px;
    color: #991b1b;
    margin-bottom: 4px;
  }

  .error-message:last-child {
    margin-bottom: 0;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .form-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 6px;
  }

  .required {
    color: #ef4444;
  }

  .form-control {
    width: 100%;
    padding: 8px 12px;
    font-size: 14px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background: white;
    transition: all 0.2s;
  }

  .form-control:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  textarea.form-control {
    resize: vertical;
    font-family: inherit;
  }

  .form-hint {
    margin-top: 4px;
    font-size: 12px;
    color: #6c757d;
  }

  .modal-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding-top: 20px;
    margin-top: 20px;
    border-top: 1px solid #e5e7eb;
  }

  .btn {
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    border-radius: 6px;
    border: 1px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-secondary {
    background: white;
    color: #374151;
    border-color: #d1d5db;
  }

  .btn-secondary:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }

  .btn-primary {
    background: #3b82f6;
    color: white;
  }

  .btn-primary:hover {
    background: #2563eb;
  }

  @media (max-width: 640px) {
    .modal-container {
      max-width: 100%;
      margin: 0;
      border-radius: 0;
    }

    .form-row {
      grid-template-columns: 1fr;
    }
  }
</style>
