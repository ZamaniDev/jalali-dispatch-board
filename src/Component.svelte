<script>
  import { getContext } from "svelte";
  import DispatchBoard from "./components/DispatchBoard.svelte";

  // Budibase context
  const component = getContext("component");
  const { styleable, builderStore } = getContext("sdk");

  // Props from Budibase
  export let schedulesDataSource;
  export let techniciansDataSource;
  export let companiesDataSource;
  export let defaultHours = 8;
  export let showWarnings = true;
  export let allowOverlaps = false;
  export let onScheduleCreate;
  export let onScheduleUpdate;
  export let onScheduleDelete;

  // Fetch data from datasources
  $: schedules = schedulesDataSource?.rows || [];
  $: technicians = techniciansDataSource?.rows || [];
  $: companies = companiesDataSource?.rows || [];
</script>

<div use:styleable={$component.styles} class="jalali-dispatch-container">
  <DispatchBoard
    {schedules}
    {technicians}
    {companies}
    {defaultHours}
    {showWarnings}
    {allowOverlaps}
    {onScheduleCreate}
    {onScheduleUpdate}
    {onScheduleDelete}
  />
</div>

<style>
  .jalali-dispatch-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
</style>