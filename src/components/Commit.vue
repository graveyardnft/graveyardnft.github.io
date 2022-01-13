<template>
  <div class="flex flex-col w-96 max-w-full mx-auto p-8 bg-slate-900/90 rounded border-4 border-slate-900 text-grey-100">
    <input v-model="contractAddress" type="text" class="mb-2 p-2 rounded text-2xl bg-transparent text-center placeholder:text-grey-100  outline-none focus:ring ring-slate-600/25" placeholder="Enter contract address" />
    <input v-model="tokenId" type="number" class="mb-2 p-2 rounded text-2xl bg-transparent text-center placeholder:text-grey-100  outline-none focus:ring ring-slate-600/25" placeholder="Enter tokenId" />
    <input v-model="data" type="text" class="mb-6 p-2 rounded text-2xl bg-transparent text-center placeholder:text-grey-100  outline-none focus:ring ring-slate-600/25" placeholder="Last rites" />
    <Button @click="commit(contractAddress, tokenId, data)">Commit To The Graveyard</Button>
  </div>
  <Modal v-if="committing" @close="reset">
    <template #header>
      Transferring Token To The Graveyard
    </template>
    <div class="flex items-center justify-center my-4">
      <Transaction :transaction="transaction" :receipt="receipt" />
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import { ethers } from 'ethers'
import { getContract } from '../utils'
import Modal from './Modal.vue'
import Transaction from './Transaction.vue'
import Button from './Button.vue'

const props = defineProps({
  account: {
    type: String,
    required: true
  },
  graveyardAddress: {
    type: String,
    required: true
  }
})

const success = inject<(msg: string) => {}>('success')
const contractAddress = ref('')
const tokenId = ref<number|null>(null)
const data = ref('')
const committing = ref(false)
const transaction = ref(null)
const receipt = ref(null)

const commit = async (contractAddress: string, tokenId: number, data: string) => {
  if (contractAddress === '') throw new Error('Enter the NFT contract address of the token you would like to commit.')
  if (!ethers.utils.isAddress(contractAddress)) throw new Error('Invalid contract address entered.')
  if (tokenId === 0) throw new Error('Enter NFT tokenId')

  const contract = getContract(contractAddress, [
    'function symbol() view returns (string)',
    'function ownerOf(uint256 tokenId) view returns (address)',
    'function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)'
  ])

  let owner
  try {
    owner = (await contract.ownerOf(tokenId)).toLowerCase()
  } catch (e) {
    throw new Error('Contract address invalid, not a ERC721 token contract.')
  }
  if (owner !== props.account) throw new Error('You must be the owner the tokenId being transferred.')

  const symbol = await contract.symbol()
  committing.value = true
  transaction.value = null
  receipt.value = null
  try {
    transaction.value = await contract.safeTransferFrom(props.account, props.graveyardAddress, tokenId, ethers.utils.toUtf8Bytes(data))
  } catch (e) {
    reset()
    throw e
  }
  console.debug('transaction', transaction.value)
  receipt.value = await transaction.value.wait()
  console.debug('receipt', receipt.value)
  if (receipt.value.status !== 1) throw new Error('Transaction Reverted!')
  success(`${symbol} ${tokenId} committed to the graveyard.`)
  setTimeout(() => {
    committing.value = false
  }, 5000)
}

const reset = () => {
  committing.value = false
  transaction.value = null
  receipt.value = null;
}
</script>
