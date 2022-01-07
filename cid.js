const cid = require('multiformats/cid').CID.parse(process.argv[2]);
console.log(cid.toV0().toString())
console.log(cid.toV1().toString())
console.log(`https://${cid.toV1().toString()}.ipfs.dweb.link`)
