// Usually we will:
// 1. Import
// 2. Main Function
// 3. Calling of Main Function

const { getNamedAccounts } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config") //
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

// However in Hardhat Deploy, we're not doing (2) and (3)
// When we run Hardhat Deploy, we actually gonna call a function that we specify in the scripts folder

/*  Two ways to Import in Hardhat Deploy:

1.async function deployFunc(hre){
     console.log("hi")
 }
 module.exports.default = deployFunc

2. module.exports = async (hre) => {}



3. module.exports = async (hre) => {
     const{getNamedAccount, deployments} = hre 
 }

4. module.exports = async({getNamedAccount, deployments}) => {
}
*/

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    //
    //developmentChains.includes(network.name)
    let ethUsdPriceFeedAddress
    if (chainId == 31337) {
        // localhost/hardhat
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        // Testnet
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    // If chainId is X use address Y
    // If chainId is Z use address A

    // Well what happens if we want to change chains?
    // when going for localhost or hardhat we want to use mock

    // This line allow us to deploy our contract to a specific test network that we want
    // For example: ```yarn hardhat deploy --network sepolia
    // Mocking:
    // If the contract doesn't exist, we deploy a minimal version of it for our local testing

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress], //Put price feed address
        log: true,
        waitConfirmation: network.config.blockConfirmations || 1,
    })

    // VERIFY
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, [ethUsdPriceFeedAddress])
    }
    log("----------------------------------------------------------")
}

module.exports.tags = ["all", "fundme"]

// If we deploy ``yarn hardhat deploy --network sepolia, it should not deploy any marks
// Because we have if statement in our mock
// It should deploy our fundMe contract using the correct pricefeed address
