<template>
  <div class="container mx-auto px-4 md:px-0">
    <div class="my-8 p-8 bg-slate-900/75 rounded border-4 border-slate-900 text-grey-100">
      <p class="mb-2">The Graveyard NFT project is the final resting place for your unsuccessful NFTs on the Ethereum blockchain.</p>
      <p class="mb-2">They could be unsuccessful for any number of reasons: lack of community, lack of delivery, roadmap lost its way, or just plain old dev rugs. The graveyard is open to all ERC721 tokens.</p>
      <p class="mb-6">No longer shall your marketplace’s hidden token tab be cluttered with tokens you wish weren’t in your wallet.</p>
      <p class="mb-2">Committing NFTs to the Graveyard is your last action as the token holder. Committal transfers ownership to the contract, and they are no longer in your control. This is not staking, you no longer own the token.</p>
      <p class="mb-2">For your NFT committal to be recorded in the Obituary logs, you MUST use the {safeTransferFrom} method provided by ERC721 standard.</p>
      <p class="mb-6">Tokens sent using the usual {transferFrom} will NOT be recorded in the Obituary.</p>
      <p class="mb-2">The committal act can be performed directly from NFT token contracts. Additionally, the Graveyard NFT project provides a dApp hosted on IPFS to make this process easier. Furthermore, the Graveyard contract provides a batch transfer method to reduce gas costs for sending multiple tokens from multiple contracts.</p>
      <p class="mb-6">The Graveyard has a place for all tokens, but some tokens are more equal than others.</p>
      <p class="mb-2">The Graveyard has a limited number of CRYPTs (6969). Owners of CRYPTs receive the ability to display all tokens sent to the Graveyard from the address that also owns the CRYPT, and own the rights to the generated artwork for their CRYPT token.</p>
      <p class="mb-2">The Graveyard dApp displays the Committed tokens housed in each CRYPT (all tokens sent to the Graveyard by the CRYPT owner).</p>
      <p class="mb-2">A transfer in ownership of the CRYPT changes what is displayed in the CRYPT to the tokens committed by the new owner.</p>
      <p class="mb-6">Each token committed to the Graveyard returns URN to the sender if they hold a CRYPT.</p>
      <p class="mb-6">CRYPT owners receive 1000 URN per token * the number of CRYPTs owned.</p>
      <p class="mb-2">URN is a token that follows the ERC20 token standard and has no fixed supply.</p>
      <p class="mb-2">URN is a token enshrined in the Ethereum ledger.</p>
      <p class="mb-2">URN has no explicit utility or value; the Graveyard project will NOT provide liquidity pools for URN. We would like URN to become a symbol for community, where new projects recognise people have been burnt before (no pun intended).</p>
      <p class="mb-6">Being accessible by other smart contracts means URN could have various use cases in the future.</p>
      <p class="mb-2">There are no plans or promises, but some possible use cases may include burning/transferring URN to mint new project tokens, allocations specific to URN holders or burning URN to influence rarity. The graveyard team will approach new projects where this is suitable, and we would encourage the community to do the same, we are open to discussing with any new project.</p>
      <p class="mb-6">Again no promises, your support of the project only guarantees ownership of CRYPT with associated art, URN tokens and the dApp hosted on IPFS.</p>
      <p class="mb-2">No other projects will be able to mint URN, but the Graveyard project team can enable transferring and/or burning URN to specific contracts.</p>
      <p class="mb-6">This would prevent the need for URN token approvals (and the associated gas costs) for URN holders interacting with other contracts.</p>
      <p class="mb-2">The Graveyard project team would only enable this feature for contracts/projects/teams that meet the following criteria, which could also be revoked or updated at any time:</p>
      <ul class="list-disc list-inside my-4">
        <li>Contract is verified on Etherscan;</li>
        <li>Contract appears to be safe;</li>
        <li>The amount of URN is a constant/predictable quantity, unchangeable by the contract owners; and</li>
        <li>The team/project/ethos is complementary to the Graveyard projects.</li>
      </ul>
      <p class="mb-2">Approval of URN usage in other project contracts does NOT indicate the Graveyard project has audited, is affiliated with or endorses the external project.</p>
    </div>
  </div>
</template>

<script setup lang="ts">

</script>
