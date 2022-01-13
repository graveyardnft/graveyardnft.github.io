<template>
  <div v-if="stage >= 3" class="container mx-auto pt-6 pb-32 md:pt-32 px-4 md:px-0 text-center">
    <div class="text-3xl md:text-5xl leading-snug mb-8 text-center">{{ minted }}/{{ maxSupply }} Minted</div>
    <div class="flex flex-col w-96 max-w-full mx-auto p-8 bg-slate-900/90 rounded border-4 border-slate-900 text-grey-100">
      <h3 v-if="minted === maxSupply" class="text-5xl text-center leading-snug">SOLD OUT</h3>
      <template v-else>
        <h3 class="mb-2 text-2xl text-center">Max 3 per transaction</h3>
        <h4 class="mb-2 text-xl text-center">0.0{{ qty * 25 }} ETH</h4>
        <div class="mb-2 flex items-center justify-center">
          <a href="#" class="hover:text-grey-900" @click.prevent="decrement">
            <svg viewBox="0 0 24 24" class="fill-current h-6 w-6">
              <path d="M17,13H7V11H17M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
          </a>
          <input v-model="qty" type="number" disabled min="1" max="3" class="p-2 rounded text-2xl bg-transparent text-center placeholder:text-grey-100 outline-none focus:ring ring-slate-800/25" placeholder="Number of CRYPTs" />
          <a href="#" class="hover:text-grey-900" @click.prevent="increment">
            <svg viewBox="0 0 24 24" class="fill-current h-6 w-6">
              <path d="M17,13H13V17H11V13H7V11H11V7H13V11H17M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
          </a>
        </div>
        <Button @click="mint(qty)">Mint</Button>
      </template>
    </div>
    <Modal v-if="minting" @close="reset">
      <template #header>
        Minting CRYPTs
      </template>
      <div class="flex items-center justify-center my-4">
        <Transaction :transaction="transaction" :receipt="receipt" />
      </div>
    </Modal>
  </div>
  <div v-else class="container mx-auto pt-6 pb-32 md:pt-32 px-4 md:px-0 text-center">
    <h2 class="text-5xl">Minting inactive.</h2>
  </div>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import { ethers } from 'ethers'
import Modal from './Modal.vue'
import Transaction from './Transaction.vue'
import Button from './Button.vue'

const stage = inject<number>('stage')
const contract = inject<ethers.Contract>('contract')
const success = inject<(msg: string) => {}>('success')
const minted = inject<number>('minted')
const maxSupply = inject<number>('maxSupply')

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

const decrement = () => {
  if (qty.value > 1) {
    qty.value--;
  }
}
const increment = () => {
  if (qty.value < 3) {
    qty.value++;
  }
}
</script>
