<template>
  <a
      @click.prevent="$emit('click')"
      class="w-80 m-4 p-2 bg-slate-800 rounded border border-slate-900 shadow text-center cursor-pointer"
  >
    <div v-if="tokenName" class="mb-2">{{ tokenName }}<template v-if="tokenSymbol"> ({{ tokenSymbol }})</template></div>
    <TokenImage :src="metaData?.image || 'logo.svg'" :loading="loading" :grayscale="grayscale" />
    <div class="break-words">{{ metaData?.name || tokenId }}</div>
  </a>
</template>

<script setup lang="ts">
import TokenImage from './TokenImage.vue'

const props = defineProps({
  tokenName: {
    type: String
  },
  tokenSymbol: {
    type: String
  },
  loading: {
    type: Boolean
  },
  tokenId: {
    type: Number
  },
  metaData: {
    type: Object
  },
  grayscale: {
    type: Boolean,
    default: true
  }
})

defineEmits({
  click: null
})
</script>
