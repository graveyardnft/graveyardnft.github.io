require('dotenv').config()
const ethers = require('ethers')
const fs = require('fs')
const abi = require('./src/graveyardAbi.json')

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL)
const graveyard = new ethers.Contract(process.env.GRAVEYARD_ADDRESS, abi, provider)

const getContract = address => new ethers.Contract(
	address,
	[
		'function symbol() external view returns (string)',
		'function name() external view returns (string)'
	],
	provider
)

graveyard.queryFilter(graveyard.filters.Committed())
	.then(events => ([... new Set(events.map(event => event.args.contractAddress))]))
	.then(contracts => {
		return Promise.all(contracts.map(contract => async () => {
				const con = getContract(contract)
				return [contract, { symbol: await con.symbol(), name: await con.name() }]
			})
			.map(cb => cb()))
	})
	.then(contracts => Object.fromEntries(contracts))
	.then(contracts => fs.writeFileSync('./src/contractCache.json', JSON.stringify(contracts)))
