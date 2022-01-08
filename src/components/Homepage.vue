<template>
  <div>The Graveyard NFT project is the final resting place for your unsuccessful NFTs on the Ethereum blockchain.</div>
  <div v-if="stage === 0">
    Join our discord to stay up to date on news and announcements
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
    <a v-if="minted > 0" :href="openSea">View CRYPTs on OpenSea</a>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const stage = inject<number>('stage')
const minted = inject<number>('minted')
const maxSupply = inject<number>('maxSupply')
const openSea = inject<string>('openSea')
</script>
