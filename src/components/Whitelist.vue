<template>
  <div v-if="stage === 1" class="container mx-auto pt-6 pb-32 md:pt-32 px-4 md:px-0 text-center">
    <h1 class="text-3xl md:text-5xl leading-snug mb-8">Whitelisting</h1>
    <h2 v-if="whitelisted" class="text-xl">Congratulations! {{ ensName || shortAccount }} Is whitelisted!</h2>
<!--    <h3 v-else-if="whitelisted.length >= 2000" class="text-xl">-->
<!--      Whitelist full, join us on discord for announcements on the public sale.-->
<!--    </h3>-->
    <template v-else>
      <p class="text-lg mb-8">Committing NFTs to the Graveyard is your last action as the token holder.<br/>Committal transfers ownership to the contract, and they are no longer in your control.<br/>This is not staking, you no longer own the token.</p>
      <Commit :account="account" :graveyardAddress="contract.address" />
    </template>
  </div>
  <div v-else-if="stage === 2" class="container mx-auto pt-6 pb-32 md:pt-32 px-4 md:px-0 text-center">
    <div class="text-3xl md:text-5xl leading-snug mb-8 text-center">{{ minted }}/{{ maxSupply }} Minted</div>
    <template v-if="whitelisted">
      <h2 class="text-xl mb-8">Congratulations! {{ ensName || shortAccount }} Is whitelisted!</h2>
      <WhitelistMint :account="account" :proofs="[]" />
    </template>
    <h2 v-else class="text-xl">{{ ensName || shortAccount }} is not whitelisted, join us on discord for announcements on the public sale.</h2>
  </div>
  <div v-else class="container mx-auto pt-6 pb-32 md:pt-32 px-4 md:px-0 text-center">
    <h2 class="text-5xl">Whitelisting inactive.</h2>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, watchEffect } from 'vue'
import { ethers } from 'ethers'
import Commit from './Commit.vue'
import WhitelistMint from './WhitelistMint.vue'

const account = inject<string|null>('account', null)
const shortAccount = inject<string|null>('shortAccount', null)
const ensName = inject<string|null>('ensName', null)
const contract = inject<ethers.Contract>('contract')
const stage = inject<number>('stage')
const minted = inject<number>('minted')
const maxSupply = inject<number>('maxSupply')

const whitelisted = ref<boolean>(false)

const checkWhitelist = async (contract: ethers.Contract) => {
  whitelisted.value = await contract.isWhitelisted(account.value, 1);
}

watchEffect(async () => {
  if ([1,2].includes(stage.value)) {
    checkWhitelist(contract.value);
    contract.value.on(contract.value.filters.Committed(), () => checkWhitelist(contract.value));
  }
})
</script>
