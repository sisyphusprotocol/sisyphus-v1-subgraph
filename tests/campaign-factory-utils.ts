import { newMockEvent, createMockedFunction } from "matchstick-as";
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts";
import {
  EvCampaignCreated,
  EvWhiteTokenSet,
} from "../generated/CampaignFactoryUpgradable/CampaignFactoryUpgradable";

export function createEvCampaignCreatedEvent(
  host: Address,
  campaignAddress: Address
): EvCampaignCreated {
  let campaignCreatedEvent = changetype<EvCampaignCreated>(newMockEvent());

  campaignCreatedEvent.parameters = new Array();

  campaignCreatedEvent.parameters.push(
    new ethereum.EventParam("host", ethereum.Value.fromAddress(host))
  );
  campaignCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "campaignAddress",
      ethereum.Value.fromAddress(campaignAddress)
    )
  );

  createMockedFunction(
    campaignAddress,
    "tokenAmount",
    "tokenAmount():(uint256)"
  ).returns([ethereum.Value.fromI32(10)]);

  createMockedFunction(
    campaignAddress,
    "tokenAddress",
    "tokenAddress():(address)"
  ).returns([ethereum.Value.fromAddress(Address.zero())]);

  return campaignCreatedEvent;
}

export function createEvWhiteTokenSetEvent(
  address: Address,
  amount: BigInt
): EvWhiteTokenSet {
  let whiteTokenSetEvent = changetype<EvWhiteTokenSet>(newMockEvent());

  whiteTokenSetEvent.parameters.push(
    new ethereum.EventParam("token", ethereum.Value.fromAddress(address))
  );

  whiteTokenSetEvent.parameters.push(
    new ethereum.EventParam("maxAmount", ethereum.Value.fromI32(amount.toI32()))
  );

  return whiteTokenSetEvent;
}
