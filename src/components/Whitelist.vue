<template>
  <div v-if="stage === 0">
    Whitelisting is not currently activated
  </div>
  <div v-else-if="stage === 1">
    <div>Committed to the whitelist {{ whitelisted.length }}/2000</div>
    <div v-if="isWhitelisted">
      Congratulations!
      {{ ensName || account }}
      Is whitelisted!
    </div>
    <div v-else-if="whitelisted.length >= 2000">
      Whitelist full, join us on discord for announcements on the public sale
    </div>
    <div v-else>
      <input type="text" v-model="commit.contract" placeholder="Enter contract address" />
      <input type="number" v-model="commit.tokenId" placeholder="Enter tokenId" />
      <input type="text" v-model="commit.data" placeholder="Last rites" />
      <button type="button" @click="whitelist(contract)">Commit token to the graveyard</button>
    </div>
    <pre>
      {{ isWhitelisted ? 'whitelisted' : 'not on whitelist' }}
      {{ whitelisted }}
    </pre>
  </div>
  <div v-else>
    {{ ensName || account }}
    {{ isWhitelisted ? 'whitelisted' : 'not on whitelist' }}
    Max mints per wallet 3
    <input type="number" v-model="qty" placeholder="Number of CRYPTs" />
    <button type="button" @click="whitelistMint(contract, qty)">Mint</button>
    <Modal v-if="minting && transaction || true" @close="minting = false">
      <template #header>
        Minting CRYPTs
      </template>
      <div class="flex items-center justify-center my-4">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="fill-current w-10 h-10">
          <path d="M73,50c0-12.7-10.3-23-23-23S27,37.3,27,50 M30.9,50c0-10.5,8.5-19.1,19.1-19.1S69.1,39.5,69.1,50">
            <animateTransform attributeName="transform" attributeType="XML" type="rotate" dur="1s" from="0 50 50" to="360 50 50" repeatCount="indefinite" />
          </path>
        </svg>
        <a :href="`${etherscanUrl}/tx/${transaction?.hash}`" target="_blank" rel="noopener">View Transaction</a>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, inject, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { ethers } from 'ethers'
import { getContract } from '../utils'
import wl from '../whitelist.json'
import Modal from './Modal.vue'

const router = useRouter()

const account = inject('account', null)
const ensName = inject('ensName', null)
const contract = inject('contract')
const stage = inject('stage')
const success = inject('success')
const etherscanUrl = inject('etherscanUrl')

const whitelisted = ref<string[]>([])
const isWhitelisted = computed(() => {
  if (stage.value < 3) return whitelisted.value.includes(account.value)
  return Object.keys(wl.proofs).map(a => a.toLowerCase()).includes(account.value)
})

const commit = reactive({
  contract: '',
  tokenId: 0,
  data: ''
})

const qty = ref(1)
const transaction = ref(null)
const minting = ref(false)
const whitelisting = ref(false)

const loadWhitelist = async (contract: ethers.Contract) => {
  whitelisted.value = (await contract.queryFilter(contract.filters.Committed(), (await contract.CREATION_BLOCK()).toNumber()))
    .map((event: any) => event.args.from.toLowerCase())
    .filter((value, index, self) => self.indexOf(value) === index)
    .slice(0, 2000);
  console.debug(whitelisted.value);
  if (whitelisted.value.length < 2000) {
    contract.on(contract.filters.Committed(), from => {
      if (!whitelisted.value.includes(from)) {
        whitelisted.value++;
      }
      console.debug(from);
    })
  }
}

const whitelist = async (contract: ethers.Contract) => {
  if (commit.contract === '') throw new Error('Enter the NFT contract address of the token you would like to commit.');
  if (!ethers.utils.isAddress(commit.contract)) throw new Error('Invalid contract address entered.')
  if (commit.tokenId === 0) throw new Error('Enter NFT tokenId');

  const c = getContract(commit.contract, [
    'function ownerOf(uint256 tokenId) view returns (address)',
    'function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)'
  ])
  try {
    if (await c.ownerOf(commit.tokenId) !== account.value) throw new Error('You must be the owner the tokenId being transferred.');
  } catch (e) {
    throw new Error('Contract address invalid, not a ERC721 token contract.')
  }

  try {
    whitelisting.value = true
    transaction.value = await c.safeTransferFrom(account.value, contract.address, parseInt(commit.tokenId), ethers.utils.toUtf8Bytes(commit.data))
    await transaction.value.wait()
  } catch (e) {
    throw e
  } finally {
    whitelisting.value = false
  }
}

const whitelistMint = async (contract: ethers.Contract, qty: number) => {
  if (qty > 3) throw new Error('Maximum 1-3 per wallet!')
  const merkle = Object.entries(wl.proofs).find(([a]) => a.toLowerCase() === account.value)
  if (!merkle) throw new Error('Wallet not whitelisted!')

  try {
    minting.value = true
    transaction.value = await contract.whitelistMint(qty, merkle[1], { value: ethers.utils.parseEther('0.025').mul(qty) })
    await transaction.value.wait()
    success(`Mint complete`)
  } catch (e) {
    throw e
  } finally {
    minting.value = false
  }
}

watchEffect(async () => {
  if (stage.value >= 4) {
    router.push({ name: 'home' })
    return
  }
  loadWhitelist(contract.value)
})
</script>
