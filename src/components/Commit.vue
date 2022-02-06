<template>
  <div class="flex flex-col w-96 max-w-full mx-auto p-8 bg-slate-900/90 rounded border-4 border-slate-900 text-grey-100">
    <a href="#" class="flex items-center justify-center mb-2 text-sm" @click.prevent="toggleHelp">
      <span>Help</span>
      <svg viewBox="0 0 24 24" class="w-4 h-4 ml-1 fill-current">
        <path d="M15.07,11.25L14.17,12.17C13.45,12.89 13,13.5 13,15H11V14.5C11,13.39 11.45,12.39 12.17,11.67L13.41,10.41C13.78,10.05 14,9.55 14,9C14,7.89 13.1,7 12,7A2,2 0 0,0 10,9H8A4,4 0 0,1 12,5A4,4 0 0,1 16,9C16,9.88 15.64,10.67 15.07,11.25M13,19H11V17H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z" />
      </svg>
    </a>
    <input v-model="contractAddress" @blur="loadToken" type="text" class="mb-2 p-2 rounded text-2xl bg-transparent text-center placeholder:text-grey-100  outline-none focus:ring ring-slate-600/25" placeholder="Enter contract address" />
    <input v-model="tokenId" @blur="loadToken" type="number" class="mb-2 p-2 rounded text-2xl bg-transparent text-center placeholder:text-grey-100  outline-none focus:ring ring-slate-600/25" placeholder="Enter tokenId" />
    <input v-model="data" type="text" class="mb-6 p-2 rounded text-2xl bg-transparent text-center placeholder:text-grey-100  outline-none focus:ring ring-slate-600/25" placeholder="Last rites" />
    <template v-if="meta && !loadingMeta">
      <img :src="meta.image" class="mb-2"/>
      <span class="mb-2">{{ meta.tokenName }} ({{ meta.tokenSymbol }})</span>
      <span class="mb-6">{{ meta.name }}</span>
    </template>
    <Button @click="commit(contractAddress, tokenId, data)">Commit To The Graveyard</Button>
  </div>
  <Modal v-if="helpOpen" @close="toggleHelp">
    <template #header>
      Transferring Token To The Graveyard
    </template>
    <div class="text-left">
      <p class="mb-2 text-xl">Contract Address & tokenId</p>
      <p class="mb-2">Enter the contract address of the token you wish to transfer to the graveyard, and the tokenId.</p>
      <p class="mb-2">These can be found on OpenSea in the url when you view the item.</p>
      <pre class="mb-4 max-w-full overflow-scroll">https://opensea.io/assets/{theContractAddress}/{tokenId}</pre>
      <p class="mb-2 text-xl">Last Rites</p>
      <p>You can optionally commit your token with a final message of committal, say goodbye to your token.</p>
    </div>
  </Modal>
  <Modal v-if="committing" @close="reset">
    <template #header>
      Transferring Token To The Graveyard
    </template>
    <div v-if="meta" class="relative" ref="imgContainer">
      <img :src="meta.image" class="mb-2" ref="img"/>
    </div>
    <div class="flex items-center justify-center my-4">
      <Transaction :transaction="transaction" :receipt="receipt" />
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { inject, ref, nextTick } from 'vue'
import { ethers } from 'ethers'
// @ts-ignore
import snap from 'snap-fade-away'
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

const img = ref(null)
const imgContainer = ref(null)

const helpOpen = ref(false)
const meta = ref(null)
const loadingMeta = ref(false)
const success = inject<(msg: string) => {}>('success')
const contractAddress = ref('')
const tokenId = ref<number|null>(null)
const data = ref('')
const committing = ref(false)
const transaction = ref(null)
const receipt = ref(null)

const toggleHelp = () => {
  helpOpen.value = !helpOpen.value
}

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
    await nextTick()
    if (img.value && imgContainer.value && meta.value) {
      await snap(img.value, { duration: '2s', relativeElem: imgContainer.value })
      meta.value = null
    }
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

const loadToken = async () => {
  try {
    if (loadingMeta.value !== true && contractAddress.value !== '' && tokenId.value !== null) {
      loadingMeta.value = true;
      const contract = getContract(contractAddress.value, [
        'function symbol() view returns (string)',
        'function name() view returns (string)',
        'function tokenURI(uint256 tokenId) view returns (string)'
      ])
      let uri = await contract.tokenURI(tokenId.value);
      uri = uri.replace('ipfs://', 'https://dweb.link/ipfs/')
      const res = await fetch(uri)
      const json = await res.json()
      meta.value = {
        contractAddress: contractAddress.value,
        tokenId: tokenId.value,
        tokenName: await contract.name(),
        tokenSymbol: await contract.symbol(),
        ...json,
        image: json.image.replace('ipfs://', 'https://dweb.link/ipfs/')
      }
      loadingMeta.value = false;
    }
  } catch (e) {
    loadingMeta.value = false;
  }
}
</script>
