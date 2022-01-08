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
      Max 3 per wallet
      <input type="number" v-model="qty" placeholder="Number of CRYPTs" />
      <button type="button" @click="whitelistMint(contract, qty)">Mint</button>
      <Modal v-if="minting" @close="() => { minting = false;transaction = null;receipt = null; }">
        <template #header>
          Minting CRYPTs
        </template>
        <div class="flex items-center justify-center my-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="fill-current w-10 h-10">
            <path d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50">
              <animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="1s" from="0 50 50" to="360 50 50" repeatCount="indefinite" />
            </path>
          </svg>
          <span v-if="!transaction">Waiting for signature</span>
          <a v-else-if="!receipt" :href="`${etherscanUrl}/tx/${transaction?.hash}`" target="_blank" rel="noopener">View Transaction</a>
          <div v-else-if="receipt">
            {{ receipt.logs }}
          </div>
        </div>
      </Modal>
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
import wl from '../whitelist.json'

const router = useRouter()

const account = inject('account', null)
const ensName = inject('ensName', null)
const contract = inject('contract')
const stage = inject('stage')
const success = inject('success')
const etherscanUrl = inject('etherscanUrl')

const whitelisted = ref<string[]>([])
const isWhitelisted = computed(() => {
  if (stage.value < 2) return whitelisted.value.includes(account.value)
  return Object.keys(wl.proofs).map(a => a.toLowerCase()).includes(account.value)
})

const qty = ref(1)
const transaction = ref(null)
const receipt = ref(null)
const minting = ref(false)

const loadWhitelist = async (contract: ethers.Contract) => {
  whitelisted.value = (await contract.queryFilter(contract.filters.Committed(), (await contract.CREATION_BLOCK()).toNumber()))
    .map((event: any) => event.args.from.toLowerCase())
    .filter((value, index, self) => self.indexOf(value) === index)
    .slice(0, 2000);
  console.debug(whitelisted.value);
  if (whitelisted.value.length < 2000) {
    contract.on(contract.filters.Committed(), from => {
      if (!whitelisted.value.includes(from)) {
        whitelisted.value.push(from.toLowerCase());
      }
      console.debug(from);
    })
  }
}

const whitelistMint = async (contract: ethers.Contract, qty: number) => {
  if (qty > 3) throw new Error('Maximum 3 per wallet!')
  const merkle = Object.entries(wl.proofs).find(([a]) => a.toLowerCase() === account.value)
  if (!merkle) throw new Error('Wallet not whitelisted!')

  try {
    minting.value = true
    transaction.value = null
    receipt.value = null
    transaction.value = await contract.whitelistMint(qty, merkle[1], { value: ethers.utils.parseEther('0.025').mul(qty) })
    receipt.value = await transaction.value.wait()
    if (receipt.value.status !== 1) throw new Error('Transaction Reverted!')
    success(`Mint complete.`)
  } catch (e) {
    throw e
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
