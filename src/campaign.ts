import { dataSource } from "@graphprotocol/graph-ts";
import { Campaign, UserCampaign } from "../generated/schema";
import {
  EvRegisterSuccessfully,
  EvSignUp,
} from "../generated/templates/Campaign/Campaign";
import {
  fetchUser,
  fetchUserCampaign,
  readOwner,
  readRequiredAmout,
} from "./helper";

export function handleSignUp(event: EvSignUp): void {
  const campaign = Campaign.load(dataSource.address.toString());
  const user = fetchUser(
    readOwner(campaign, event.params.tokenId).toHexString()
  );

  const userCampaign = fetchUserCampaign(user, campaign);

  userCampaign.userStatus = "Signed";

  // TODO: read onchain directly later
  userCampaign.pendingReward = readRequiredAmout(campaign);
  userCampaign.pendingUserReward = readRequiredAmout(campaign);

  userCampaign.save();
}

export function handleRegisterSuccessfully(
  event: EvRegisterSuccessfully
): void {
  const campaign = Campaign.load(dataSource.address.toString());
  const user = fetchUser(
    readOwner(campaign, event.params.tokenId).toHexString()
  );
  const userCampaign = fetchUserCampaign(user, campaign);

  userCampaign.userStatus = "Admitted";

  userCampaign.save();
}
