<template>
  <div class="container mx-auto flex-col pt-6 pb-32 md:pt-32 px-4 md:px-0 text-center">
    <h1 class="text-3xl md:text-5xl leading-snug mb-4">The Graveyard NFT project is the final resting place for your unsuccessful NFTs on the Ethereum blockchain.</h1>
    <h2 class="text-xl mb-3">Tokens committed to the graveyard: {{ committed.length }}</h2>
    <div class="flex flex-col items-center justify-center my-6">
      <Button class="m-2" @click="router.push({ name: 'committed' })">View Graveyard</Button>
      <Button class="m-2" @click="router.push({ name: 'commit' })">Sacrifice</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { useRouter } from 'vue-router'
import Button from './Button.vue'

const router = useRouter()
const committed = inject<number>('committed')
</script>
