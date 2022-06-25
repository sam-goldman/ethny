const { ethers } = require('hardhat')
const { expect } = require("chai");
const { JsonRpcProvider } = require('@ethersproject/providers');

const MAX_SUPPLY = 10
const ROYALTY_PERCENTAGE_BPS = 500;
const BASIS_POINTS = 10_000;

describe('Grid', () => {
    let tokenIds = [1, 2, 3, 4, 9999]
    let hexCodes = ['0x0000FF', '0x000000', '0x89CFF0', '0xb0c4de', '0xFFFFFF']
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
        expect(await Grid.BASIS_POINTS()).to.equal(BASIS_POINTS)
        expect(await Grid.MAX_SUPPLY()).to.equal(MAX_SUPPLY)
        expect(await Grid.royaltiesPercentage()).to.equal(ROYALTY_PERCENTAGE_BPS) // 500 bps
        expect(await Grid.name()).to.equal('Grid')
        expect(await Grid.symbol()).to.equal('GRD')

        // Ownable
        expect(await Grid.owner()).to.equal(alice.address)
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
            await Grid.batchMint(tokenIds, { value: price })

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
            // Alice mints four token IDs and sends eth to the contract
            await Grid.batchMint(
                tokenIds,
                { value: price }
            )
        })

        it('reverts if transaction eth amount does not exceed the current price of the token IDs', async () => {
            // Bob attempts to purchase Alice's tokens at the same price she bought them
            await expect(
                Grid.connect(bob).batchTransferFrom(tokenIds, bob.address, { value: price })
            ).to.be.revertedWith("Insufficient payment")
        })

        it('transfers token ids to new owner and increments prices', async () => {
            const prevAliceBalance = await alice.getBalance()
            const prevGridBalance = await provider.getBalance(Grid.address)
            const prevPricePerToken = price.div(tokenIds.length)

            // Bob buys Alice's tokens at twice the price
            const bobPayment = price.mul(2)
            const response = await Grid.connect(bob).batchTransferFrom(tokenIds, bob.address, { value: bobPayment })

            // Keeps 5% of Bob's ETH payment in the contract for the royalty receiver
            expect(await provider.getBalance(Grid.address)).to.equal(prevGridBalance.add(ethers.utils.parseEther('0.1')))

            // Sends the rest of Bob's payment to Alice
            const newAliceBalance = prevAliceBalance.add(ethers.utils.parseEther('1.9'))
            expect(await alice.getBalance()).to.equal(newAliceBalance)

            const newPricePerToken = prevPricePerToken.add(bobPayment.div(tokenIds.length))
            for (const tokenId of tokenIds) {
                // Updates prices mapping
                expect(await Grid.prices(tokenId)).to.equal(newPricePerToken)

                // Transfers tokens to Bob
                expect(await Grid.ownerOf(tokenId)).to.equal(bob.address)
            }
        })
    })

    describe('supportsInterface', async () => {
        it('supports erc721 interface', async () => {
            expect(await Grid.supportsInterface('0x80ac58cd')).to.equal(true)
        })

        it('supports erc165 interface', async () => {
            expect(await Grid.supportsInterface('0x01ffc9a7')).to.equal(true)
        })

        it('supports erc2981 interface', async () => {
            expect(await Grid.supportsInterface('0x2a55205a')).to.equal(true)
        })

        it('does not support incorrect interface', async () => {
            expect(await Grid.supportsInterface('0xffffffff')).to.equal(false)
        })
    })

    describe('tokenURI', async () => {
        it('returns the white hex value for a non-existent token', async () => {
            const tokenId = 888

            // Check that the token does not exist
            await expect(Grid.ownerOf(tokenId)).to.be.revertedWith("ERC721: owner query for nonexistent token")
            
            // TODO: is this correct? (or is it 0xFFFFFF)
            expect(await Grid.tokenURI(tokenId)).to.equal('FFFFFF')
        })

        it('returns the lowercase string representation of arbitrary hex codes', async () => { 
            // Alice mints tokens
            await Grid.batchMint(tokenIds)
            
            // Set the hex value for Alice's tokens
            await Grid.setTokenIdValues(tokenIds, hexCodes)

            for (var i = 0; i < tokenIds.length; i++) {
                const tokenId = tokenIds[i]
                const hexCode = hexCodes[i]

                const nonZeroPaddedHexCode = await Grid.tokenURI(tokenId)
                expect(ethers.utils.hexZeroPad(nonZeroPaddedHexCode, 3)).to.equal(hexCode.toLowerCase())
            }
        })
    })

    describe('setTokenIdValues', async () => {
        beforeEach('mint tokens', async () => {
            // Alice mints four token IDs and sends eth to the contract
            await Grid.batchMint(
                tokenIds,
                { value: price }
            )
        })

        it('reverts if array lengths differ', async () => {
            await expect(Grid.setTokenIdValues([1, 2, 3, 4], hexCodes)).to.be.revertedWith('Array lengths differ')
        })

        it('reverts if called by non-owner', async () => {
            // bob tries to set alice's token value. not cool bob.
            await expect(Grid.connect(bob).setTokenIdValues([1], [hexCodes[0]])).to.be.revertedWith('Caller must be token ID owner');
        })

        it('sets token ids to their hex value', async () => {
            // should succeed
            await expect(Grid.setTokenIdValues(tokenIds, hexCodes)).to.not.be.reverted
            // Checks all token values were set
            let i = 0;
            for (const tokenId of tokenIds) {
                expect(await Grid.tokenIdValues(tokenId)).to.equal(hexCodes[i].toLowerCase())
                i++;
            }
        })
    })

    // TODO: better maths
    describe('royaltyInfo', async () => {
        it('calculates correct royalty info', async () => {
            let tokenId = 4;
            let salePrice = ethers.utils.parseEther("1.5");
            let info = await Grid.royaltyInfo(tokenId, salePrice);
            expect(info.receiver).to.equal(alice.address);
            expect(info.royaltyAmount).to.equal(ethers.utils.parseEther("0.075"));
        })
    })

    describe('setRoyaltiesPercentage', async () => {
        it('reverts if non-owner attempts to set royalties', async () => {
            await expect(Grid.connect(bob).setRoyaltiesPercentage(1000)).to.be.revertedWith('Ownable: caller is not the owner');
        })

        it('sets royalties percentage to 10% ( denoted as 1000 bps )', async () => {
            await Grid.setRoyaltiesPercentage(1000);
            expect(await Grid.royaltiesPercentage()).to.equal(1000);
        })
    })

    describe('withdraw', async () => {
        it("reverts if non owner attempts withdrawl", async function () {
            await expect(Grid.connect(bob).withdraw()).to.be.revertedWith('Ownable: caller is not the owner');
        });

        it('withdraws to owner', async () => {
            await expect(Grid.withdraw()).to.be.revertedWith('Balance is 0');
        })
    })
})