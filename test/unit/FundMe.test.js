/*TIPS

For writing a test, its easier to follow this steps:
1. Arrange
2. Act
3. Assert

*/

const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          let deployer
          let mockV3Aggregator
          const sendValue = ethers.parseEther("1") // 1 ETH = 1000000000000000000

          /** KEYWORD
           * @function fixture() - Allow us to run our entire deploy folder with as many tags as we want
           * @function getContract() - get a recent deployment of our contract
           * @function ethers.getSigners() - return everything in accounts(hardhat.config.js)
           *
           */

          beforeEach(async function () {
              //Deploy our fund me contract using hardhat deploy
              //const accounts = await ethers.getSigners() - return everything in accounts (hardhat.config.js)

              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])

              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          /** CONSTRUCTOR
           * @describe This entire describe, will all about in constructor()
           * @notice   It ensure aggregator sets correctly
           */
          describe("constructor", async function () {
              it("sets the aggregator addresses correctly", async function () {
                  const response = await fundMe.priceFeed()
                  assert.equal(response, mockV3Aggregator.target)
              })
          })
          /**FUND
           * @describe  This entire describe, will all about in fund()
           * @it1       Will ensure users send enough ETH/fund
           * @it2       Will ensure the funded data updated
           * @it3       Will ensure funder-value is tally
           */
          describe("fund", async function () {
              it("Fails if you dont send enough ETH", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "Didn't sent enough!"
                  )
              })
              it("Update the amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.addressToAmountFunded(deployer)
                  assert.equal(response.toString(), sendValue.toString())
              })
              it("Adds funder to array of funder", async function () {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.funders(0)
                  assert.equal(funder, deployer)
              })
          })
          /** WITHDRAW
           * @beforeEach - this is where we arrange
           *
           *
           *
           */
          describe("withdraw", async function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue })
              })

              it("withdraw ETH from a single funder", async function () {
                  //Arrange
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.target)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt // After debugging, we can know how to get a gasPrice which is gasUsed * effectiveGasPrice
                  const gasCost = gasUsed.mul(effectiveGasPrice) //

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.target
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  // Assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })

              // Withdraw with multiple funders
              it("allows us to withdraw with multiple funders", async function () {
                  //Arrange
                  const accounts = await ethers.getSigners()

                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.target)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt // After debugging, we can know how to get a gasPrice which is gasUsed * effectiveGasPrice
                  const gasCost = gasUsed.mul(effectiveGasPrice) //

                  // Assert
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.target
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  // Assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )

                  // We have to make sure the funders are reset properly
                  await expect(fundMe.funders(0)).to.be.reverted

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.addressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
              it("Only allows the owner to withdraw", async function () {
                  const accounts = await ethers.getSigners()
                  const fundMeConnectedContract = await fundMe.connect(
                      accounts[1]
                  )
                  await expect(
                      fundMeConnectedContract.withdraw()
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
              })
          })
      })
