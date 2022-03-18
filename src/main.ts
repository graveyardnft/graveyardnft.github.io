import { createApp, h } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { ethers } from 'ethers'
import '@fontsource/medievalsharp'

import './index.css'
import App from './App.vue'
import Homepage from './components/Homepage.vue'
import LastRites from './components/LastRites.vue'
import URN from './components/URN.vue'
import CommitPage from './components/CommitPage.vue'
import Committed from './components/Committed.vue'
import Crypts from './components/Crypts.vue'
import Crypt from './components/Crypt.vue'
import NotFound from './components/NotFound.vue'

if (typeof window !== 'undefined') window.global = window;

const routes = [
    { path: '/', name: 'home', component: Homepage, meta: { web3: true } },
    { path: '/last-rites', name: 'last-rites', component: LastRites },
    { path: '/urn', name: 'urn', component: URN, meta: { web3: true } },
    // { path: '/mint', name: 'mint', component: Mint, meta: { web3: true } },
    { path: '/committal', name: 'commit', component: CommitPage, meta: { web3: true } },
    { path: '/committed', name: 'committed', component: Committed, meta: { web3: true }, props: route => ({ from: route.query.from, token: route.query.token }) },
    { path: '/crypts', name: 'crypts', component: Crypts, meta: { web3: true } },
    { path: '/crypts/:tokenId(\\d+)', name: 'crypt', component: Crypt, meta: { web3: true }, props: route => ({ tokenId: route.params.tokenId, token: route.query.token }) },
    { path: '/:pathMatch(.*)', name: 'not-found', component: NotFound }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

createApp(App, {
    provider: (window as any)?.ethereum ? new ethers.providers.Web3Provider((window as any).ethereum) : null,
    ensDomain: 'graveyardnft.eth',
    openSea: 'https://opensea.io/collection/graveyard-crypts',
    looksRare: 'https://looksrare.org/collections/0xda5e043e57d54dbEB0e2BB917cCeB629512c969A',
    graveyardAddresses: { 1: '0xB96C44c007B2cf979cC30fD6650bEd39823c8BE5', 4: '0x86D1239bfd0Df429Ed6d99Ce3E998E34827F7622' },
    cryptAddresses: { 1: '0xda5e043e57d54dbEB0e2BB917cCeB629512c969A', 4: '0x39f494b21e48a8d6e4648D916038308FA8489C06' },
    urnAddresses: { 1: '0xe4520f883c7760BFb35071463346C5eafbb25622', 4: '0x2325EA6B9fF882Bb855F92749a8E2B13daE7c409' }
})
.use(router)
.mount('#app')
