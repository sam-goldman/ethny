require("@nomiclabs/hardhat-ethers")
require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require('dotenv').config()

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.9",
  networks: {
    'optimistic-kovan': {
        chainId: 69,
        url: 'https://kovan.optimism.io',
        accounts: [process.env.PRIVATE_KEY]
    },
  },
  etherscan: {
    apiKey: {
      optimisticKovan: process.env.OPTIMISTIC_ETHERSCAN_API_KEY
    }
  }
};
