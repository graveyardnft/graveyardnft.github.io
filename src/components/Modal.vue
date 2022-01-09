<template>
  <div class="fixed top-0 left-0 w-full h-full bg-black/25 flex items-center justify-center">
    <div class="w-full sm:w-2/3 lg:w-1/3 bg-gray-900 rounded-lg border border-gray-800 shadow">
      <header class="flex items-center p-4 border-b border-gray-800">
        <div>
          <slot name="header" />
        </div>
        <svg viewBox="0 0 24 24" class="flex flex-shrink-0 fill-current w-4 h-4 ml-auto cursor-pointer" @click="$emit('close')">
          <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
        </svg>
      </header>
      <div class="p-4">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

</script>
