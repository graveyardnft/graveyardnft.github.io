<template>
  <template v-if="isWeb3">
    <div v-if="!isMainNet" class="sticky top-0 w-full p-2 text-center text-sm bg-yellow-300">
      <code>{{ isRinkeby ? `Ethereum Testnet: ${network.name}` : `Unsupported Network: ${network.name} chainId:${network.chainId}` }}</code>
    </div>
    <Menu />
    <div class="top-0 text-center">
      <div v-if="$route.meta.web3 && (!isConnected || !contract)">
        <button type="button" @click="connect()">Connect</button>
      </div>
      <router-view v-else />
      <div v-if="error" class="fixed bottom-0 w-full">
        <div class="w-5/6 mx-auto pb-12 flex justify-center">
          <div class="max-w-full px-5 py-4 flex items-center justify-center bg-red-500 text-sm text-white rounded-md">
            <div class="break-all"><strong>Error:</strong> <code class="max-w-xs overflow-x-scroll text-xs">{{ error }}</code></div>
            <svg viewBox="0 0 24 24" class="flex flex-shrink-0 fill-white w-4 h-4 ml-2 cursor-pointer" @click="clearError">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </div>
        </div>
      </div>
      <div v-if="success" class="fixed bottom-0 w-full">
        <div class="w-5/6 mx-auto pb-12 flex justify-center">
          <div class="max-w-full px-5 py-4 flex items-center justify-center bg-green-500 text-sm text-white rounded-md">
            <div class="break-all"><code class="max-w-xs overflow-x-scroll text-xs">{{ success }}</code></div>
            <svg viewBox="0 0 24 24" class="flex flex-shrink-0 fill-white w-4 h-4 ml-2 cursor-pointer" @click="clearSuccess">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </div>
        </div>
      </div>
      <pre class="border-t pt-10" style="margin-top: 800px;">
        hello
        ens: {{ ensName }}
        short: {{ shortAccount }}
        address: {{ account }}
        supply: {{ maxSupply }}
        stage: {{ stage }}
        minted: {{ minted }}
        ipfs: {{ ipfs }}
      </pre>
    </div>
  </template>
  <template v-else>
    <Menu />
    <router-view v-if="!$route.meta.web3" />
    <div v-else class="text-center">
      Use a web3 connected browser to access The Graveyard NFT Project
    </div>
  </template>
</template>

<script lang="ts">
import { defineComponent, ref, computed, provide, onErrorCaptured, watchEffect } from 'vue'
import { ethers } from 'ethers'
import { CID } from 'multiformats/cid'
import { getContract } from './utils'
import abi from './abi.json'
import Menu from "./components/Menu.vue";

export default defineComponent({
  components: { Menu },
  props: {
    provider: {
      type: ethers.providers.Web3Provider
    },
    contractAddresses: {
      type: Object,
      required: true
    },
    ensDomain: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const provider = props.provider;
    const error = ref<string|null>(null)
    const success = ref<string|null>(null)

    const web3 = computed(() => provider?.provider)
    const network = ref<{ chainId: number, name: string }>({ chainId: 1, name: '' })
    const ipfs = ref<{ cid: string, base32: string, domain: string, hash: string }>({ cid: '', base32: '', domain: props.ensDomain, hash: '' })
    const accounts = ref<string[]>([])
    const account = computed<string|null>(() => accounts.value[0])
    const shortAccount = computed<string|null>(() => {
      const address = `${account.value}`
      return address ? `${address.substring(0, 5)}...${address.substring(address.length - 5)}` : null
    })
    const ensName = ref<string|null>(null)
    const isMainNet = computed<boolean>(() => network.value?.chainId === 1)
    const isRinkeby = computed<boolean>(() => network.value?.chainId === 4)
    const isConnected = computed<boolean>(() => !!account.value && (isMainNet.value || isRinkeby.value))
    const etherscanUrl = computed(() => `https://${isRinkeby.value ? 'rinkeby.' : ''}etherscan.io`)
    const contractAddress = computed<string>(() => props.contractAddresses[isConnected.value ? network.value.chainId : 1])
    const contract = computed<ethers.Contract|null>(() => isConnected.value ? getContract(props.contractAddresses[network.value.chainId], abi) : null)
    const maxSupply = ref(0)
    const stage = ref(0)
    const minted = ref(0)

    let timeout: number
    provide('success', (msg: string) => {
      success.value = msg
      if (timeout) clearTimeout(timeout)
      timeout = window.setTimeout(() => (success.value = null), 5000)
    })
    provide('provider', provider)
    provide('web3', web3)
    provide('network', network)
    provide('ipfs', ipfs)
    provide('accounts', accounts)
    provide('account', account)
    provide('shortAccount', shortAccount)
    provide('ensName', ensName)
    provide('isConnected', isConnected)
    provide('isMainNet', isMainNet)
    provide('isRinkeby', isRinkeby)
    provide('etherscanUrl', etherscanUrl)
    provide('contract', contract)
    provide('contractAddress', contractAddress)
    provide('maxSupply', maxSupply)
    provide('stage', stage)
    provide('minted', minted)

    const connect = () => provider?.provider?.request({ method: 'eth_requestAccounts' }).then(updateAccounts)

    const updateAccounts = async (newAccounts: string[]) => {
      if (newAccounts[0] === accounts.value[0]) return
      accounts.value = newAccounts
      console.debug(accounts.value)
      if (account.value && network.value?.chainId === 1) {
        ensName.value = await provider.lookupAddress(account.value)
        console.debug(ensName.value)
      }
    }

    const updateMinted = async () => {
      minted.value = await contract.value.totalSupply()
    }

    const updateStage = async () => {
      stage.value = (await contract.value._releaseStage()).toNumber()
    }

    const updateIpfs = async () => {
      if (network.value?.chainId === 1) {
        const resolver = await provider.getResolver(ipfs.value.domain)
        const hash = await resolver.getContentHash()
        ipfs.value.hash = hash
        const cid = CID.parse(hash.replace(/ip[fn]s:\/\//, ''))
        ipfs.value.cid = cid.toV0().toString()
        ipfs.value.base32 = cid.toV1().toString()
      }
      console.log(ipfs.value)
    }

    if (provider) {
      provider.getNetwork().then(net => {
        network.value = net
        console.debug(net)
        provider.provider.request({ method: 'eth_accounts' }).then(updateAccounts)
      })

      provider.provider.on('accountsChanged', updateAccounts)
      provider.provider.on('chainChanged', () => window.location.reload())
    }

    const handler = (err: Error) => {
      console.error(err)
      error.value = err.message
      setTimeout(() => (error.value = null), 5000)
      return false
    }

    onErrorCaptured(handler)
    window.addEventListener('unhandledrejection', event => {
      event.preventDefault();
      handler(new Error(event.reason))
    })

    // Reactive stage, and minted total for use in components
    watchEffect(async () => {
      if (isConnected.value && contract.value) {
        updateIpfs()
        maxSupply.value = await contract.value.MAX_SUPPLY()
        updateStage()
        updateMinted()
        contract.value.on(contract.value.filters.ReleaseStage(), updateStage)
        contract.value.on(contract.value.filters.Transfer(ethers.constants.AddressZero), updateMinted)
      }
    })

    return {
      isWeb3: !!provider,
      isMainNet,
      isRinkeby,
      network,
      ipfs,
      isConnected,
      connect,
      contract,
      ensName,
      shortAccount,
      account,
      maxSupply,
      minted,
      stage,
      success,
      error,
      clearError: () => (error.value =  null),
      clearSuccess: () => (success.value = null)
    }
  }
})
</script>
