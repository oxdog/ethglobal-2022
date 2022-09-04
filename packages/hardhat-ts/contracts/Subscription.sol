//SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { Subscription_SuperApp, ISuperfluid, ISuperToken } from "./SubSuperApp.sol";

contract SubscriptionAccess is ERC721, Subscription_SuperApp {
  constructor(
    string memory _name,
    string memory _symbol,
    ISuperfluid _host,
    ISuperToken _acceptedToken
  ) ERC721(_name, _symbol) Subscription_SuperApp(_host, _acceptedToken) {}

  function _beforeTokenTransfer(
    address, // from
    address to,
    uint256 // tokenId
  ) internal override {
    console.log("_beforeTokenTransfer called");
  }
}
