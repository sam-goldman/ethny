async function main() {
    // We get the contract to deploy
    const Grid = await ethers.getContractFactory("Grid");
    const grid = await Greeter.deploy(); //@TODO: add max token param
  
    await grid.deployed();
  
    console.log("Grid deployed to:", grid.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });