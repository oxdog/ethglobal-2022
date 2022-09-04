//SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SubscriptionAccess is ERC721 {
  using Counters for Counters.Counter;

  Counters.Counter private passTracker;

  constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {}

  function _issuePass(address _to) internal {
    _safeMint(_to, passTracker.current(), "");
    passTracker.increment();
  }
}
