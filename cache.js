require('dotenv').config()
const ethers = require('ethers')
const fs = require('fs')
const abi = require('./src/graveyardAbi.json')

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)
const graveyard = new ethers.Contract(process.env.GRAVEYARD_ADDRESS, abi, provider)
const cachedEvents = JSON.parse(fs.readFileSync(`./src/eventCache.json`, { encoding: 'utf8' }))
const cachedContracts = JSON.parse(fs.readFileSync(`./src/contractCache.json`, { encoding: 'utf8' }))

const getContract = address => new ethers.Contract(
	address,
	[
		'function symbol() external view returns (string)',
		'function name() external view returns (string)'
	],
	provider
)

graveyard.queryFilter(graveyard.filters.Committed(), cachedEvents.blockNumber + 1)
	.then(events => {
		const contracts = Promise.all(
			[... new Set(events.map(event => event.args.contractAddress))]
				.map(contract => new Promise(async resolve => {
					const con = getContract(contract)
					resolve([contract, await Promise.all([con.symbol(), con.name()])])
				}))
		).then(contracts => Object.fromEntries(contracts))

		const parseEvent = ({ args }) => ([args.contractAddress, args.from, args.data, args.tokenId.toNumber()])
		return Promise.all([contracts, events.map(event => parseEvent(event)), provider.getBlockNumber()])
	})
	.then(([contracts, events, blockNumber]) => {
		console.log(`processed ${events.length} events, ${Object.entries(contracts).length} contracts, to block number: ${blockNumber}.`)
		fs.writeFileSync('./src/contractCache.json', JSON.stringify({ ...cachedContracts, ...contracts }))
		fs.writeFileSync('./src/eventCache.json', JSON.stringify({ blockNumber, events: [ ...cachedEvents.events, ...events ]}))
	})
