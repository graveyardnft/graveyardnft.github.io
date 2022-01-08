<template>
  <div v-if="stage === 0">
    Hello intro yadiyada
  </div>
  <div v-else-if="stage === 1">
    <a href="#" @click.prevent="router.push({ name: 'whitelist' })">Whitelist</a>
  </div>
  <div v-else-if="stage >= 2">
    <template v-if="minted <= maxSupply">
      {{ minted }}/{{ maxSupply }} Minted<br/>
      <a v-if="stage === 2" href="#" @click.prevent="router.push({ name: 'whitelist' })">Whitelist Mint</a><br/>
      <a v-if="stage >= 3" href="#" @click.prevent="router.push({ name: 'mint' })">Mint</a><br/>
    </template>
    <a v-if="minted > 0" href="#" @click.prevent="router.push({ name: 'crypts' })">View CRYPTs</a>
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
