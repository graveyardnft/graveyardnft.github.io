<template>
  <div class="container mx-auto px-4 md:px-0">
    <div class="flex flex-wrap justify-center items-center">
      <div
          v-for="token in committed"
          :key="`${token.tokenId}:${token.contract}`"
          class="m-4 p-2 bg-slate-800 rounded border border-slate-900 shadow text-center"
      >
        <div v-if="tokenContracts[token.contract]" class="mb-2">{{ tokenContracts[token.contract].name }} ({{ tokenContracts[token.contract].symbol }})</div>
        <img
            :src="token.tokenMetadata.image.replace('ipfs://', 'https://dweb.link/ipfs/')"
            class="w-64 h-auto mb-2 grayscale-[75%] hover:grayscale-0"
            onerror="this.src='logo.svg';"
        />
        <div>{{ token.tokenMetadata.name || token.tokenId }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ethers } from 'ethers'

const route = useRoute()
const contract = inject<ethers.Contract>('contract')

const tokens = ref<object[]>([])
const tokenContracts = ref<Record<string, object>>({})
const committed = computed<object[]>(() => {
  const maxPage = tokens.value.length / 20;
  const page = route?.query?.page || 1;
  return tokens.value.slice((page - 1) * 20, page * 20)
})

const parseEvent = (event: object) => {
  return {
    contract: event.args.contractAddress,
    from: event.args.from,
    message: ethers.utils.toUtf8String(event.args.data).replace(`\u0000`, ''),
    tokenId: parseInt(event.args.tokenId.toString()),
    tokenMetadata: { name: '', image: '/logo.svg' },
    loading: false,
    loaded: false
  }
}

contract.value.queryFilter(contract.value.filters.Committed())
    .then((events: object[]) => {
      tokens.value = events.map(parseEvent)
      console.log(events.map(parseEvent))
      contract.value.on(contract.value.filters.Committed(), (event: object) => {
        tokens.value.push(parseEvent(event))
      })
    })

watch(() => committed.value, async () => {
  for (const event of committed.value) {
    if (event.loading || event.loaded) return
    event.loading = true
    if (!tokenContracts.value.hasOwnProperty(event.contract)) {
      const contract = new ethers.Contract(
          event.contract,
          [
            'function symbol() external view returns (string)',
            'function name() external view returns (string)',
            'function tokenURI(uint256) external view returns (string)'
          ],
          new ethers.providers.Web3Provider((window as any).ethereum).getSigner()
      )
      tokenContracts.value[event.contract] = {
        contract,
        symbol: await contract.symbol(),
        name: await contract.name()
      }
    }
    try {
      event.tokenMetadata = await ethers.utils.fetchJson((await tokenContracts.value[event.contract].contract.tokenURI(event.tokenId)).replace('ipfs://', 'https://dweb.link/ipfs/'))
    } catch (e) {
      event.tokenMetadata.failed = true
    }
    event.loaded = true
    event.loading = false
  }
})
</script>
