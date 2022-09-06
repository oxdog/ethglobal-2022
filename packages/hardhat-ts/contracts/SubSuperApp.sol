// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;
import "hardhat/console.sol";

import {
  ISuperfluid,
  ISuperToken,
  ISuperApp,
  ISuperAgreement,
  SuperAppDefinitions
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import { CFAv1Library } from "@superfluid-finance/ethereum-contracts/contracts/apps/CFAv1Library.sol";
import { IConstantFlowAgreementV1 } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";
import { SuperAppBase } from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperAppBase.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @dev Constant Flow Agreement registration key, used to get the address from the host.
bytes32 constant CFA_ID = keccak256("org.superfluid-finance.agreements.ConstantFlowAgreement.v1");

/// @dev Thrown when the callback caller is not the host.
error Unauthorized();

/// @dev Thrown when the token being streamed to this contract is invalid
error InvalidToken();

/// @dev Thrown when the agreement is other than the Constant Flow Agreement V1
error InvalidAgreement();

contract Subscription_SuperApp is SuperAppBase, ERC721, ERC721Enumerable {
  using CFAv1Library for CFAv1Library.InitData;
  using Counters for Counters.Counter;

  CFAv1Library.InitData public cfaV1Lib;
  ISuperToken internal immutable _acceptedToken;
  Counters.Counter private passTracker;
  ISuperfluid private host;

  // User => tokenId
  /// @dev Active Pass Registry of Subscribers, 0 means no active pass
  mapping(address => uint256) public activePass;

  // tokenId => active
  /// @dev State Registry of Pass
  mapping(uint256 => bool) public passState;

  // tokenId => Total Transmitted Value
  /// @dev Registry on value transmitted per pass
  mapping(uint256 => uint256) public TTV;

  constructor(
    ISuperfluid _host,
    ISuperToken acceptedToken,
    string memory _name,
    string memory _symbol
  ) ERC721(_name, _symbol) {
    assert(address(_host) != address(0));
    assert(address(acceptedToken) != address(0));

    _acceptedToken = acceptedToken;
    host = _host;

    cfaV1Lib = CFAv1Library.InitData({ host: host, cfa: IConstantFlowAgreementV1(address(host.getAgreementClass(CFA_ID))) });

    // Registers Super App, indicating it is the final level (it cannot stream to other super
    // apps), and that the `before*` callbacks should not be called on this contract, only the
    // `after*` callbacks.
    host.registerApp(SuperAppDefinitions.APP_LEVEL_FINAL | SuperAppDefinitions.BEFORE_AGREEMENT_CREATED_NOOP);

    passTracker.increment(); //start passId at 1
  }

  // ---------------------------------------------------------------------------------------------
  // MODIFIERS

  modifier onlyHost() {
    if (msg.sender != address(cfaV1Lib.host)) revert Unauthorized();
    _;
  }

  modifier onlyExpected(ISuperToken superToken, address agreementClass) {
    if (superToken != _acceptedToken) revert InvalidToken();
    if (agreementClass != address(cfaV1Lib.cfa)) revert InvalidAgreement();
    _;
  }

  // ---------------------------------------------------------------------------------------------
  // SUPER APP CALLBACKS

  function afterAgreementCreated(
    ISuperToken _superToken,
    address _agreementClass,
    bytes32, //_agreementId
    bytes calldata _agreementData,
    bytes calldata, // _cbdata,
    bytes calldata _ctx
  ) external override onlyExpected(_superToken, _agreementClass) onlyHost returns (bytes memory newCtx) {
    (address sender, ) = abi.decode(_agreementData, (address, address));
    _issuePass(sender);
    newCtx = _ctx;
  }

  function beforeAgreementUpdated(
    ISuperToken _superToken,
    address _agreementClass,
    bytes32 _agreementId,
    bytes calldata, /*agreementData*/
    bytes calldata /*ctx*/
  ) external view override onlyExpected(_superToken, _agreementClass) onlyHost returns (bytes memory) {
    (uint256 timestamp, int96 flowRate, , ) = cfaV1Lib.cfa.getFlowByID(_superToken, _agreementId);
    return abi.encode(timestamp, flowRate);
  }

  function afterAgreementUpdated(
    ISuperToken _superToken,
    address _agreementClass,
    bytes32, // _agreementId,
    bytes calldata _agreementData,
    bytes calldata _cbdata,
    bytes calldata _ctx
  ) external override onlyExpected(_superToken, _agreementClass) onlyHost returns (bytes memory newCtx) {
    (uint256 timestamp, int96 flowRate) = abi.decode(_cbdata, (uint256, int96));
    (address sender, ) = abi.decode(_agreementData, (address, address));
    uint256 passId = activePass[sender];
    if (passId > 0) {
      _logTTV(activePass[sender], timestamp, flowRate);
    }

    newCtx = _ctx;
  }

  function beforeAgreementTerminated(
    ISuperToken _superToken,
    address _agreementClass,
    bytes32 _agreementId,
    bytes calldata,
    bytes calldata
  ) external view override onlyExpected(_superToken, _agreementClass) onlyHost returns (bytes memory) {
    (uint256 timestamp, int96 flowRate, , ) = cfaV1Lib.cfa.getFlowByID(_superToken, _agreementId);
    return abi.encode(timestamp, flowRate);
  }

  function afterAgreementTerminated(
    ISuperToken _superToken,
    address _agreementClass,
    bytes32, // _agreementId,
    bytes calldata _agreementData,
    bytes calldata _cbdata,
    bytes calldata _ctx
  ) external override onlyHost returns (bytes memory newCtx) {
    (address sender, ) = abi.decode(_agreementData, (address, address));
    (uint256 timestamp, int96 flowRate) = abi.decode(_cbdata, (uint256, int96));

    uint256 passId = activePass[sender];
    if (passId > 0) {
      _logTTV(passId, timestamp, flowRate);
      _deactivatePass(passId);
      _clearActivePass(sender);
    }
    newCtx = _ctx;
  }

  // ---------------------------------------------------------------------------------------------
  // Pass Logic
  function _issuePass(address to) internal {
    require(activePass[to] == 0, "SFA: Subscriber has active pass");
    uint256 passId = passTracker.current();
    _safeMint(to, passId, "");
    activePass[to] = passId;
    passState[passId] = true;
    passTracker.increment();
  }

  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 tokenId
  ) internal override(ERC721, ERC721Enumerable) {
    super._beforeTokenTransfer(from, to, tokenId);

    if (from != address(0) && from != to) {
      if (activePass[from] == tokenId) {
        _logActivePassTTV(from);
        _deactivatePass(tokenId);
        _clearActivePass(from);
        cfaV1Lib.deleteFlow(from, address(this), _acceptedToken);
      }
    }
  }

  function _deactivatePass(uint256 passId) internal {
    passState[passId] = false;
  }

  function _logActivePassTTV(address _subscriber) internal {
    require(activePass[_subscriber] > 0, "No active pass to log");
    (uint256 timestamp, int96 flowRate, , ) = cfaV1Lib.cfa.getFlow(_acceptedToken, _subscriber, address(this));
    _logTTV(activePass[_subscriber], timestamp, flowRate);
  }

  // TTV ... Total Transmitted Value
  function _logTTV(
    uint256 _passId,
    uint256 timestamp,
    int96 flowRate
  ) internal {
    uint256 timeElapsed = block.timestamp - timestamp;
    uint256 _TTV = timeElapsed * uint256(uint96(flowRate));
    TTV[_passId] += _TTV;
  }

  function _clearActivePass(address _subscriber) internal {
    activePass[_subscriber] = 0;
  }

  function switchPass(uint256 passId) external {
    require(ownerOf(passId) == msg.sender, "Not Owner of Pass");
    (uint256 timestamp, , , ) = cfaV1Lib.cfa.getFlow(_acceptedToken, msg.sender, address(this));
    require(timestamp > 0, "No stream active");
    _logActivePassTTV(msg.sender);
    _deactivatePass(activePass[msg.sender]);
    activePass[msg.sender] = passId;
  }

  function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC721Enumerable) returns (bool) {
    super.supportsInterface(interfaceId);
  }
}
