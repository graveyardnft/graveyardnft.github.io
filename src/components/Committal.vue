<template>
  <div class="flex flex-col w-96 max-w-full mx-auto p-8 bg-slate-900/90 rounded border-4 border-slate-900 text-gray-100">
    <a href="#" class="flex items-center justify-center mb-2 text-sm" @click.prevent="toggleHelp">
      <span>Help</span>
      <svg viewBox="0 0 24 24" class="w-4 h-4 ml-1 fill-current">
        <path d="M15.07,11.25L14.17,12.17C13.45,12.89 13,13.5 13,15H11V14.5C11,13.39 11.45,12.39 12.17,11.67L13.41,10.41C13.78,10.05 14,9.55 14,9C14,7.89 13.1,7 12,7A2,2 0 0,0 10,9H8A4,4 0 0,1 12,5A4,4 0 0,1 16,9C16,9.88 15.64,10.67 15.07,11.25M13,19H11V17H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z" />
      </svg>
    </a>
    <input v-model="contractAddress" @blur="loadContract" type="text" class="mb-1 p-2 rounded text-2xl bg-transparent text-center placeholder:text-grey-100  outline-none focus:ring ring-slate-600/25" placeholder="Contract Address" />
    <span class="text-xs mb-2">Contract address or Marketplace Link to token</span>
    <span v-if="contractAddress !== '' && !isAddress(contractAddress)" class="text-sm text-red">Not a valid address</span>
    <span v-else-if="tokenName && symbol" class="mb-4">{{ tokenName }} ({{ symbol }})</span>
    <template v-if="contract && !isEnumerable">
      <input v-model="tokenId" @blur="loadTokens" class="mb-1 p-2 rounded text-2xl bg-transparent text-center placeholder:text-grey-100  outline-none focus:ring ring-slate-600/25" placeholder="TokenIds" />
      <span class="text-xs mb-2">EG: 1,2,3</span>
    </template>
    <template v-if="tokens.length">
      <div class="text-sm">Select NFT's</div>
      <div class="flex flex-wrap items-center justify-center">
        <div
            v-for="token in tokens"
            :key="token.tokenId"
            class="w-24 p-4 m-1 rounded-lg border-4 border-slate-900 bg-slate-800/90 cursor-pointer"
            :class="{ 'border-blue-500': token.selected, 'text-gray-900 cursor-not-allowed': token.invalid }"
            @click.prevent="selectToken(token)"
        >
          {{ token.tokenId }}
        </div>
      </div>
    </template>
    <div v-if="tokens.some(t => t.selected)" class="flex-col">
      <div v-for="token in tokens.filter(t => t.selected)" :key="token.tokenId" class="p-4 mt-4 rounded-lg border-4 border-slate-900 bg-slate-800/90">
        <TokenImage :loading="!token.meta" :src="token?.meta?.image || 'logo.svg'" :greyscale="false" />
        <span>#{{ token.tokenId }}</span>
        <input v-model="token.data" type="text" class="w-full mt-2 p-2 rounded text-2xl bg-transparent text-center placeholder:text-grey-100  outline-none ring ring-slate-600/25" placeholder="Last Rites" />
      </div>
      <Button v-if="!isApproved && tokens.filter(t => t.selected).length > 1" class="block mt-4" @click="approve">Approve Graveyard</Button>
      <Button v-else class="block mt-4" @click="commit">Commit Tokens</Button>
    </div>
  </div>
  <Modal v-if="helpOpen" @close="toggleHelp">
    <template #header>
      Transferring Token To The Graveyard
    </template>
    <div class="text-left">
      <p class="mb-2">Tokens MUST be ERC721 on the Ethereum Network.</p>
      <p class="mb-2 text-xl">Contract Address</p>
      <p class="mb-2">Paste in the NFT contract address or a link to the token on Marketplace and leave the field.</p>
      <p class="mb-2 text-xl">TokenId's</p>
      <p class="mb-2">If we can we will load your owned token id's, if not you will be shown a field to enter the tokenId's manually separated by a comma, EG:</p>
      <pre class="mb-2">1,2,3</pre>
      <p class="mb-2 text-xl">Last Rites</p>
      <p>You can optionally commit your token with a final message of committal, say goodbye to your token.</p>
    </div>
  </Modal>
  <Modal v-if="approving" @close="reset">
    <template #header>
      Approving The Graveyard To Transfer
    </template>
    <p>To bulk transfer tokens the graveyard must be approved to do so.</p>
    <p>This is a <code>setApproveForAll</code> transaction and ONLY allows the graveyard to transfer tokens from this collection.</p>
    <div class="flex items-center justify-center my-4">
      <Transaction :transaction="transaction" :receipt="receipt" />
    </div>
  </Modal>
  <Modal v-if="committing" @close="reset">
    <template #header>
      Transferring Token(s) To The Graveyard
    </template>
    <p>Say goodbye, they are being transferred to their final resting place.</p>
    <div class="flex items-center justify-center my-4">
      <Transaction :transaction="transaction" :receipt="receipt" />
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import { ethers } from 'ethers'
// @ts-ignore
import snap from 'snap-fade-away'
import { getContract, loadTokenURI } from '../utils'
import Modal from './Modal.vue'
import Transaction from './Transaction.vue'
import Button from './Button.vue'
import TokenImage from './TokenImage.vue'

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

const account = inject('account')
const success = inject<(msg: string) => {}>('success')
const graveyard = inject('contract')

const isAddress = address => ethers.utils.isAddress(address)
const helpOpen = ref(false)
const loading = ref(false)
const contractAddress = ref('')
const contract = ref(null)
const isEnumerable = ref(false)
const isApproved = ref(false)
const symbol = ref('')
const tokenName = ref('')
const tokenId = ref(null)
const balance = ref(0)
const tokens = ref([])
const transaction = ref(null)
const receipt = ref(null)
const approving = ref(false)
const committing = ref(false)

const toggleHelp = () => {
  helpOpen.value = !helpOpen.value
}

const loadContract = async () => {
  try {
    const match = (contractAddress.value || '').match(/(0x[0-9a-fA-F]{40})/)
    contractAddress.value = match && match.length > 1 ? match[1] : ''
    loading.value = true
    tokens.value = []
    balance.value = 0
    symbol.value = ''
    tokenName.value = ''
    isEnumerable.value = false
    tokenId.value = ''
    if (!ethers.utils.isAddress(contractAddress.value)) {
      contract.value = null
      loading.value = false
      return
    }
    if (contract.value && contract.value.address === contractAddress.value) return

    const c = getContract(contractAddress.value, [
      'function symbol() view returns (string)',
      'function name() view returns (string)',
      'function tokenURI(uint256 tokenId) view returns (string)',
      'function ownerOf(uint256 tokenId) view returns (address)',
      'function balanceOf(address owner) view returns (uint256)',
      'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
      'function isApprovedForAll(address owner, address operator) view returns (bool)',
      'function setApprovalForAll(address operator, bool approved)',
      'function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)',
      'event Transfer(address from, address to, uint256 tokenId)'
    ])
    try {
      symbol.value = await c.symbol()
      tokenName.value = await c.name()
      isApproved.value = await c.isApprovedForAll(account.value, props.graveyardAddress)
      contract.value = c
      balance.value = (await c.balanceOf(account.value)).toNumber()
      if (balance.value > 0) {
        // try enumerable if it exists, else user has to enter there own ids
        try {
          for (let i = 0;i < balance.value;i++) {
            const tId = await c.tokenOfOwnerByIndex(account.value, i)
            tokens.value.push({ selected: false, data: '', tokenId: tId.toNumber() })
          }
          isEnumerable.value = true
        } catch (e) {
          isEnumerable.value = false
        }
      }
    } catch (e) {}
  } catch (e) {
    throw e
  } finally {
    loading.value = false
  }
}

const loadTokens = async () => {
  const tIds = (tokenId.value || '').split(',').map(t => parseInt(t))
  const t = []
  for (let i = 0;i < tIds.length;i++) {
    try {
      if ((await contract.value.ownerOf(tIds[i])).toLowerCase() === account.value.toLowerCase()) {
        t.push({ selected: false, data: '', tokenId: tIds[i] })
      } else {
        t.push({ selected: false, data: '', tokenId: tIds[i], invalid: true })
      }
    } catch (e) {}
  }
  tokens.value = t
}

const selectToken = token => {
  if (token.invalid) return
  token.selected = !token.selected
  loadNFTs()
}

const loadNFTs = () => {
  tokens.value.forEach(async token => {
    if (token.uri) return
    token.uri = await contract.value.tokenURI(token.tokenId)
    token.meta = await loadTokenURI(token.uri)
  })
}

const reset = () => {
  committing.value = false
  approving.value = false
  transaction.value = null
  receipt.value = null
}

const approve = async () => {
  if (approving.value) return
  approving.value = true
  transaction.value = null
  receipt.value = null
  try {
    transaction.value = await contract.value.setApprovalForAll(props.graveyardAddress, true)
  } catch (e) {
    reset()
    throw e
  }
  console.debug('transaction', transaction.value)
  receipt.value = await transaction.value.wait()
  console.debug('receipt', receipt.value)
  if (receipt.value.status !== 1) throw new Error('Transaction Reverted!')
  success(`${tokenName.value} (${symbol.value}) approved for committal.`)
  isApproved.value = await contract.value.isApprovedForAll(account.value, props.graveyardAddress)
  setTimeout(() => {
    approving.value = false
  }, 1000)
}

const commit = async () => {
  if (committing.value) return
  committing.value = true
  transaction.value = null
  receipt.value = null
  try {
    const selected = tokens.value.filter(t => t.selected)
    if (selected.length > 1) {
      transaction.value = await graveyard.value.commitTokens([contractAddress.value], [selected.map(t => t.tokenId)], [selected.map(t => ethers.utils.toUtf8Bytes(t.data))])
    } else {
      transaction.value = await contract.value.safeTransferFrom(account.value, props.graveyardAddress, selected[0].tokenId, ethers.utils.toUtf8Bytes(selected[0].data))
    }
  } catch (e) {
    reset()
    throw e
  }
  console.debug('transaction', transaction.value)
  receipt.value = await transaction.value.wait()
  console.debug('receipt', receipt.value)
  if (receipt.value.status !== 1) throw new Error('Transaction Reverted!')
  const audio = new Audio('win.wav')
  audio.play()
  success(`Sacrifice complete.`)
  reset()
  tokens.value = []
  tokenName.value = ''
  symbol.value = ''
  contractAddress.value = ''
  contract.value = null
  setTimeout(() => {
    committing.value = false
  }, 5000)
}
</script>
