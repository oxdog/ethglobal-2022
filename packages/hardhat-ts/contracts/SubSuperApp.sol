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

/// @dev Constant Flow Agreement registration key, used to get the address from the host.
bytes32 constant CFA_ID = keccak256("org.superfluid-finance.agreements.ConstantFlowAgreement.v1");

/// @dev Thrown when the callback caller is not the host.
error Unauthorized();

/// @dev Thrown when the token being streamed to this contract is invalid
error InvalidToken();

/// @dev Thrown when the agreement is other than the Constant Flow Agreement V1
error InvalidAgreement();

contract Subscription_SuperApp is SuperAppBase {
  using CFAv1Library for CFAv1Library.InitData;
  CFAv1Library.InitData public cfaV1Lib;

  ISuperToken internal immutable _acceptedToken;

  constructor(ISuperfluid host, ISuperToken acceptedToken) {
    assert(address(host) != address(0));
    assert(address(acceptedToken) != address(0));

    _acceptedToken = acceptedToken;

    cfaV1Lib = CFAv1Library.InitData({ host: host, cfa: IConstantFlowAgreementV1(address(host.getAgreementClass(CFA_ID))) });

    // Registers Super App, indicating it is the final level (it cannot stream to other super
    // apps), and that the `before*` callbacks should not be called on this contract, only the
    // `after*` callbacks.
    host.registerApp(
      SuperAppDefinitions.APP_LEVEL_FINAL |
        SuperAppDefinitions.BEFORE_AGREEMENT_CREATED_NOOP |
        SuperAppDefinitions.BEFORE_AGREEMENT_UPDATED_NOOP |
        SuperAppDefinitions.BEFORE_AGREEMENT_TERMINATED_NOOP
    );
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
    bytes calldata, //_agreementData
    bytes calldata, //_cbdata
    bytes calldata _ctx
  ) external override onlyExpected(_superToken, _agreementClass) onlyHost returns (bytes memory newCtx) {
    console.log("afterAgreementCreated called");
    newCtx = _ctx;
  }

  function afterAgreementUpdated(
    ISuperToken _superToken,
    address _agreementClass,
    bytes32, // _agreementId,
    bytes calldata, // _agreementData,
    bytes calldata, // _cbdata,
    bytes calldata _ctx
  ) external override onlyExpected(_superToken, _agreementClass) onlyHost returns (bytes memory newCtx) {
    console.log("afterAgreementUpdated called");
    newCtx = _ctx;
  }

  function afterAgreementTerminated(
    ISuperToken _superToken,
    address _agreementClass,
    bytes32, // _agreementId,
    bytes calldata, // _agreementData
    bytes calldata, // _cbdata,
    bytes calldata _ctx
  ) external override onlyHost returns (bytes memory newCtx) {
    console.log("afterAgreementTerminated called");
    newCtx = _ctx;
  }
}
