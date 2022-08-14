import { BigInt } from "@graphprotocol/graph-ts";
import {
  CampaignFactoryUpgradable,
  EvCampaignCreated,
  BeaconUpgraded,
  Upgraded,
} from "../generated/CampaignFactoryUpgradable/CampaignFactoryUpgradable";
import { User, Campaign, UserCampaign } from "../generated/schema";
import { fetchUser, readRequiredAmout, readTargetTokenAddress } from "./helper";

export function handleCampaignCreated(event: EvCampaignCreated): void {
  const campaign = new Campaign(event.params.campaignAddress.toHexString());
  const user = fetchUser(event.params.promoter.toHexString());

  campaign.requiredAmount = readRequiredAmout(campaign);
  campaign.targetToken = readTargetTokenAddress(campaign).toHexString();

  const userCampaign = new UserCampaign(`${user.id}-${campaign.id}`);
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

export function handleWhiteTokenSet(): void {}