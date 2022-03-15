<template>
  <div class="container mx-auto flex-col pt-6 pb-32 md:pt-32 px-4 md:px-0 text-center">
    <h1 class="text-xl md:text-3xl leading-snug mb-4">$URN is a ERC20 token of no fixed supply, yielded by $CRYPT’s and returned for tokens sent to the Graveyard.</h1>
    <h2 class="md:text-xl leading-snug mb-8">$URN may be used/burnt for future benefits outside of the promised utility of $CRYPT’s either directly by the project or through partnerships.</h2>
    <h2 class="text-xl mb-3">$URN Supply: ~</h2>
    <h2 class="text-xl mb-3">Daily $URN reward rate: {{ rewardRate }}</h2>
    <h2 class="text-xl mb-3">Pending $URN rewards: {{ rewards }}</h2>
  </div>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import { ethers } from 'ethers'

const graveyard = inject('contract')
const crypt = inject('crypt')
const account = inject('account')
const rewards = ref(0)
const rewardRate = ref(0)

const updateRewards = async () => {
  rewards.value = ethers.utils.formatEther(await graveyard.value.claimable(account.value))
  rewardRate.value = ethers.utils.formatEther(await crypt.value.getRewardRate(account.value))
}

updateRewards()
setInterval(() => updateRewards(), 5000)
</script>
