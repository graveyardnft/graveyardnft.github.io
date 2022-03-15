<template>
  <Committed :from="from" :token="props.token" />
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { loadTokenURI } from '../utils'
import Committed from './Committed.vue'

const props = defineProps({
  tokenId: {
    type: Number,
    required: true
  },
  token: {
    type: String
  }
})
const crypt = inject('crypt')
const from = ref(null)

Promise.all([crypt.value.ownerOf(props.tokenId), crypt.value.tokenURI(props.tokenId)])
  .then(async ([address, tokenURI]) => {
    from.value = address
    const uri = await loadTokenURI(tokenURI)
    document.body.style.backgroundImage = `url(${uri.image})`
  })

onBeforeRouteUpdate(async to => {
  from.value = await crypt.value.ownerOf(to.params.tokenId)
  const tokenURI = await crypt.value.tokenURI(to.params.tokenId)
  const uri = await loadTokenURI(tokenURI)
  document.body.style.backgroundImage = `url(${uri.image})`
})

onBeforeRouteLeave(async to => {
  document.body.style.backgroundImage = ''
})
</script>
