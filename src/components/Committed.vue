<template>
  <div class="container mx-auto px-4 md:px-0">
    <div class="mb-4 py-7 border-b border-slate-500 flex items-center">
      <input v-model="query" type="text" class="p-2 rounded border border-slate-900 bg-slate-800 text-sm placeholder:text-grey-100 outline-none" placeholder="Search" />
      <nav class="inline-flex bg-slate-800 rounded border border-slate-900 shadow ml-auto" aria-label="Pagination">
        <a href="#" @click.prevent="prevPage" class="inline-flex items-center px-2 py-2 rounded-l-md text-sm hover:bg-slate-700">
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </a>
        <span aria-current="page" class="inline-flex items-center px-4 py-2 border-l border-slate-900 text-sm">Page {{ page }} of {{ maxPage }} ({{ committed }})</span>
        <a href="#" @click.prevent="nextPage" class="inline-flex items-center px-2 py-2 border-l border-slate-900 rounded-r-md text-sm hover:bg-slate-700">
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </a>
      </nav>
    </div>
    <div class="flex flex-wrap justify-center items-center">
      <div
          v-for="token in paginated"
          :key="`${token.tokenId}:${token.contract}`"
          class="w-80 m-4 p-2 bg-slate-800 rounded border border-slate-900 shadow text-center"
      >
        <div v-if="tokenContracts[token.contract]" class="mb-2">{{ tokenContracts[token.contract].name }} ({{ tokenContracts[token.contract].symbol }})</div>
        <img
            :src="(token.tokenMetadata?.image || 'logo.svg').replace('ipfs://', 'https://dweb.link/ipfs/')"
            class="w-full h-auto mb-2 grayscale-[75%] hover:grayscale-0"
            :class="{ loading: token.loading }"
            onerror="this.src='logo.svg';"
        />
        <div class="break-words">{{ token.tokenMetadata.name || token.tokenId }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ethers } from 'ethers'
import { debounce } from 'debounce'

const props = defineProps({
  from: {
    type: String,
    default: null
  }
})

const route = useRoute()
const router = useRouter()
const contract = inject<ethers.Contract>('contract')
const committed = inject<number>('committed')

const tokens = ref<object[]>([])
const tokenContracts = ref<Record<string, object>>({})
const query = ref<string>('')
const page = computed<number>(() => parseInt(route?.query?.page || 1))
const filtered = computed<object[]>(() => {
  const q = query.value
  if (q === '') return tokens.value

  return tokens.value.filter(token => {
    const { tokenId, message, contract } = token
    const { symbol = '', name = '' } = tokenContracts.value[contract] || {}
    return `${tokenId}`.includes(q) || message.toLowerCase().includes(q) || symbol.toLowerCase().includes(q) || name.toLowerCase().includes(q)
  })
})
const paginated = computed<object[]>(() => filtered.value.slice((page.value - 1) * 20, page.value * 20))
const maxPage = computed<number>(() => Math.ceil((query.value !== '' ? filtered.value.length : tokens.value.length) / 20))

const prevPage = () => {
  if (page.value !== 1) {
    router.replace({ query: { page: page.value - 1} })
  }
}

const nextPage = () => {
  if (page.value !== maxPage.value) {
    router.replace({ query: { page: page.value + 1 } })
  }
}

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

const loadContract = (event: object) => {
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
      symbol: '',
      name: ''
    }
    Promise.all([contract.symbol(), contract.name()]).then(([symbol, name]) => {
      tokenContracts.value[event.contract].symbol = symbol
      tokenContracts.value[event.contract].name = name
    })
  }
  return event
}

const loadToken = async (event: object) => {
  if (event.loading || event.loaded) return
  event.loading = true
  try {
    const rawTokenURI = await tokenContracts.value[event.contract].contract.tokenURI(event.tokenId)
    const tokenURI = `${rawTokenURI}`.replace('ipfs://', 'https://dweb.link/ipfs/')
    // try three different request paths to cover as many cases as possible,
    // but remember some of these are 100% rugs so we can't guarantee either will work
    // first attempt uri, then try with no cors, finally try a different ipfs gateway
    try {
      event.tokenMetadata = await ethers.utils.fetchJson(tokenURI)
    } catch (e) {
      try {
        const res = await fetch(
            tokenURI,
            {
              mode: 'no-cors',
              redirect: 'follow',
              referrerPolicy: 'no-referrer',
              headers: {
                Accept: 'application/json'
              }
            }
        )
        event.tokenMetadata = await res.json()
      } catch (e) {
        if (rawTokenURI.includes('/ipfs/')) {
          event.tokenMetadata = await ethers.utils.fetchJson(`https://cloudflare-ipfs.com/ipfs/${rawTokenURI.split('/ipfs/')[1]}`)
        } else {
          throw e
        }
      }
    }
  } catch (e) {
    event.tokenMetadata.failed = true
  }
  event.loading = false
  event.loaded = true
}

const filter = contract.value.filters.Committed(props.from)
contract.value.queryFilter(filter)
    .then((events: object[]) => {
      tokens.value = events.map(e => loadContract(parseEvent(e)))
      contract.value.on(filter, (event: object) => {
        tokens.value.push(loadContract(parseEvent(event)))
      })
    })

watch(() => query.value, () => router.replace({ query: { page: undefined } }))
watch(() => paginated.value, debounce(() => {paginated.value.forEach(loadToken); console.log('triggered')}, 128))
</script>

<style>
.loading {
  animation: rotate 1.5s linear infinite;
}
@keyframes loading {
  to{ transform: rotate(360deg); }
}
</style>
