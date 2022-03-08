import { ethers } from 'ethers'

export const getContract = (address: string, abi: any[]) => new ethers.Contract(
    address,
    abi,
    new ethers.providers.Web3Provider((window as any).ethereum).getSigner()
)

export const parseEvent = (event: object) => {
    return {
        contract: event.args.contractAddress,
        from: event.args.from,
        message: ethers.utils.toUtf8String(event.args.data).replace(`\u0000`, ''),
        tokenId: parseInt(event.args.tokenId.toString()),
        tokenMetadata: { name: '', image: '/logo.svg' },
        loading: false,
        loaded: false
    }
}

export const loadTokenURI = async (rawTokenURI: string) => {
    const tokenURI = `${rawTokenURI}`.replace('ipfs://', 'https://dweb.link/ipfs/')
    // try three different request paths to cover as many cases as possible,
    // but remember some of these are 100% rugs so we can't guarantee either will work
    // first attempt uri, then try with no cors, finally try a different ipfs gateway
    try {
        return await ethers.utils.fetchJson(tokenURI)
    } catch (e) {
        try {
            const res = await fetch(
                tokenURI,
                {
                    mode: 'no-cors',
                    redirect: 'follow',
                    referrerPolicy: 'no-referrer',
                    headers: {
                        Accept: 'application/json'
                    }
                }
            )
            return await res.json()
        } catch (e) {
            if (rawTokenURI.includes('/ipfs/')) {
                return await ethers.utils.fetchJson(`https://cloudflare-ipfs.com/ipfs/${rawTokenURI.split('/ipfs/')[1]}`)
            } else {
                throw e
            }
        }
    }
}
