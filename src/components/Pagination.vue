<template>
  <nav class="inline-flex bg-slate-800 rounded border border-slate-900 shadow md:ml-auto" aria-label="Pagination">
    <a href="#" @click.prevent="$emit('prev')" class="inline-flex items-center px-2 py-2 rounded-l-md text-sm hover:bg-slate-700">
      <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
      </svg>
    </a>
    <span v-if="$slots.default" aria-current="page" class="inline-flex items-center px-4 py-2 border-l border-slate-900 text-sm"><slot /></span>
    <a href="#" @click.prevent="$emit('next')" class="inline-flex items-center px-2 py-2 border-l border-slate-900 rounded-r-md text-sm hover:bg-slate-700">
      <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
      </svg>
    </a>
  </nav>
</template>

<script setup lang="ts">
defineEmits({
  prev: null,
  next: null
})
</script>
