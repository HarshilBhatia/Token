pragma solidity ^0.5.1;

import "./Mytoken.sol";

contract Ico {
  address payable admin;
  MyToken public tokenContract;
  uint256 public tokenPrice;
  uint256 public tokensSold;

  constructor(MyToken _tokenContract, uint256 _tokenPrice) public {
    admin = msg.sender;
    tokenContract = _tokenContract;
    tokenPrice = _tokenPrice;
  }

  function multiply(uint256 x, uint256 y) internal pure returns (uint256 z) {
    require(y == 0 || (z = x * y) / y == x);
  }

  event SELL(address _buyer, uint256 _amount);

  function buyTokens(uint256 _numberOfTokens) public payable {
    require(msg.value == multiply(_numberOfTokens, tokenPrice));
    require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
    require(tokenContract.transfer(msg.sender, _numberOfTokens));

    tokensSold += _numberOfTokens;

    emit SELL(msg.sender, _numberOfTokens);
  }

  function endSale() public payable {
    require(msg.sender == admin);
    require(
      tokenContract.transfer(admin, tokenContract.balanceOf(address(this)))
    );
    //transfer money back to admin
    admin.transfer(address(this).balance);
  }
}
