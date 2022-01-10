<template>
  <div v-if="stage >= 4" class="container mx-auto pt-6 pb-32 md:pt-32 px-4 md:px-0 text-center">
    <div class="flex flex-wrap items-center justify-center">
      <div class="m-4 p-8 bg-gray-600/90 rounded border-4 border-gray-700">
        <h3 class="text-5xl text-center leading-snug text-slate-800">SOLD OUT</h3>
        hello
      </div>
      <div class="m-4 p-8 bg-gray-600/90 rounded border-4 border-gray-700">
        <h3 class="text-5xl text-center leading-snug text-slate-800">SOLD OUT</h3>
        hello
      </div>
      <div class="m-4 p-8 bg-gray-600/90 rounded border-4 border-gray-700">
        <h3 class="text-5xl text-center leading-snug text-slate-800">SOLD OUT</h3>
        hello
      </div>
    </div>
  </div>
  <div v-else class="container mx-auto pt-6 pb-32 md:pt-32 px-4 md:px-0 text-center">
    <h2 class="text-5xl">Viewing CRYPT's inactive.</h2>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, watchEffect } from 'vue'
import { ethers } from 'ethers'
import Button from './Button.vue'

const stage = inject<number>('stage')
const contract = inject<ethers.Contract>('contract')
const minted = inject<number>('minted')
const tokens = ref<any[]>([])

const loadTokens = (page: number) => {

}

watchEffect(() => {
  // loadTokens(page)
})
</script>
