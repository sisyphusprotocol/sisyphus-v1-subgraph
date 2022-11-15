import { BigInt, log } from "@graphprotocol/graph-ts";
import {
  EvCampaignUriSet,
  EvChallenge,
  EvCheckIn,
  EvClaimReward,
  EvFailure,
  EvModifyRegistry,
  EvRegisterSuccessfully,
  EvSettle,
  EvSignUp,
  EvVote,
  EvWithDraw,
} from "../generated/templates/Campaign/Campaign";
import {
  fetchCampaign,
  fetchUser,
  fetchUserCampaign,
  readTokenOwner,
  readRequiredAmount,
  readCurrentEpoch,
  fetchRecord,
  readIdx,
  readPendingUserReward,
  readSuccessCount,
  readSharedReward,
  fetchChallenge,
  fetchUserVote,
  readChallengeVote,
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

  // TODO: delete if disallow
  campaign.memberCount = campaign.memberCount.plus(BigInt.fromI64(1));

  userCampaign.userStatus = "Admitted";

  campaign.save();
  userCampaign.save();
}

export function handleModifyRegistry(event: EvModifyRegistry): void {
  const campaign = fetchCampaign(event.address.toHexString());

  for (let index = 0; index < event.params.tokenList.length; index++) {
    const user = fetchUser(
      readTokenOwner(campaign, event.params.tokenList[index]).toHexString()
    );
    const userCampaign = fetchUserCampaign(user, campaign);

    if (event.params.status[index]) {
      campaign.memberCount = campaign.memberCount.plus(BigInt.fromI64(1));
      userCampaign.userStatus = "Admitted";
    } else {
      campaign.memberCount = campaign.memberCount.minus(BigInt.fromI64(1));
      userCampaign.userStatus = "Signed";
    }

    campaign.save();
    userCampaign.save();
  }
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
  campaign.successCount = readSuccessCount(campaign);
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
  userCampaign.userRewardClaimedAmount = event.params.amount;

  userCampaign.pendingUserReward = readPendingUserReward(user, campaign);

  userCampaign.save();
}

export function handleWithDraw(event: EvWithDraw): void {
  const campaign = fetchCampaign(event.address.toHexString());
  const user = fetchUser(event.params.host.toHexString());

  const userCampaign = fetchUserCampaign(user, campaign);
  userCampaign.hostRewardClaimed = true;
  userCampaign.hostRewardClaimedAmount = event.params.hostReward;

  userCampaign.save();
}

export function handleCampaignUriSet(event: EvCampaignUriSet): void {
  const campaign = fetchCampaign(event.address.toHexString());
  campaign.save();
}

export function handleChallenge(event: EvChallenge): void {
  const campaign = fetchCampaign(event.address.toHexString());

  const challenge = fetchChallenge(event.params.challengeRecordId, campaign);

  challenge.save();
}

export function handleVote(event: EvVote): void {
  const campaign = fetchCampaign(event.address.toHexString());

  const challenge = fetchChallenge(event.params.challengeRecordId, campaign);
  const voter = fetchUser(
    readTokenOwner(campaign, event.params.tokenId).toHexString()
  );

  const userVote = fetchUserVote(voter, challenge);

  const newChoice = readChallengeVote(
    campaign,
    event.params.tokenId,
    challenge
  );

  // whether it's user first vote for this campaign
  if (userVote.get("choice") == null) {
    challenge.noVoteCount = challenge.noVoteCount.minus(BigInt.fromI32(1));
    if (newChoice == true) {
      challenge.agreeCount = challenge.agreeCount.plus(BigInt.fromI32(1));
    } else {
      challenge.disagreeCount = challenge.disagreeCount.plus(BigInt.fromI32(1));
    }
  } else {
    if (newChoice == true && userVote.choice == false) {
      challenge.agreeCount = challenge.agreeCount.plus(BigInt.fromI32(1));
      challenge.disagreeCount = challenge.disagreeCount.minus(
        BigInt.fromI32(1)
      );
    } else if (newChoice == false && userVote.choice == true) {
      challenge.agreeCount = challenge.agreeCount.minus(BigInt.fromI32(1));
      challenge.disagreeCount = challenge.disagreeCount.plus(BigInt.fromI32(1));
    }
  }

  userVote.choice = newChoice;
  challenge.save();
  userVote.save();
}
