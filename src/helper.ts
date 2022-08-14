import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Campaign, User } from "../generated/schema";

import { Campaign as CampaignContract } from "../generated/templates/Campaign/Campaign";

export function readTargetTokenAddress(campaign: Campaign): Address {
  const cc = CampaignContract.bind(Address.fromString(campaign.id));
  let targetTokenAddressValue = Address.zero();
  let targetTokenAddressResult = cc.try_tokenAddress();

  if (!targetTokenAddressResult.reverted) {
    targetTokenAddressValue = targetTokenAddressResult.value;
  }

  return targetTokenAddressValue;
}

export function readRequiredAmout(campaign: Campaign): BigInt {
  const cc = CampaignContract.bind(Address.fromString(campaign.id));
  let requiredAmoutValue = new BigInt(0);
  let requiredAmoutResult = cc.try_tokenAmount();

  if (!requiredAmoutResult.reverted) {
    requiredAmoutValue = requiredAmoutResult.value;
  }

  return requiredAmoutValue;
}

export function fetchUser(address: string): User {
  let user = User.load(address);
  if (user == null) {
    user = new User(address);
  }
  user.save();
  return user;
}
