<script>
  import Component from "../src/Component.svelte"
  import Boundary from "./Boundary"
</script>

<Boundary>
  <Component {...$$restProps}>
    <slot />
  </Component>
</Boundary>

<style>
  :global(.plugin-error) { color: var(--spectrum-global-color-red-500); font-size: 0.9em; }
  :global(.plugin-error:empty) { display: none; }
</style>
