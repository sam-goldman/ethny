async function main() {
    const maxSupply = 10_000

    // We get the contract to deploy
    const Grid = await ethers.getContractFactory("Grid")
    const grid = await Grid.deploy(maxSupply)

    await grid.deployed()
  
    console.log("Grid deployed to: ", grid.address)

    await hre.run("verify:verify", {
      address: grid.address,
      constructorArguments: [
        maxSupply
      ],
    })
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });