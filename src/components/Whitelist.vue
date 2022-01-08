<template>
  <div v-if="stage === 0">
    Whitelisting is not currently activated
  </div>
  <div v-else-if="stage === 1">
    <div>Committed to the whitelist {{ whitelisted.length }}/2000</div>
    <div v-if="isWhitelisted">
      Congratulations! {{ ensName || account }} Is whitelisted!
    </div>
    <div v-else-if="whitelisted.length >= 2000">
      Whitelist full, join us on discord for announcements on the public sale
    </div>
    <Commit v-else :account="account" :graveyardAddress="contract.address" />
  </div>
  <div v-else-if="stage === 2">
    <template v-if="isWhitelisted">
      <div>
        Congratulations! {{ ensName || account }} Is whitelisted!
      </div>
      <WhitelistMint :account="account" :proofs="proofs" />
    </template>
    <div v-else>
      {{ ensName || account }} is not on the whitelist, join us on discord for announcements on the public sale
    </div>
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
const ensName = inject<string|null>('ensName', null)
const contract = inject<ethers.Contract>('contract')
const stage = inject<number>('stage')

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
  if (stage.value > 2) {
    router.push({ name: 'home' })
  } else {
    loadWhitelist(contract.value)
  }
})
</script>
