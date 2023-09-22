/****** FundMe.sol *******
    Same as wallet, Smart Contract hold a fund as well since everytime we deploy a contract the user get the contract address.

   In this contract, we gonna learn:
  - Get funds from users
  - Withdraw funds
  - Set  minimum funding value in USD

  */

// SPDX-License-Identifier: MIT

/* DEBUGGING TIPS
  1. Tinker and try to pinpoint exactly what's going on
  2. Google the exact error
  2.5 Go to Github repo - https://github.com/smartcontractkit/full-blockchain-solidity-course-js
  3.0 Ask a question on a forum like Stack Exchange ETH or Stack Overflow


  SOLIDITY STRUCTURE
  1. Pragma
  2. Import
  3. Error Code
  4. Interfaces
  5. Libraries
  6. Contracts

  CONTRACTS STRUCTURE
  1. Type decalration
  2. State Variables
  3. Events
  4. Modifier
  5. 
  6. Contracts


*/

// Pragma
pragma solidity ^0.8.21;

// Import
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

// Error Code
error FundMe__NotOwner();

/**
 * @title A Contract for crowd funding
 * @author Alif Zakwan
 * @notice This contract is to demo a sample funding contract
 * @dev This implements price feeds as our library
 */
contract FundMe {
    using PriceConverter for uint256;

    /* GAS COMPARISON 
        Constant:
        21,415 gas   -  constant
        23,515 gas   -  non-constant
        21,415 * 141000000000 = $9.058545
        23,515 * 141000000000 = $9.946845
    
        We can save like $1 for GAS PRICE

        Immutable:
        21,508 gas - immutable
        23,644 gas - non-immutable
        
     */

    // TRACKING ALL THE FUNDERS

    // State Variables
    address[] public funders; // Display the funders
    mapping(address => uint256) public addressToAmountFunded; // Display the amount the funder pay according to index
    address public immutable i_owner; // Display the owner
    uint256 public constant minimumUsd = 50 * 1e18; // $50 of ETH = 0.0031 ETH
    AggregatorV3Interface public priceFeed;

    /* MODIFIER
      
      Notes: https://solidity-by-example.org/function-modifier/

      - Let's say that there's a lot of function that we want it to be only can be access by Owner

      - Normaly we add this line:
        require(msg.sender == owner, "Sender is not owner!");

      - However, we dont want this line to be in all function right?

      - That's where Modifier comes in.


      The " _; "
      - If you put it under, it will tell the function to do the modifier first
      - If you put it above, it will tell the function to do the function first 
       */
    modifier onlyOwner() {
        // _;
        // require(msg.sender == i_owner, "Sender is not owner!");
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    /* FUNCTION ORDER:
      1. constructor
      2. receive
      3. fallback
      4. external
      5. public 
      6. internal
      7. private
      8. view/pure
    */

    /* HOW TO REDUCE GAS?
        - So when we create this contract, it require approximately 859,757 gas price.
        - Well how we gonna reduce it?
        
      Notes:- https://solidity-by-example.org/constants/
            - https://solidity-by-example.org/immutable/

       There's Two ways to reduce GAS PRICE:  
       1. constant  - for variable outside function that you never change
       2. immutable - just like constant but it can be set in a constructor ONCE


    */

    /* CONSTRUCTOR()
      - Anybody can fund this contract but we dont want anyone to be able to withdraw.
      - We only want the person who collecting the fund to able to withdraw

      msg.sender - whoever deploy this contract (owner)


    */
    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    /* FALLBACK() 
      
      SITUATION 1 - What happen if someone send this contract ETH without calling the fund()

      Notes - https://solidity-by-example.org/fallback/

      Fallback:
      It is a special function that is executed either when:
      - a function that does not exist is called or
      - Ether is sent directly to a contract but receive() does not exist or msg.data is not empty

                  is msg.data empty?
                    /     \
                   yes     no
                  /          \
           have receive()?  fallback()
               /   \
            yes     no
           /         \
       receive()  fallback()

       */

    // receive() external payable {
    //     fund();
    // }

    // fallback() external payable {
    //     fund();
    // }

    /* FUND()
     // We want to be able to set a minimum fund amount
     // Revert - undo any action berfore, and send remaining gas back
     // 1. How do we send ETH to this contract?
      */

    /**
     * @notice This function funds this contract
     * @dev This implements price feeds as our library
     *
     */
    function fund() public payable {
        require(
            msg.value.getConversionRate(priceFeed) >= minimumUsd,
            "Didn't sent enough!"
        ); // 1e18 - 1 ETH = 100000000000000 Gwei
        funders.push(msg.sender); // msg.sender - return the address of the sender
        addressToAmountFunded[msg.sender] = msg.value; // msg.value - updated value
    }

    /* WITHDRAW()
      You have to use for loop:
      for(starting index, ending index, step amount){}

      Notes: https://solidity-by-example.org/sending-ether/

      You can send Ether to other contracts by:
      1. transfer (2300 gas                   , throws error - if it fails)
      2. send     (2300 gas                   , returns bool - if it fails)
      3. call     (forward all gas or set gas , returns bool - if it fails)
      
      If you want to send ETH, it only can work with payable
      msg.sender - address
      payable(msg.sender) - payable address 

     1. transfer:
        payable(msg.sender).transfer(address(this).balance);

     2. send:
        bool sendSuccess = payable(msg.sender).send(address(this).balance);  
        require(sendSuccess, "Send failed");

     3. call:
        (bool callSuccess, ) = payable(msg.sender).call{value : address(this).balance}(""); 
        require(callSuccess, "Call Failed");

      Modifier:
      onlyOwner
      1. It will priotize the onlyOwner Modifier.
      2. It's like before you read your function, read the onlyOwner Modifier first.
      
      */

    /**
     * @notice This function withdraw the fund out of this contract
     * @dev This implements price feeds as our library
     *
     */
    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }
        // funders = new address[]("starting index")
        funders = new address[](0);
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }(""); //Call
        require(callSuccess, "Call Failed");
    }

    /*  CUSTOM ERROR


      Notes - https://solidity-by-example.org/error/

      You can throw an error by calling requireandrevert :

      require:
      require(msg.sender == i_owner, "Sender is not owner!");
      
      revert:
      if(msg.sender != i_owner){
        revert NotOwner();
      }
      */
}
