#!/bin/bash

echo "Converting Svelte 5 to Svelte 4 syntax..."

# Find all .svelte and .js files
find src -type f \( -name "*.svelte" -o -name "*.js" \) | while read file; do
  echo "Processing: $file"
  
  # Replace $state
  sed -i 's/let \([a-zA-Z_][a-zA-Z0-9_]*\) = \$state(\(.*\));/let \1 = \2;/g' "$file"
  
  # Replace $derived with $:
  sed -i 's/let \([a-zA-Z_][a-zA-Z0-9_]*\) = \$derived(\(.*\));/$: \1 = \2;/g' "$file"
  
  # Replace $effect with $:
  sed -i 's/\$effect(() => {/$: {/g' "$file"
  
  # Replace $props (simple case)
  sed -i 's/let { \(.*\) } = \$props();/export let \1;/g' "$file"
done

echo "Conversion complete!"
