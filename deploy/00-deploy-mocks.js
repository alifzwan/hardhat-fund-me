// Mocks (A fake)
// If we want to deploy our contract to unexistence pricefeed (hardhat/localhost)
// So we create mock to create a pricefeed for hardhat/localhost connection

const { network } = require("hardhat")
const {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // We dont want to deploy this mock contract to a test net so we specify which network we want to deploy
    // If statement
    // developmentChains.includes(network.name)
    // chainId = 11155111

    if (chainId == 31337) {
        log("Local/Hardhat network detected! Deploying mocks....")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        }),
            log("Mocks Deployed!"),
            log(
                "You are deploying to a local network, you'll need a local network running to interact"
            )
        log("-----------------------------------------------")
    }
}

// If we want to deploy only mock scrpts

module.exports.tags = ["all", "mocks"]
