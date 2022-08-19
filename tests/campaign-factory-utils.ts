import { newMockEvent, createMockedFunction } from "matchstick-as";
import { ethereum, Address, BigInt, ByteArray, Bytes } from "@graphprotocol/graph-ts";
import {
  EvCampaignCreated,
  EvWhiteTokenSet,
  EvWhiteUserSet,
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
    "requiredAmount",
    "requiredAmount():(uint256)"
  ).returns([ethereum.Value.fromI32(10)]);

  createMockedFunction(
    campaignAddress,
    "targetToken",
    "targetToken():(address)"
  ).returns([ethereum.Value.fromAddress(Address.zero())]);

  createMockedFunction(
    campaignAddress,
    "campaignUri",
    "campaignUri():(bytes32)"
  ).returns([
    ethereum.Value.fromBytes(
      Bytes.fromHexString(
        "0x697066733a2f2f516d7878787878000000000000000000000000000000000000"
      )
    ),
  ]);

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

export function createEvWhiteUserSetEvent(
  user: Address,
  status: boolean
): EvWhiteUserSet {
  let whiteUserSetEvent = changetype<EvWhiteUserSet>(newMockEvent());

  whiteUserSetEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  );

  whiteUserSetEvent.parameters.push(
    new ethereum.EventParam("status", ethereum.Value.fromBoolean(status))
  );

  return whiteUserSetEvent;
}
