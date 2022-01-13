<template>
  <div class="container mx-auto flex-col pt-6 pb-32 md:pt-32 px-4 md:px-0 text-center">
    <h1 class="text-3xl md:text-5xl leading-snug mb-4">The Graveyard NFT project is the final resting place for your unsuccessful NFTs on the Ethereum blockchain.</h1>
    <h2 class="text-md">Join our discord to stay up to date on news and announcements.</h2>
    <div class="flex flex-wrap items-center justify-center my-6">
      <Button v-if="stage === 1" class="m-2" @click="router.push({ name: 'whitelist' })">Whitelist</Button>
      <Button class="m-2" @click="router.push({ name: 'last-rites' })">Last Rites</Button>
      <Button v-if="stage >= 2" class="m-2" @click="addUrn">Add URN Token</Button>
      <Button v-if="stage >= 4" class="m-2" @click="router.push({ name: 'commit' })">Committal</Button>
<!--      <Button v-if="stage >= 4" class="m-2" @click="router.push({ name: 'crypts' })">View CRYPT's</Button>-->
    </div>
    <div v-if="stage >= 2 && minted <= maxSupply">
      <div class="text-3xl md:text-5xl leading-snug my-8 text-center">{{ minted }}/{{ maxSupply }} Minted</div>
      <div class="flex items-center justify-center">
        <Button v-if="stage === 2" class="mx-2" @click="router.push({ name: 'whitelist' })">Whitelist Mint</Button>
        <Button v-else class="mx-2" @click="router.push({ name: 'mint' })">Mint</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { useRouter } from 'vue-router'
import { ethers } from 'ethers'
import { getContract } from '../utils'
import Button from './Button.vue'

const router = useRouter()

const stage = inject<number>('stage')
const minted = inject<number>('minted')
const maxSupply = inject<number>('maxSupply')
const openSea = inject<string>('openSea')
const web3 = inject('web3')
const contract = inject<ethers.Contract>('contract')

const addUrn = async () => {
  const urnAddress = await contract.value.URN_ADDRESS();
  const urn = getContract(urnAddress, [
      'function decimals() view returns (uint256)',
      'function symbol() view returns (string)'
  ]);
  const symbol = await urn.symbol()
  const decimals = (await urn.decimals()).toNumber()
  const image = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAxIDEwMDEiPjxjaXJjbGUgY3g9IjUwMC4zIiBjeT0iNTAwLjMiIHI9IjUwMC4zIiBmaWxsPSIjMDA0NjkzIi8+PHBhdGggZmlsbD0iIzAwMmM3MSIgZD0iTTU0NSAyOUMyNjkgMjkgNDUgMjUzIDQ1IDUyOXMxNjMgNDUxIDQ0MCA0NTEgNDk1LTE3NCA0OTUtNDUxUzgyMSAyOSA1NDUgMjlabTAgOTA4YTQwOCA0MDggMCAxIDEgMC04MTYgNDA4IDQwOCAwIDAgMSAwIDgxNloiLz48cGF0aCBmaWxsPSIjMDA2Y2E2IiBkPSJNNTAwIDBhNTAwIDUwMCAwIDEgMCAwIDEwMDFBNTAwIDUwMCAwIDAgMCA1MDAgMFptMCA5MDhhNDA4IDQwOCAwIDEgMSAwLTgxNiA0MDggNDA4IDAgMCAxIDAgODE2WiIvPjxwYXRoIGZpbGw9IiMwYTBiNDgiIGQ9Im00MTIgNzUxIDE3OS00IDI5LTEzIDktMTQ4IDc4LTIyLTMtMTExczItMjEwLTE3OS0yMjItMTEzIDUyMC0xMTMgNTIwWiIvPjxwYXRoIGZpbGw9IiMwMDY2OWMiIGQ9Im01NzEgNzQ3IDYtMTY4IDg1LTE2LTItMTE5cy0xOS0yMTUtMTcyLTIxMi0xNzggMTg0LTE4NCAyOThsNzggNDggMyAxNzQgMjctMSAzLTUzIDIwIDUzIDgyLTIgMTctMTE1IDYgMTE0WiIvPjxwYXRoIGZpbGw9IiMwOTBmNTAiIGQ9Ik00MjIgMzg1cy0yNiAxMi0yNCAxMDhsLTQyIDZzLTIzLTY5LTMtOTcgMjAtNDQgNjktMTdaIi8+PHBhdGggZmlsbD0iIzAwNTI5ZiIgZD0iTTM5OCA0OTNzNTUtNDAgMjQtMTA4YzAgMC0yNiAxMy0yNCAxMDhaIi8+PHBhdGggZmlsbD0iIzBiMDk1NCIgZD0ibTQxNyA1NDUgNTQtMiAzNC01M3MtMTUtNDYtNDUtMTUtNDMgNzAtNDMgNzBaIi8+PHBhdGggZmlsbD0iIzAwNTE5YSIgZD0ibTQ3MSA1NDMgMzUtMXMyNy0zLTEtNTJaIi8+PHBhdGggZmlsbD0iIzAwNGNhNyIgZD0iTTYxMCA0OTNzMTEtNDUtOS0xMTBsLTYxIDM4IDYgMzFaIi8+PHBhdGggZmlsbD0iIzBkMGU0YyIgZD0ibTYxMSA1MDgtMzEgMXMtMjYtNC01OS02NCA1Ni03OSA1Ni03OSA0MCA1IDI0IDE3bC00MCAyN3MtMTIgMjIgMTIgNDVsMzcgMzhaIi8+PHBhdGggZmlsbD0iIzBhMGI0OCIgZD0ibTc2OCA5MjMtNTgtNzMgMTEtMjItMi01OCAzMy0yNFY2MzhsNTItNDAgNTQtNCA0NS0yMyA5NC0yNi0yIDI4LTk0IDE4LTM5IDEyLTE1IDI1LTE4LTQtMzEgMTgtMjcgNSA3IDQ1LTExIDIwLTMgNjAtMjUgMTEtNiAzNyAzIDEyIDMyIDkxeiIvPjxwYXRoIGZpbGw9IiMwOWYiIGQ9Im05OTYgNTY5LTk5IDE5LTM5IDE2LTExIDI0IDE2LTIyIDM0LTE0IDk3LTE0IDItOXpNNTYgMjY5aDEwOGwyOSA1NGg4MGwtNjMtMjctMTYtNjUtMTM4IDM4eiIvPjxwYXRoIGZpbGw9IiMwOTBmNTAiIGQ9Ik02MSAyNjVoMTA4bDI5IDUzIDc1IDUtNTgtMzItMTYtNjUtMTM4IDM5eiIvPjxwYXRoIGZpbGw9IiMwOWYiIGQ9Im04NDIgMTM3IDMxIDI5LTQ5IDE1IDYtMjItNDggMTMgNS0xOCA1NS0xN3oiLz48cGF0aCBmaWxsPSIjMDkwZjUwIiBkPSJtODQwIDEzNCAzMSAzMC01MCAxNCA2LTIyLTQ3IDE0IDUtMTggNTUtMTh6Ii8+PC9zdmc+'
  const added = await web3.value.request({
    method: 'wallet_watchAsset',
    params: {
      type: 'ERC20',
      options: {
        address: urnAddress,
        symbol,
        decimals,
        image,
      },
    },
  })
  console.debug('URN', added, urnAddress, symbol, decimals);
}
</script>
