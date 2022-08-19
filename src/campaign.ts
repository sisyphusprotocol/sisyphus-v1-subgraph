import { BigInt, Bytes, dataSource } from "@graphprotocol/graph-ts";
import { Campaign, UserCampaign } from "../generated/schema";
import {
  EvCheckIn,
  EvRegisterSuccessfully,
  EvSignUp,
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
} from "./helper";

export function handleSignUp(event: EvSignUp): void {
  const campaign = fetchCampaign(event.address.toHexString());
  const user = fetchUser(
    readTokenOwner(campaign, event.params.tokenId).toHexString()
  );

  const userCampaign = fetchUserCampaign(user, campaign);

  userCampaign.tokenId = event.params.tokenId;
  userCampaign.userStatus = "Signed";

  // TODO: read onchain directly later
  userCampaign.pendingReward = readRequiredAmout(campaign);
  userCampaign.pendingUserReward = readRequiredAmout(campaign);

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
  record.contentUri = event.params.contentUri.toString();

  record.save();
}
