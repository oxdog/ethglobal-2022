//SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SubscriptionAccess is ERC721, ERC721Enumerable {
  using Counters for Counters.Counter;

  Counters.Counter private passTracker;

  // User => tokenId
  // @dev default value tokenId 0 does not exist
  mapping(address => uint256) public activePass;

  constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {
    passTracker.increment();
  }

  function _issuePass(address _to) internal {
    // console.log("current", passTracker.current());
    _safeMint(_to, passTracker.current(), "");
    passTracker.increment();
  }

  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 tokenId
  ) internal virtual override(ERC721, ERC721Enumerable) {
    console.log("super _beforeTokenTransfer called");
  }

  function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC721Enumerable) returns (bool) {
    super.supportsInterface(interfaceId);
  }
}
