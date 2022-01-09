<template>
  <div class="container mx-auto flex-col py-32 text-center">
    <h1 class="text-5xl leading-snug">The Graveyard NFT project is the final resting place for your unsuccessful NFTs on the Ethereum blockchain.</h1>
    <h2 class="text-md">Join our discord to stay up to date on news and announcements.</h2>
    <div class="flex items-center justify-center my-8">
      <Button v-if="stage === 1" @click="router.push({ name: 'whitelist' })" class="mx-2">Whitelist</Button>
      <Button class="mx-2" @click="router.push({ name: 'last-rites' })">Last Rites</Button>
    </div>
    <div v-if="stage >= 2">
      <div class="text-5xl leading-snug my-8 text-center">{{ minted }}/{{ maxSupply }} Minted</div>
      <template v-if="minted <= maxSupply">
        <div class="flex items-center justify-center">
          <Button v-if="stage === 2" class="mx-2" @click="router.push({ name: 'whitelist' })">Whitelist Mint</Button>
          <Button v-else class="mx-2" @click="router.push({ name: 'mint' })">Mint</Button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { useRouter } from 'vue-router'
import Button from './Button.vue'

const router = useRouter()

const stage = inject<number>('stage')
const minted = inject<number>('minted')
const maxSupply = inject<number>('maxSupply')
const openSea = inject<string>('openSea')
</script>
