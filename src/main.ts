import { createApp, h } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { ethers } from 'ethers'

import './index.css'
import App from './App.vue'
import Homepage from './components/Homepage.vue'
import Whitelist from './components/Whitelist.vue'

const routes = [
    { path: '/', name: 'home', component: Homepage, meta: { web3: true } },
    { path: '/whitelist', name: 'whitelist', component: Whitelist, meta: { web3: true } },
    { path: '/mint', name: 'mint', component: { render: () => h('div', ['mint']) } },
    { path: '/crypts', name: 'crypts', component: { render: () => h('div', ['crypts']) } },
    { path: '/crypts/:tokenId(\\d+)', name: 'crypt', component: { render (): object { return h('div', ['crypt', this.$route.params.tokenId ]) } } },
    { path: '/last-rites', name: 'last-rites', component: { render: () => h('div', ['Last Rites']) } },
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

createApp(App, {
    provider: (window as any)?.ethereum ? new ethers.providers.Web3Provider((window as any).ethereum) : null,
    ensDomain: 'test.graveyardnft.eth',
    contractAddresses: { 1: '0xEd8a67404aD5665E32537Dd7356826109D6df5c2', 4: '0xEd8a67404aD5665E32537Dd7356826109D6df5c2' }
})
.use(router)
.mount('#app')
