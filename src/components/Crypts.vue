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
          v-for="token in paginated"
          :key="token.tokenId"
          tokenName="Graveyard CRYPTS"
          tokenSymbol="CRYPT"
          :tokenId="token.tokenId"
          :metaData="token.tokenMetadata"
          :loading="token.loading"
      />
    </div>
    <div class="my-4 py-7 border-t border-slate-500 flex items-center">
      <Pagination @prev="prevPage" @next="nextPage">
        Page {{ page }} of {{ maxPage }} ({{ myCrypts.length || minted }})
      </Pagination>
    </div>
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
