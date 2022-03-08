<template>
  <div class="container mx-auto pt-6 pb-32 md:pt-32 px-4 md:px-0 text-center">
    <h1 class="text-3xl md:text-5xl leading-snug mb-4">Committal</h1>
    <p class="text-lg mb-8">Committing NFTs to the Graveyard is your last action as the token holder.<br/>Committal transfers ownership to the contract, and they are no longer in your control.<br/>This is not staking, you no longer own the token.</p>
    <Commit v-if="account && contract && stage >= 4" :account="account" :graveyardAddress="contract.address" />
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { useRouter } from 'vue-router'
import { ethers } from 'ethers'
import Commit from './Commit.vue'

const router = useRouter()

const account = inject<string|null>('account', null)
const contract = inject<ethers.Contract>('contract')
const stage = inject<number>('stage')
</script>
