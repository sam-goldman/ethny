const { ethers } = require('hardhat')
const { expect } = require("chai");
const { JsonRpcProvider } = require('@ethersproject/providers');

const MAX_SUPPLY = 10

describe('Grid', () => {
    let tokenIds = [1, 2, 3, 4, 9999]
    let price = ethers.utils.parseEther('1')

    let alice, bob
    let provider
    let Grid
    beforeEach(async () => {
        [alice, bob] = await ethers.getSigners()
        provider = alice.provider

        Grid = await (
            await ethers.getContractFactory('Grid')
        ).deploy(MAX_SUPPLY)
    })

    it('sets initial variables', async () => {
        expect(await Grid.MAX_SUPPLY()).to.equal(MAX_SUPPLY)
        expect(await Grid.royaltiesPercentage()).to.equal(10)
        expect(await Grid.name()).to.equal('Grid')
        expect(await Grid.symbol()).to.equal('GRD')
    })

    describe('batchMint', () => {
        it('reverts for an array of size zero', async () => {
            await expect(Grid.batchMint([])).to.be.revertedWith(
                "Cannot mint zero NFTs"
            )
        })

        it('reverts if max supply is exceeded', async () => {
            // Mints all tokens
            await Grid.batchMint([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

            await expect(Grid.batchMint([11])).to.be.revertedWith(
                "Max supply exceeded"
            )
        })

        it('mints token ids and updates prices', async () => {
            await Grid.batchMint(tokenIds, { value: price})

            const pricePerToken = price.div(tokenIds.length)
            for (const tokenId of tokenIds) {
                // Mints each token to the recipient
                expect(await Grid.ownerOf(tokenId)).to.equal(alice.address)

                // Updates price mapping for each token
                expect(await Grid.prices(tokenId)).to.equal(pricePerToken)
            }
            
            // Increments counter
            expect(await Grid.counter()).to.equal(tokenIds.length)

            // Contract received eth
            expect(await provider.getBalance(Grid.address))
        })
    })

    describe('batchTransferFrom', () => {
        beforeEach('mint tokens', async () => {
            // Alice mints four token IDs and pays 1 eth
            await Grid.batchMint(
                [1, 4, 1234, 9876],
                { value: ethers.utils.parseEther('1') }
            )
        })

        it('reverts if msg value is equal to the current price')

        it('transfers token ids to new owner and increments prices')
    })

})