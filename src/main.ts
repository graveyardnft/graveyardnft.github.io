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
import CommitPage from './components/CommitPage.vue'
// import Crypts from './components/Crypts.vue'
import NotFound from './components/NotFound.vue'

const routes = [
    { path: '/', name: 'home', component: Homepage, meta: { web3: true } },
    { path: '/last-rites', name: 'last-rites', component: LastRites },
    { path: '/whitelist', name: 'whitelist', component: Whitelist, meta: { web3: true } },
    { path: '/mint', name: 'mint', component: Mint, meta: { web3: true } },
    { path: '/committal', name: 'commit', component: CommitPage, meta: { web3: true } },
    // { path: '/crypts', name: 'crypts', component: Crypts, meta: { web3: true } },
    // { path: '/crypts/:tokenId(\\d+)', name: 'crypt', component: { render (): object { return h('div', ['crypt', this.$route.params.tokenId ]) } }, meta: { web3: true } },
    { path: '/:pathMatch(.*)', name: 'not-found', component: NotFound }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

createApp(App, {
    provider: (window as any)?.ethereum ? new ethers.providers.Web3Provider((window as any).ethereum) : null,
    ensDomain: 'graveyardnft.eth',
    openSea: 'https://opensea.io/collection/GraveyardNFT',
    graveyardAddresses: { 1: '0xB96C44c007B2cf979cC30fD6650bEd39823c8BE5', 4: '0x86D1239bfd0Df429Ed6d99Ce3E998E34827F7622' },
    cryptAddresses: { 1: null, 4: '0x39f494b21e48a8d6e4648D916038308FA8489C06' },
    urnAddresses: { 1: null, 4: '0x2325EA6B9fF882Bb855F92749a8E2B13daE7c409' }
})
.use(router)
.mount('#app')
