// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

// Library - similar to contracts, but you can't declare any state variable and you can't send ether.
//         - A library is embedded into the contract if all library functions are internal.

// It's like a whole contract put it in a new file and will be called by main file.

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/* Chainlink USD/ETH Converter:

  interface AggregatorV3Interface {

  function decimals() external view returns (uint8);

  function description() external view returns (string memory);

  function version() external view returns (uint256);

  function getRoundData(
    uint80 _roundId
  ) external view returns (
      uint80 roundId, 
      int256 price, 
      uint256 startedAt, 
      uint256 updatedAt, 
      uint80 answeredInRound);

  function latestRoundData()
    external
    view
    returns (
        uint80 roundId, 
        int256 price, 
        uint256 startedAt, 
        uint256 updatedAt, 
        uint80 answeredInRound);
    }
    */

library PriceConverter {
    /* getPrice():
    ABI
    Address - 0x694AA1769357215DE4FAC081bf1f309aDC325306

*/
    function getPrice(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        // ETH in terms of USD
        // $2000

        return uint256(price * 1e10); // 1**10
    }

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;
        return ethAmountInUsd;
    }

    function getVersion() internal view returns (uint256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(
            0x694AA1769357215DE4FAC081bf1f309aDC325306
        );
        return priceFeed.version();
    }
}
