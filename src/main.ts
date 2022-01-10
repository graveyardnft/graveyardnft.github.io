import { createApp, h } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { ethers } from 'ethers'
import '@fontsource/medievalsharp'

import './index.css'
import App from './App.vue'
import Homepage from './components/Homepage.vue'
import LastRites from './components/LastRites.vue'
import Whitelist from './components/Whitelist.vue'
import Mint from './components/Mint.vue'
import NotFound from './components/NotFound.vue'

const routes = [
    { path: '/', name: 'home', component: Homepage, meta: { web3: true } },
    { path: '/last-rites', name: 'last-rites', component: LastRites },
    { path: '/whitelist', name: 'whitelist', component: Whitelist, meta: { web3: true } },
    { path: '/mint', name: 'mint', component: Mint, meta: { web3: true } },
    // { path: '/crypts', name: 'crypts', component: { render: () => h('div', ['crypts']) }, meta: { web3: true } },
    // { path: '/crypts/:tokenId(\\d+)', name: 'crypt', component: { render (): object { return h('div', ['crypt', this.$route.params.tokenId ]) } }, meta: { web3: true } },
    { path: '/:pathMatch(.*)', name: 'not-found', component: NotFound }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

createApp(App, {
    provider: (window as any)?.ethereum ? new ethers.providers.Web3Provider((window as any).ethereum) : null,
    ensDomain: 'test.graveyardnft.eth',
    openSea: 'https://opensea.io/collection/GraveyardNFT',
    contractAddresses: { 1: null, 4: '0xEd8a67404aD5665E32537Dd7356826109D6df5c2' }
})
.use(router)
.mount('#app')
