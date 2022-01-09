<template>
  Max 3 per transaction
  <input v-model="qty" type="number" min="1" max="3" placeholder="Number of CRYPTs" />
  <button type="button" @click="mint(qty)">Mint</button>
  <Modal v-if="minting" @close="reset">
    <template #header>
      Minting CRYPTs
    </template>
    <div class="flex items-center justify-center my-4">
      <Transaction :transaction="transaction" :receipt="receipt" />
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { inject, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { ethers } from 'ethers'
import Modal from './Modal.vue'
import Transaction from './Transaction.vue'

const props = defineProps({
  account: {
    type: String,
    required: true
  }
})

const router = useRouter()

const stage = inject<number>('stage')
const contract = inject<ethers.Contract>('contract')
const success = inject<(msg: string) => {}>('success')
const qty = ref(1)
const transaction = ref(null)
const receipt = ref(null)
const minting = ref(false)

const mint = async (qty: number) => {
  if (qty < 1) throw new Error('Minimum 1 per transaction')
  if (qty > 3) throw new Error('Maximum 3 per transaction')

  minting.value = true
  transaction.value = null
  receipt.value = null
  try {
    transaction.value = await contract.value.mint(qty, { value: ethers.utils.parseEther('0.025').mul(qty) })
  } catch (e) {
    reset()
    throw e
  }
  console.debug('transaction', transaction.value)
  receipt.value = await transaction.value.wait()
  console.debug('receipt', receipt.value)
  if (receipt.value.status !== 1) throw new Error('Transaction Reverted!')
  success(`Mint successful.`)
  setTimeout(() => {
    minting.value = false
  }, 5000)
}

const reset = () => {
  minting.value = false
  transaction.value = null
  receipt.value = null;
}

watchEffect(async () => {
  if (stage.value < 3) {
    router.push({ name: 'home' })
  }
})
</script>
