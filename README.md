# Graveyard NFT dApp

## Installing

```bash
yarn install
```

## Development

```bash
yarn start
```

## Building For Production

```bash
yarn build
```

## Deployment

Deployments are made automatically to ipfs, swarm, and Github pages.
On completion the `_dnslink` txt record on `graveyardnft.com` is updated.

@todo Ens domain uses the `_dnslink` value via the `/ipns/graveyardnft.com` link.

## Infrastructure & Decentralisation

### The Centralised Part

The Graveyard NFT dApp is developed and hosted using git and Github.

Github is the primary provider of the dApp via Github pages.

The domain `graveyardnft.com` is managed via Cloudflare routed to the Github pages service.

Using Cloudflare provides the dApp with the largest CDN on top of Github's own CDN, for performance and redundancy (via caching and offline delivery).

The centralised service is provided to ensure maximum performance ... but it's centralised.
We cannot rely on the same volume as the likes of uniswap to maintain the same freshness on ipfs nodes,
which is the primary reason a centralised service exists. The dApp will last forever as long as ipfs exists,
the combination of Github and Cloudflare exists for peak load periods.

### The Decentralised Alternative

The primary dApp access on decentralised networks works much like the setup uniswap has pioneered.

Every release of the dApp includes:

* A deployment to the swarm network (primarily as a hedge as it works in the same space as ipfs)
* A deployment to ipfs via web3.storage (and its minimum of 5 pinning providers + archival of the content via filecoin FOREVER)
* A deployment to ipfs via pinata (2 pinning providers + storage)
* DNSLink updates to the centralised `graveyardnft.com` domain
* IPNS content hash on the `graveyard.eth` ENS name, linked to the latest deployment on ipfs

#### Jargon Free Version

The domain `graveyardnft.com` in supported browsers will indicate the dApp is also available over ipfs.
The ENS name `graveyardnft.eth` will also point to the latest ipfs deployment.
This means the dApp will be accessible from ANY ipfs gateway and/or DNS services that support `.eth` domains (and hopefully in the future more native browsers).

Here are a few examples
```
https://graveyardnft.eth > Already supported in Brave and Metamask browsers
https://graveyardnft.eth.link
https://graveyardnft.eth.limo

https://dweb.link/ipns/graveyardnft.com
https://ipfs.io/ipns/graveyardnft.com
https://cf-ipfs.com/ipns/graveyardnft.com
```
