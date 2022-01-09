<template>
  <a
      class="flex-inline pt-3 pb-2 px-5 cursor-pointer rounded-lg shadow shadow-sky-500/50 border border-sky-900 border-t-sky-500 border-r-sky-500 bg-sky-700 text-slate-800 text-2xl font-bold hover:bg-sky-800"
      @click.prevent="click"
  >
    <slot />
  </a>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
const emits = defineEmits({
  click: null
})

const attrs = useAttrs()

const click = () => {
  if (attrs.href) window.location.href = attrs.href;
  emits('click')
}
</script>
