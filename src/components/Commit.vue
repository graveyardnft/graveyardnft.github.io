<template>
  <input type="text" v-model="contractAddress" placeholder="Enter contract address" />
  <input type="number" v-model="tokenId" placeholder="Enter tokenId" />
  <input type="text" v-model="data" placeholder="Last rites" />
  <button type="button" @click="commit(contractAddress, tokenId, data)">Commit token to the graveyard</button>
  <Modal v-if="committing" @close="reset">
    <template #header>
      Transferring Token To The Graveyard
    </template>
    <div class="flex items-center justify-center my-4">
      <svg v-if="!receipt" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="fill-current w-10 h-10">
        <path d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50">
          <animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="1s" from="0 50 50" to="360 50 50" repeatCount="indefinite" />
        </path>
      </svg>
      <span v-if="!transaction?.hash">Waiting for signature</span>
      <svg v-else-if="receipt?.status === 1" viewBox="0 0 24 24" class="fill-green-500 w-8 h-8">
        <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
      </svg>
      <svg v-else-if="receipt?.status === 0" viewBox="0 0 24 24" class="fill-red-500 w-10 h-10">
        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
      </svg>
      <a v-if="transaction?.hash" :href="`${etherscanUrl}/tx/${transaction?.hash}`" target="_blank" rel="noopener">View Transaction</a>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import { ethers } from 'ethers'
import { getContract } from '../utils'
import Modal from './Modal.vue'

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

const etherscanUrl = inject<string>('etherscanUrl')
const success = inject<(msg: string) => {}>('success')
const contractAddress = ref('')
const tokenId = ref(0)
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
  transaction.value = await contract.safeTransferFrom(props.account, props.graveyardAddress, tokenId, ethers.utils.toUtf8Bytes(data))
  console.debug('transaction', transaction.value)
  receipt.value = await transaction.value.wait()
  console.debug('receipt', receipt.value)
  if (receipt.value.status !== 1) {
    throw new Error('Transaction Reverted!')
  }
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
