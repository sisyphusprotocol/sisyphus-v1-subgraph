import { BigInt } from "@graphprotocol/graph-ts";
import {
  CampaignFactoryUpgradable,
  EvCampaignCreated,
  BeaconUpgraded,
  Upgraded,
  EvWhiteTokenSet,
  EvWhiteUserSet,
} from "../generated/CampaignFactoryUpgradable/CampaignFactoryUpgradable";
import { Campaign as CampaignTemplate } from "../generated/templates";
import { User, Campaign, UserCampaign, Token } from "../generated/schema";
import {
  fetchUser,
  readRequiredAmout,
  readTargetTokenAddress,
  fetchToken,
  fetchCampaign,
  readCampaignUri,
  fetchUserCampaign,
} from "./helper";
import { campaignIgnoredList } from "./const";

export function handleWhiteUserSet(event: EvWhiteUserSet): void {
  const user = fetchUser(event.params.user.toHexString());
  user.canBeHost = event.params.status;
  user.save();
}

export function handleWhiteTokenSet(event: EvWhiteTokenSet): void {
  const token = fetchToken(event.params.token.toHexString());

  token.maxAmount = event.params.maxAmount;

  token.save();
}

export function handleCampaignCreated(event: EvCampaignCreated): void {
  // if campaign should be ignored, return
  if (
    campaignIgnoredList.includes(event.params.campaignAddress.toHexString())
  ) {
    return;
  }

  // create data Source to track
  CampaignTemplate.create(event.params.campaignAddress);

  const campaign = fetchCampaign(event.params.campaignAddress.toHexString());
  const user = fetchUser(event.params.host.toHexString());
  const token = fetchToken(readTargetTokenAddress(campaign).toHexString());

  campaign.requiredAmount = readRequiredAmout(campaign);
  campaign.uri = readCampaignUri(campaign);
  campaign.targetToken = token.id;

  const userCampaign = fetchUserCampaign(user, campaign);
  userCampaign.user = user.id;
  userCampaign.campaign = campaign.id;
  userCampaign.isHost = true;
  userCampaign.userStatus = "NotParticipate";
  userCampaign.pendingReward = new BigInt(0);
  userCampaign.pendingHostReward = new BigInt(0);
  userCampaign.pendingUserReward = new BigInt(0);

  userCampaign.userRewardClaimed = false;
  userCampaign.hostRewardClaimed = false;

  campaign.save();
  userCampaign.save();
  user.save();
}
