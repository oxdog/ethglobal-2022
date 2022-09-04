//SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "hardhat/console.sol";

import { ISuperfluid, ISuperToken, ISuperApp } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import { ISuperfluidToken } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluidToken.sol";
import { IConstantFlowAgreementV1 } from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";
import { CFAv1Library } from "@superfluid-finance/ethereum-contracts/contracts/apps/CFAv1Library.sol";

error Unauthorized();

contract MoneyRouter {
  using CFAv1Library for CFAv1Library.InitData;
  CFAv1Library.InitData public cfaV1;

  address public owner;

  constructor(ISuperfluid host) {
    owner = msg.sender;

    cfaV1 = CFAv1Library.InitData(
      host,
      IConstantFlowAgreementV1(address(host.getAgreementClass(keccak256("org.superfluid-finance.agreements.ConstantFlowAgreement.v1"))))
    );
  }

  modifier onlyOwner() {
    if (msg.sender != owner) revert Unauthorized();
    _;
  }

  /// @notice Create flow from contract to specified address.
  /// @param token Token to stream.
  /// @param receiver Receiver of stream.
  /// @param flowRate Flow rate per second to stream.
  function createFlowFromContract(
    ISuperfluidToken token,
    address receiver,
    int96 flowRate
  ) external onlyOwner {
    cfaV1.createFlow(receiver, token, flowRate);
    console.log("Create flow");
  }

  /// @notice Create a stream into the contract.
  /// @dev This requires the contract to be a flowOperator for the msg sender.
  /// @param token Token to stream.
  /// @param flowRate Flow rate per second to stream.
  function createFlowIntoContract(ISuperfluidToken token, int96 flowRate) external {
    cfaV1.createFlowByOperator(msg.sender, address(this), token, flowRate);
  }
}
