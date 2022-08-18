import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Campaign, Token, User, UserCampaign } from "../generated/schema";

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

export function readOwner(campaign: Campaign, tokenId: BigInt): Address {
  const cc = CampaignContract.bind(Address.fromString(campaign.id));
  const owner = cc.ownerOf(tokenId);
  return owner;
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
