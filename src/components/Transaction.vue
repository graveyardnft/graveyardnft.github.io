<template>
  <svg v-if="!receipt" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="fill-current w-10 h-10">
    <path d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50">
      <animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="1s" from="0 50 50" to="360 50 50" repeatCount="indefinite" />
    </path>
  </svg>
  <span v-if="!transaction?.hash">Waiting for signature</span>
  <svg v-else-if="receipt?.status === 1" viewBox="0 0 24 24" class="fill-green-500 w-8 h-8">
    <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
  </svg>
  <svg v-else-if="receipt?.status === 0" viewBox="0 0 24 24" class="fill-red-500 w-8 h-8">
    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
  </svg>
  <a v-if="transaction?.hash" :href="`${etherscanUrl}/tx/${transaction?.hash}`" target="_blank" rel="noopener" class="ml-2">View Transaction</a>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { ethers } from 'ethers'

const props = defineProps({
  transaction: {
    type: ethers.Transaction
  },
  receipt: {
    type: ethers.TransactionReceipt
  }
})

const etherscanUrl = inject<string>('etherscanUrl')
</script>
