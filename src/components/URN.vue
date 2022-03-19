<template>
  <div class="container mx-auto flex-col pt-6 pb-32 md:pt-32 px-4 md:px-0 text-center">
    <h1 class="text-xl md:text-3xl leading-snug mb-4">$URN is a ERC20 token of no fixed supply, yielded by $CRYPT’s and returned for tokens sent to the Graveyard.</h1>
    <h2 class="md:text-xl leading-snug mb-8">$URN may be used/burnt for future benefits outside of the promised utility of $CRYPT’s either directly by the project or through partnerships.</h2>
    <h2 class="text-xl mb-3">Your daily $URN reward rate: {{ rewardRate }}</h2>
    <h2 class="text-xl mb-8">Your pending $URN rewards: {{ rewards }}</h2>
    <Button size="small" class="mr-4" @click="addUrn">Add URN to MetaMask</Button>
    <Button size="small" @click="claim">Claim $URN</Button>
    <h2 class="text-md mt-8 mb-3">$URN Total Supply: {{ urnSupply }}</h2>
    <h4 class="text-md">$URN Contract Address: {{ urnAddress }}</h4>
  </div>
  <Modal v-if="claiming" @close="reset">
    <template #header>
      Claiming $URN
    </template>
    <div class="flex items-center justify-center my-4">
      <Transaction :transaction="transaction" :receipt="receipt" />
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import { ethers } from 'ethers'
import Button from './Button.vue'
import Transaction from './Transaction.vue'
import Modal from './Modal.vue'

const graveyard = inject('contract')
const crypt = inject('crypt')
const account = inject('account')
const web3 = inject('web3')
const urn = inject<ethers.Contract>('urn')
const urnAddress = inject<string>('urnAddress')
const success = inject<(msg: string) => {}>('success')

const rewards = ref(0)
const rewardRate = ref(0)
const urnSupply = ref(0)

const transaction = ref(null)
const receipt = ref(null)
const claiming = ref(false)

const addUrn = async () => {
  const symbol = await urn.value.symbol()
  const decimals = await urn.value.decimals()
  const image = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAxIDEwMDEiPjxjaXJjbGUgY3g9IjUwMC4zIiBjeT0iNTAwLjMiIHI9IjUwMC4zIiBmaWxsPSIjMDA0NjkzIi8+PHBhdGggZmlsbD0iIzAwMmM3MSIgZD0iTTU0NSAyOUMyNjkgMjkgNDUgMjUzIDQ1IDUyOXMxNjMgNDUxIDQ0MCA0NTEgNDk1LTE3NCA0OTUtNDUxUzgyMSAyOSA1NDUgMjlabTAgOTA4YTQwOCA0MDggMCAxIDEgMC04MTYgNDA4IDQwOCAwIDAgMSAwIDgxNloiLz48cGF0aCBmaWxsPSIjMDA2Y2E2IiBkPSJNNTAwIDBhNTAwIDUwMCAwIDEgMCAwIDEwMDFBNTAwIDUwMCAwIDAgMCA1MDAgMFptMCA5MDhhNDA4IDQwOCAwIDEgMSAwLTgxNiA0MDggNDA4IDAgMCAxIDAgODE2WiIvPjxwYXRoIGZpbGw9IiMwYTBiNDgiIGQ9Im00MTIgNzUxIDE3OS00IDI5LTEzIDktMTQ4IDc4LTIyLTMtMTExczItMjEwLTE3OS0yMjItMTEzIDUyMC0xMTMgNTIwWiIvPjxwYXRoIGZpbGw9IiMwMDY2OWMiIGQ9Im01NzEgNzQ3IDYtMTY4IDg1LTE2LTItMTE5cy0xOS0yMTUtMTcyLTIxMi0xNzggMTg0LTE4NCAyOThsNzggNDggMyAxNzQgMjctMSAzLTUzIDIwIDUzIDgyLTIgMTctMTE1IDYgMTE0WiIvPjxwYXRoIGZpbGw9IiMwOTBmNTAiIGQ9Ik00MjIgMzg1cy0yNiAxMi0yNCAxMDhsLTQyIDZzLTIzLTY5LTMtOTcgMjAtNDQgNjktMTdaIi8+PHBhdGggZmlsbD0iIzAwNTI5ZiIgZD0iTTM5OCA0OTNzNTUtNDAgMjQtMTA4YzAgMC0yNiAxMy0yNCAxMDhaIi8+PHBhdGggZmlsbD0iIzBiMDk1NCIgZD0ibTQxNyA1NDUgNTQtMiAzNC01M3MtMTUtNDYtNDUtMTUtNDMgNzAtNDMgNzBaIi8+PHBhdGggZmlsbD0iIzAwNTE5YSIgZD0ibTQ3MSA1NDMgMzUtMXMyNy0zLTEtNTJaIi8+PHBhdGggZmlsbD0iIzAwNGNhNyIgZD0iTTYxMCA0OTNzMTEtNDUtOS0xMTBsLTYxIDM4IDYgMzFaIi8+PHBhdGggZmlsbD0iIzBkMGU0YyIgZD0ibTYxMSA1MDgtMzEgMXMtMjYtNC01OS02NCA1Ni03OSA1Ni03OSA0MCA1IDI0IDE3bC00MCAyN3MtMTIgMjIgMTIgNDVsMzcgMzhaIi8+PHBhdGggZmlsbD0iIzBhMGI0OCIgZD0ibTc2OCA5MjMtNTgtNzMgMTEtMjItMi01OCAzMy0yNFY2MzhsNTItNDAgNTQtNCA0NS0yMyA5NC0yNi0yIDI4LTk0IDE4LTM5IDEyLTE1IDI1LTE4LTQtMzEgMTgtMjcgNSA3IDQ1LTExIDIwLTMgNjAtMjUgMTEtNiAzNyAzIDEyIDMyIDkxeiIvPjxwYXRoIGZpbGw9IiMwOWYiIGQ9Im05OTYgNTY5LTk5IDE5LTM5IDE2LTExIDI0IDE2LTIyIDM0LTE0IDk3LTE0IDItOXpNNTYgMjY5aDEwOGwyOSA1NGg4MGwtNjMtMjctMTYtNjUtMTM4IDM4eiIvPjxwYXRoIGZpbGw9IiMwOTBmNTAiIGQ9Ik02MSAyNjVoMTA4bDI5IDUzIDc1IDUtNTgtMzItMTYtNjUtMTM4IDM5eiIvPjxwYXRoIGZpbGw9IiMwOWYiIGQ9Im04NDIgMTM3IDMxIDI5LTQ5IDE1IDYtMjItNDggMTMgNS0xOCA1NS0xN3oiLz48cGF0aCBmaWxsPSIjMDkwZjUwIiBkPSJtODQwIDEzNCAzMSAzMC01MCAxNCA2LTIyLTQ3IDE0IDUtMTggNTUtMTh6Ii8+PC9zdmc+'
  const added = await web3.value.request({
    method: 'wallet_watchAsset',
    params: {
      type: 'ERC20',
      options: {
        address: urnAddress.value,
        symbol,
        decimals,
        image,
      },
    },
  })
  console.debug('URN', added, urnAddress, symbol, decimals);
}

const claim = async () => {
  claiming.value = true
  transaction.value = null
  receipt.value = null
  try {
    transaction.value = await graveyard.value.claim()
  } catch (e) {
    reset()
    throw e
  }
  console.debug('transaction', transaction.value)
  receipt.value = await transaction.value.wait()
  console.debug('receipt', receipt.value)
  if (receipt.value.status !== 1) throw new Error('Transaction Reverted!')
  success(`Claim successful.`)
  updateUrn()
  setTimeout(() => {
    claiming.value = false
  }, 5000)
}

const reset = () => {
  claiming.value = false
  transaction.value = null
  receipt.value = null
}

const updateUrn = async () => {
  urnSupply.value = ethers.utils.formatEther(await urn.value.totalSupply())
  rewards.value = ethers.utils.formatEther(await graveyard.value.claimable(account.value))
  rewardRate.value = ethers.utils.formatEther(await crypt.value.getRewardRate(account.value))
}

updateUrn()
setInterval(() => updateUrn(), 5000)
</script>
