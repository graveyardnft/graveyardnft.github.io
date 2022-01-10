<template>
  <div v-if="stage === 1" class="container mx-auto pt-6 pb-32 md:pt-32 px-4 md:px-0 text-center">
    <h1 class="text-3xl md:text-5xl leading-snug mb-8">Whitelisted {{ whitelisted.length }}/2000</h1>
    <h2 v-if="isWhitelisted" class="text-xl">Congratulations! {{ ensName || shortAccount }} Is whitelisted!</h2>
    <h3 v-else-if="whitelisted.length >= 2000" class="text-xl">
      Whitelist full, join us on discord for announcements on the public sale.
    </h3>
    <Commit v-else :account="account" :graveyardAddress="contract.address" />
  </div>
  <div v-else-if="stage === 2" class="container mx-auto pt-6 pb-32 md:pt-32 px-4 md:px-0 text-center">
    <div class="text-3xl md:text-5xl leading-snug mb-8 text-center">{{ minted }}/{{ maxSupply }} Minted</div>
    <template v-if="isWhitelisted">
      <h2 class="text-xl mb-8">Congratulations! {{ ensName || shortAccount }} Is whitelisted!</h2>
      <WhitelistMint :account="account" :proofs="proofs" />
    </template>
    <h2 v-else class="text-xl">{{ ensName || shortAccount }} is not whitelisted, join us on discord for announcements on the public sale.</h2>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { ethers } from 'ethers'
import Modal from './Modal.vue'
import Commit from './Commit.vue'
import WhitelistMint from './WhitelistMint.vue'
import wl from '../whitelist.json'

const router = useRouter()

const account = inject<string|null>('account', null)
const shortAccount = inject<string|null>('shortAccount', null)
const ensName = inject<string|null>('ensName', null)
const contract = inject<ethers.Contract>('contract')
const stage = inject<number>('stage')
const minted = inject<number>('minted')
const maxSupply = inject<number>('maxSupply')

const whitelisted = ref<string[]>([])
const isWhitelisted = computed(() => {
  if (stage.value < 2) return whitelisted.value.includes(account.value)
  return Object.keys(wl.proofs).map(a => a.toLowerCase()).includes(account.value)
})
const proofs = computed(() => Object.entries(wl.proofs).find(([address]) => address.toLowerCase() == account.value)[1] || [])

const loadWhitelist = async (contract: ethers.Contract) => {
  whitelisted.value = (await contract.queryFilter(contract.filters.Committed(), (await contract.CREATION_BLOCK()).toNumber()))
    .map((event: any) => event.args.from.toLowerCase())
    .filter((value, index, self) => self.indexOf(value) === index)
    .slice(0, 2000);
  console.debug('whitelist', whitelisted.value);
  if (whitelisted.value.length < 2000) {
    contract.on(contract.filters.Committed(), (from, contractAddress, tokenId, data) => {
      if (!whitelisted.value.includes(from)) {
        whitelisted.value.push(from.toLowerCase());
      }
      console.debug('whitelist event', from, contractAddress, tokenId, data);
    })
  }
}

watchEffect(async () => {
  if (![1,2].includes(stage.value)) {
    router.push({ name: 'home' })
  } else {
    loadWhitelist(contract.value)
  }
})
</script>
