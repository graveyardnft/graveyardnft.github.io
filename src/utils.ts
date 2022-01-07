import { ethers } from 'ethers'

export const getContract = (address: string, abi: any[]) => new ethers.Contract(
    address,
    abi,
    new ethers.providers.Web3Provider((window as any).ethereum).getSigner()
)
