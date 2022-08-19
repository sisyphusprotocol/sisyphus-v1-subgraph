import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  Campaign,
  Record,
  Token,
  User,
  UserCampaign,
} from "../generated/schema";

import { Campaign as CampaignContract } from "../generated/templates/Campaign/Campaign";

export function readCampaignUri(campaign: Campaign): string {
  const cc = CampaignContract.bind(Address.fromString(campaign.id));
  let uriValue = "";
  let uriResilt = cc.try_campaignUri();

  if (!uriResilt.reverted) {
    uriValue = uriResilt.value.toString();
  }

  return uriValue;
}

export function readTargetTokenAddress(campaign: Campaign): Address {
  const cc = CampaignContract.bind(Address.fromString(campaign.id));
  let targetTokenAddressValue = Address.zero();
  let targetTokenAddressResult = cc.try_targetToken();

  if (!targetTokenAddressResult.reverted) {
    targetTokenAddressValue = targetTokenAddressResult.value;
  }

  return targetTokenAddressValue;
}

export function readIdx(campaign: Campaign): BigInt {
  const cc = CampaignContract.bind(Address.fromString(campaign.id));
  let idxValue = cc._idx();

  return idxValue;
}

export function readRequiredAmout(campaign: Campaign): BigInt {
  const cc = CampaignContract.bind(Address.fromString(campaign.id));
  let requiredAmoutValue = new BigInt(0);
  let requiredAmoutResult = cc.try_requiredAmount();

  if (!requiredAmoutResult.reverted) {
    requiredAmoutValue = requiredAmoutResult.value;
  }

  return requiredAmoutValue;
}

export function readTokenOwner(campaign: Campaign, tokenId: BigInt): Address {
  const cc = CampaignContract.bind(Address.fromString(campaign.id));
  const owner = cc.ownerOf(tokenId);
  return owner;
}

export function readCurrentEpoch(campaign: Campaign): BigInt {
  const cc = CampaignContract.bind(Address.fromString(campaign.id));
  const epoch = cc.currentEpoch();
  return epoch;
}

export function fetchUser(address: string): User {
  let user = User.load(address);
  if (user == null) {
    user = new User(address);
    user.canBeHost = false;
  }
  user.save();
  return user;
}

export function fetchCampaign(address: string): Campaign {
  let campaign = Campaign.load(address);
  if (campaign == null) {
    campaign = new Campaign(address);
    campaign.uri = "";
    campaign.requiredAmount = new BigInt(0);
    campaign.targetToken = fetchToken(Address.zero().toHexString()).id;
  }
  campaign.save();
  return campaign;
}

export function fetchToken(address: string): Token {
  let token = Token.load(address);
  if (token == null) {
    token = new Token(address);
    token.maxAmount = new BigInt(0);
  }
  token.save();
  return token;
}

export function fetchUserCampaign(
  user: User,
  campaign: Campaign
): UserCampaign {
  let userCampaign = UserCampaign.load(`${user.id}-${campaign.id}`);

  if (userCampaign == null) {
    userCampaign = new UserCampaign(`${user.id}-${campaign.id}`);
    userCampaign.user = user.id;
    // TODO: not good to set 0
    userCampaign.tokenId = new BigInt(0);
    userCampaign.campaign = campaign.id;
    userCampaign.isHost = false;
    userCampaign.userStatus = "NotParticipate";
    userCampaign.pendingReward = new BigInt(0);
    userCampaign.pendingUserReward = new BigInt(0);
    userCampaign.pendingHostReward = new BigInt(0);
    userCampaign.userRewardClaimed = false;
    userCampaign.hostRewardClaimed = false;
  }
  userCampaign.save();
  return userCampaign;
}

export function fetchRecord(
  user: User,
  campaign: Campaign,
  epoch: BigInt
): Record {
  let userCampaign = fetchUserCampaign(user, campaign);

  let record = Record.load(`${userCampaign.id}-${epoch}`);

  if (record == null) {
    record = new Record(`${userCampaign.id}-${epoch}`);
    record.epoch = epoch;
    record.contentUri = "";
    record.userCampaign = userCampaign.id;
    record.timestamp = new BigInt(0);
  }
  record.save();

  return record;
}
