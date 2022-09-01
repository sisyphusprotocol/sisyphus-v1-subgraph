import { BigInt, Bytes, dataSource } from "@graphprotocol/graph-ts";
import { Campaign, UserCampaign } from "../generated/schema";
import {
  EvCheckIn,
  EvClaimReward,
  EvFailure,
  EvRegisterSuccessfully,
  EvSettle,
  EvSignUp,
  EvWithDraw,
} from "../generated/templates/Campaign/Campaign";
import {
  fetchCampaign,
  fetchUser,
  fetchUserCampaign,
  readTokenOwner,
  readRequiredAmout,
  readCurrentEpoch,
  fetchRecord,
  readIdx,
  readPendingUserReward,
  readSuccessCount,
  readSharedReward,
} from "./helper";

export function handleSignUp(event: EvSignUp): void {
  const campaign = fetchCampaign(event.address.toHexString());
  const user = fetchUser(
    readTokenOwner(campaign, event.params.tokenId).toHexString()
  );

  const userCampaign = fetchUserCampaign(user, campaign);

  userCampaign.tokenId = event.params.tokenId;
  userCampaign.userStatus = "Signed";

  userCampaign.pendingReward = readPendingUserReward(user, campaign);
  userCampaign.pendingUserReward = readPendingUserReward(user, campaign);

  userCampaign.save();
}

export function handleRegisterSuccessfully(
  event: EvRegisterSuccessfully
): void {
  const campaign = fetchCampaign(event.address.toHexString());

  const user = fetchUser(
    readTokenOwner(campaign, event.params.tokenId).toHexString()
  );
  const userCampaign = fetchUserCampaign(user, campaign);

  // TODO: delte if disallow
  campaign.memberCount = campaign.memberCount.plus(new BigInt(1));
  campaign.save();

  userCampaign.userStatus = "Admitted";

  userCampaign.save();
}

export function handleCheckIn(event: EvCheckIn): void {
  const campaign = fetchCampaign(event.address.toHexString());
  const user = fetchUser(
    readTokenOwner(campaign, event.params.tokenId).toHexString()
  );
  // const userCampaign = fetchUserCampaign(user, campaign);
  const epoch = readCurrentEpoch(campaign);

  const record = fetchRecord(user, campaign, epoch);

  record.timestamp = event.block.timestamp;
  record.contentUri = event.params.contentUri;

  record.save();
}

export function handleSettle(event: EvSettle): void {
  const campaign = fetchCampaign(event.address.toHexString());

  campaign.settled = true;
  campaign.sucessCount = readSuccessCount(campaign);
  campaign.sharedReward = readSharedReward(campaign);

  campaign.save();
}

export function handleFailure(event: EvFailure): void {
  const campaign = fetchCampaign(event.address.toHexString());
  const user = fetchUser(
    readTokenOwner(campaign, event.params.tokenId).toHexString()
  );
  const userCampaign = fetchUserCampaign(user, campaign);

  userCampaign.failure = true;
  userCampaign.pendingUserReward = readPendingUserReward(user, campaign);

  userCampaign.save();
}

export function handleClaimReward(event: EvClaimReward): void {
  const campaign = fetchCampaign(event.address.toHexString());
  const user = fetchUser(
    readTokenOwner(campaign, event.params.tokenId).toHexString()
  );
  const userCampaign = fetchUserCampaign(user, campaign);

  userCampaign.userRewardClaimed = true;

  userCampaign.pendingUserReward = readPendingUserReward(user, campaign);

  userCampaign.save();
}

export function handleWithDraw(event: EvWithDraw): void {
  const campaign = fetchCampaign(event.address.toHexString());
  const user = fetchUser(event.params.host.toHexString());

  const userCampaign = fetchUserCampaign(user, campaign);
  userCampaign.hostRewardClaimed = true;

  userCampaign.save();
}
