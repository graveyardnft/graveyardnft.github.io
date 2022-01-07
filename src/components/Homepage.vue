<template>
  <div v-if="stage === 0">
    Hello intro yadiyada
  </div>
  <div v-else-if="stage === 1">
    <a href="#" @click.prevent="router.push({ name: 'whitelist' })">Whitelist</a>
  </div>
  <div v-else-if="stage === 2">
    <a href="#" @click.prevent="router.push({ name: 'whitelist' })">Whitelist Mint</a>
  </div>
  <div v-else-if="stage >= 3">
    <template v-if="minted < maxSupply">
      {{ minted }}/{{ maxSupply }} Minted
      <a href="#" @click.prevent="router.push({ name: 'whitelist' })">Whitelist Mint</a>
      <a href="#" @click.prevent="router.push({ name: 'mint' })">Mint</a>
    </template>
    <template v-else>
      MINTED OUT! buy on opensea link here {{ minted }}
    </template>
    <a href="#" @click.prevent="router.push({ name: 'crypts' })">View CRYPTs</a>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const stage = inject('stage')
const minted = inject('minted')
const maxSupply = inject('maxSupply')
</script>
