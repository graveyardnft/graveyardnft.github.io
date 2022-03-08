<template>
  <img
      :src="src.replace('ipfs://', 'https://dweb.link/ipfs/')"
      class="w-full h-auto mb-2"
      :class="{ loading: loading, 'grayscale-[75%] hover:grayscale-0': grayscale }"
      onerror="this.src='logo.svg';"
  />
</template>

<script setup lang="ts">
defineProps({
  src: {
    type: String
  },
  loading: {
    type: Boolean
  },
  grayscale: {
    type: Boolean,
    default: true
  }
})
</script>
