<template>
  <div class="container mx-auto px-4 md:px-0">
    <div class="mb-4 py-7 border-b border-slate-500 flex items-center">
      <input v-model="query" type="text" class="p-2 rounded border border-slate-900 bg-slate-800 text-sm placeholder:text-grey-100 outline-none" placeholder="Search" />
      <a v-if="balance" href="#" @click.prevent="filterMyCrypts" class="inline-flex ml-4 bg-slate-800 rounded border border-slate-900 shadow items-center px-2 py-2 rounded-l-md text-sm hover:bg-slate-700">
        {{ myCrypts.length ? 'All CRYPT\'s' : 'My CRYPT\'s' }}
      </a>
      <Pagination @prev="prevPage" @next="nextPage">
        Page {{ page }} of {{ maxPage }} ({{ myCrypts.length || minted }})
      </Pagination>
    </div>
    <div class="flex flex-wrap justify-center items-center">
      <Token
          v-for="(token, index) in paginated"
          :key="token.tokenId"
          tokenName="Graveyard CRYPTS"
          tokenSymbol="CRYPT"
          :tokenId="token.tokenId"
          :metaData="token.tokenMetadata"
          :loading="token.loading"
          :grayscale="false"
          @click="selectToken(token, index)"
      />
    </div>
    <div class="my-4 py-7 border-t border-slate-500 flex items-center">
      <Pagination @prev="prevPage" @next="nextPage">
        Page {{ page }} of {{ maxPage }} ({{ myCrypts.length || minted }})
      </Pagination>
    </div>
    <Modal v-if="selectedToken" full @close="selectedToken = null">
      <template #header>
        <div class="flex items-center">
          <nav class="inline-flex bg-slate-800 rounded border border-slate-900 shadow mr-4" aria-label="Pagination">
            <a href="#" @click.prevent="prevToken" class="inline-flex items-center px-1 py-1 rounded-l-md text-sm hover:bg-slate-700">
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </a>
            <a href="#" @click.prevent="nextToken" class="inline-flex items-center px-1 py-1 border-l border-slate-900 rounded-r-md text-sm hover:bg-slate-700">
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </a>
          </nav>
          <span>#{{ selectedToken.tokenId }} Graveyard CRYPTS (CRYPT)</span>
        </div>
      </template>
      <div class="flex flex-col md:flex-row">
        <div class="w-full lg:w-1/2 md:pr-2 relative">
          <TokenImage :src="selectedToken.tokenMetadata.image || 'logo.svg'" :grayscale="false" />
          <a
              href="#"
              class="absolute top-0 right-0 mt-4 mr-5 p-2 rounded-full bg-gray-200 text-slate-700 hover:bg-white hover:text-slate-900"
              @click.prevent="download(selectedToken.tokenMetadata.image, selectedToken.tokenMetadata?.name)"
          >
            <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17,13L12,18L7,13H10V9H14V13M19.35,10.03C18.67,6.59 15.64,4 12,4C9.11,4 6.6,5.64 5.35,8.03C2.34,8.36 0,10.9 0,14A6,6 0 0,0 6,20H19A5,5 0 0,0 24,15C24,12.36 21.95,10.22 19.35,10.03Z" />
            </svg>
          </a>
          <div class="mt-4 flex items-center justify-center">
            <Button size="small" @click="router.push({ name: 'crypt', params: { tokenId: selectedToken.tokenId } })">View $CRYPT</Button>
          </div>
        </div>
        <div class="w-full lg:w-1/2 md:pl-2">
          <div class="grid grid-cols-3 gap-4">
            <span class="col-span-3 md:col-span-1 font-bold">TokenId:</span>
            <span class="col-span-3 md:col-span-2">{{ selectedToken.tokenId }}</span>
            <span class="col-span-3 md:col-span-1 font-bold">Name:</span>
            <span class="col-span-3 md:col-span-2">{{ selectedToken.tokenMetadata?.name }}</span>
            <span class="col-span-3 md:col-span-1 font-bold">Description:</span>
            <span class="col-span-3 md:col-span-2">{{ selectedToken.tokenMetadata?.description }}</span>
            <span class="col-span-3 font-bold">Attributes</span>
            <template v-for="attribute in selectedToken.tokenMetadata?.attributes">
              <span class="col-span-3 md:col-span-1 font-bold">{{ attribute.trait_type }}:</span>
              <span class="col-span-3 md:col-span-2">{{ attribute.value }}</span>
            </template>
          </div>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ethers } from 'ethers'
import { debounce } from 'debounce'
import { loadTokenURI } from '../utils'
import Token from './Token.vue'
import Button from './Button.vue'
import Pagination from './Pagination.vue'
import Modal from './Modal.vue'
import TokenImage from './TokenImage.vue'

const route = useRoute()
const router = useRouter()

const stage = inject<number>('stage')
const crypt = inject<ethers.Contract>('crypt')
const cryptAddress = inject<string>('cryptAddress')
const minted = inject<number>('minted')
const maxSupply = inject<number>('maxSupply')
const account = inject<string>('account')

const tokens = ref<any[]>([])
const balance = ref<number>(0)
const myCrypts = ref<number[]>([])
const selectedToken = ref(null)
const selectedTokenIndex = ref(0)

const query = ref<string>('')
const page = computed<number>(() => parseInt(route?.query?.page || 1))
const filtered = computed<object[]>(() => {
  const t = (myCrypts.value.length) ? tokens.value.filter(token => myCrypts.value.includes(token.tokenId)) : tokens.value
  const q = query.value
  if (q === '') return t

  return t.filter(token => `${token.tokenId}`.includes(q))
})
const paginated = computed<object[]>(() => filtered.value.slice((page.value - 1) * 20, page.value * 20))
const maxPage = computed<number>(() => Math.ceil((query.value !== '' || myCrypts.value.length ? filtered.value.length : minted.value) / 20))

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

const loadToken = async (event: object) => {
  if (event.loading || event.loaded) return
  event.loading = true
  try {
    event.tokenMetadata = await loadTokenURI(await crypt.value.tokenURI(event.tokenId))
  } catch (e) {
    event.tokenMetadata = { failed: true }
  }
  event.loading = false
  event.loaded = true
}

const filterMyCrypts = async () => {
  if (myCrypts.value.length) {
    myCrypts.value = []
  } else {
    const tokens = []
    for (let i = 0; i < balance.value; i++) {
      tokens.push((await crypt.value.tokenOfOwnerByIndex(account.value, i)).toNumber())
    }
    myCrypts.value = tokens
  }
}

const selectToken = (token, index) => {
  selectedToken.value = token
  selectedTokenIndex.value = index
}

const prevToken = () => {
  if (selectedTokenIndex.value > 0) {
    selectedTokenIndex.value--
    selectToken(paginated.value[selectedTokenIndex.value], selectedTokenIndex.value)
  }
}

const nextToken = () => {
  if (selectedTokenIndex.value < paginated.value.length) {
    selectedTokenIndex.value++
    selectToken(paginated.value[selectedTokenIndex.value], selectedTokenIndex.value)
  }
}

const download = (svg, name) => {
  let img = document.createElement('img')
  img.onload = () => {
    document.body.appendChild(img)
    const canvas = document.createElement('canvas')
    const ratio = (img.clientWidth / img.clientHeight) || 1
    document.body.removeChild(img)
    canvas.width = 2400
    canvas.height = 2400 / ratio
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    const data = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = data
    link.download = `${name.replace(' ', '-')}.png`
    link.click()
  }
  img.src = svg
}

watch([() => query.value, () => myCrypts.value], () => router.replace({ query: { page: undefined } }))
watch(() => paginated.value, debounce(() => {paginated.value.forEach(loadToken); console.log('triggered')}, 128))

watchEffect(async () => {
  balance.value = (await crypt.value.balanceOf(account.value)).toNumber()
  for (let i = 0; i < minted.value; i++) {
    if (tokens.value[i] && tokens.value[i].loaded) continue
    tokens.value[i] = { tokenId: i + 1 }
  }
})
</script>
