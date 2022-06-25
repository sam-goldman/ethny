const { ethers } = require('hardhat')

const TOTAL_SUPPLY = 10_000

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
        expect(await Grid.TOTAL_SUPPLY()).to.equal(TOTAL_SUPPLY)
        expect(await Grid.royaltiesPercentage()).to.equal(10)
        expect(await Grid.name()).to.equal('GRID')
        expect(await Grid.symbol()).to.equal('GRD')
    })

    // TODO: johans?
    describe('batchMint')

    describe('batchTransferFrom', () => {
        beforeEach('mint tokens', async () => {
            // Alice mints four token
            await Grid.
        })

        it('reverts if msg value is equal to the current price')

        it('transfers token ids to new owner and increments prices')
    })

})