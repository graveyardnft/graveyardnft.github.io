<template>
  <div class="container mx-auto flex-col pt-6 pb-32 md:pt-32 px-4 md:px-0 text-center">
    <h1 class="text-3xl md:text-5xl leading-snug mb-4">The Graveyard NFT project is the final resting place for your unsuccessful NFTs on the Ethereum blockchain.</h1>
    <h2 class="text-md">Join our discord to stay up to date on news and announcements.</h2>
    <div class="flex items-center justify-center my-6">
      <Button v-if="stage === 1" class="m-2" @click="router.push({ name: 'whitelist' })">Whitelist</Button>
      <Button class="m-2" @click="router.push({ name: 'last-rites' })">Last Rites</Button>
      <Button v-if="stage >= 2" class="m-2" @click="addUrn">Add URN Token</Button>
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
  const image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABZVBMVEUAAAA1SF43U2I1S185Zmo2UWFBuINBuINBuINBuYM6cmw0RFw1SV42TWA5cmxBuINBuINBuINBuoQ9kXY1S181SV41SV41S185YWhBuINBuIM1Sl42TWBBuINBuIM1S183VGJBuINBuIM1SV41TF9BuINBuIM1Sl82UGFBuINBuIM1SV41TF9BuINBuINBuINBuINBuINBuINBuINBuINBuINBuINBuINBuINBuINBuINBuINBuINBuINBuINBuINBuINBuINBuINBuINBuINBuINBuINBuINBuINBuINBuINBuINBuINBuINBuINBuINBuINBuINBuINBuINBuYNAr4A4ZGc1SF41SV5BuoQ9lng2TmBBtYI5cWw/onw2VGI7f3BArH83XWU9jnU1S19AsoE5aWk1R10+m3k2UGBBt4M6dm0/pn03V2M8hXJAroA4YWY9k3c1TF9BtII5bGo/pHz///++AVrLAAAAU3RSTlMAAAAAAAAADg0NDQ0NBQ2ayMbGxsbGyXUCV/DlNQecpAgv4fNQff7BExvM/G5d+LFA7AOSKNpx/BXCUvQJpjfmAYYg0mb6ELhIBS7fehrJWvcLM2mj7BYAAAABYktHRHYxY8lBAAAAB3RJTUUH5gEJFDo6tCs4YgAAAdVJREFUOMuFkmVXAkEYRgdjxEBEwUCxRcTAwgJswgQZYNdOMLHA/+/7zBqoC86XiXvPffdwYOy/VWWkVV1TW0fLZMCLwYRzbX01SBUzN1gslsYmq81ma25pLWOsrLWlmS7WpkYCDWbWZhdCJJIpRVXV9o7yioryjnY6KqlkgoC9jTk6aRf7B4f0qnZ1V1Z2d+F0eLCP904H4z29OB0dI9HXbzD09yFwfITX3h7OOB9wYsjJKYxBl2sQ/PQEA5wDnDPGh9yQxRnKwyMjw9jP5JN7iDglRseQOL+Q3ym/8OIcgbFRBMgweqAnLq/Uj3V1CS48RskpMT6BezpzrfHrTBr3iXEtQMbklEzc3GKIqtzeyMDUJP/8ufm0Fy9395pwf4ebd/qL05CZWSQesmQo2QcEZmf4t8D43Lwc8ojCoxwwP1fAKbHgg/D0rCjPTxB8C4UBMvwBmXh5fX2RgYD/B6fE4hLec/l8DvvS4s8AGcsrMvH2JgMry784Gatr0pB8bfUPpyHrQfGxguv8r8B4KPwphEM6nBIRu8btEb0AGRtmTTBv6HJKbG6Bb23qB2Bs07/PuV2Mk7GzK8TuTlFOiWgsFi0eIGPP49krwSkRj5cKwCjNddY7FnmQe87xhdsAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjItMDEtMDlUMjA6NTg6NTgrMDA6MDDQtEnsAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDIyLTAxLTA5VDIwOjU4OjU4KzAwOjAwoenxUAAAAABJRU5ErkJggg=='
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
