require("@nomicfoundation/hardhat-toolbox")
require("@nomicfoundation/hardhat-ethers")
//require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-ethers")
require("hardhat-gas-reporter")
require("solidity-coverage")
require("hardhat-deploy")
require("dotenv").config()

// const {SEPOLIA_RPC_URL,PRIVATE_KEY,ETHERSCAN_API_KEY,COINMARKET_API_KEY} = process.env.
const SEPOLIA_RPC_URL =
    process.env.SEPOLIA_RPC_URL ||
    "https://eth-sepolia.g.alchemy.com/v2/BLhVawtH0y86XhyNBdEbSJU0kq8SpJHY"
const PRIVATE_KEY =
    process.env.PRIVATE_KEY ||
    "c9f7ab7c633284ab127d1d584307a0cd53d1385db8b254ca6722fdf461d609d0"
const ETHERSCAN_API_KEY =
    process.env.ETHERSCAN_API_KEY || "CRYQC5G76QF66AUQPBWGJNQ36UM5PN6PGE"
const COINMARKET_API_KEY =
    process.env.COINMARKET_API_KEY || "a1b3bfd2-8444-48fc-866e-33f8b5df3abd"

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        compilers: [{ version: "0.8.21" }, { version: "0.6.6" }],
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {},
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 11155111,
            blockConfirmations: 6,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        //coinmarketcap: COINMARKET_API_KEY,
    },

    namedAccounts: {
        deployer: {
            default: 0,
        },
        users: {
            default: 0,
        },
    },
}
