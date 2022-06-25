const { ethers } = require('hardhat')
const { expect } = require('chai')

const MAX_SUPPLY = 10000;
const ROYALTY_PERCENTAGE_BPS = 500;

describe('Grid', () => {
    let alice, bob
    let Grid
    beforeEach(async () => {
        [alice, bob] = await ethers.getSigners()

        Grid = await (
            await ethers.getContractFactory('Grid')
        ).deploy()
    })

    it('sets initial variables', async () => {
        expect(await Grid.MAX_SUPPLY()).to.equal(MAX_SUPPLY)
        expect(await Grid.royaltiesPercentage()).to.equal(ROYALTY_PERCENTAGE_BPS) // 500 bps
        expect(await Grid.name()).to.equal('Grid')
        expect(await Grid.symbol()).to.equal('GRD')
    })

    // TODO: johans?
    //describe('batchMint')

    describe('batchTransferFrom', () => {
        beforeEach('mint tokens', async () => {
            // Alice mints four token
        })

        it('reverts if msg value is equal to the current price')

        it('transfers token ids to new owner and increments prices')
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