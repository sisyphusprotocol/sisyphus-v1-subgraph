import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  Campaign,
  Challenge,
  Record,
  Token,
  User,
  UserCampaign,
  UserVote,
} from "../generated/schema";

import { Campaign as CampaignContract } from "../generated/templates/Campaign/Campaign";

export function readCampaignUri(campaign: Campaign): string {
  const cc = CampaignContract.bind(Address.fromString(campaign.id));
  let uriValue = "";
  let uriResilt = cc.try_campaignUri();

  if (!uriResilt.reverted) {
    uriValue = uriResilt.value;
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

export function readSuccessCount(campaign: Campaign): BigInt {
  const cc = CampaignContract.bind(Address.fromString(campaign.id));
  const count = cc.successTokensCount();
  return count;
}

export function readPendingUserReward(user: User, campaign: Campaign): BigInt {
  const userCampaign = fetchUserCampaign(user, campaign);
  const cc = CampaignContract.bind(Address.fromString(campaign.id));
  const pendingReward = cc.getTokenProperties(userCampaign.tokenId)
    .pendingReward;

  return pendingReward;
}

export function readSharedReward(campaign: Campaign): BigInt {
  const cc = CampaignContract.bind(Address.fromString(campaign.id));
  const sharedReward = cc.sharedReward();
  return sharedReward;
}

export function readRequiredAmount(campaign: Campaign): BigInt {
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

export function readStartTime(campaign: Campaign): BigInt {
  const cc = CampaignContract.bind(Address.fromString(campaign.id));
  const startTime = cc.startTime();
  return startTime;
}

export function readPeriod(campaign: Campaign): BigInt {
  const cc = CampaignContract.bind(Address.fromString(campaign.id));
  const period = cc.period();
  return period;
}

export function readTotalEpochsCount(campaign: Campaign): BigInt {
  const cc = CampaignContract.bind(Address.fromString(campaign.id));
  const readTotalEpochsCount = cc.totalEpochsCount();
  return readTotalEpochsCount;
}

export function readChallengeEpoch(
  campaign: Campaign,
  challengeId: BigInt
): BigInt {
  const cc = CampaignContract.bind(Address.fromString(campaign.id));
  const epoch = cc.challengeRecords(challengeId).value2;

  return epoch;
}

export function readChallengeChallengerId(
  campaign: Campaign,
  challenge: BigInt
): BigInt {
  const cc = CampaignContract.bind(Address.fromString(campaign.id));
  const challengerId = cc.challengeRecords(challenge).value0;

  return challengerId;
}

export function readChallengeCheaterId(
  campaign: Campaign,
  challenge: BigInt
): BigInt {
  const cc = CampaignContract.bind(Address.fromString(campaign.id));
  const challengerId = cc.challengeRecords(challenge).value1;

  return challengerId;
}

export function readChallengeVote(
  campaign: Campaign,
  tokenId: BigInt,
  challenge: Challenge
): boolean {
  const cc = CampaignContract.bind(Address.fromString(campaign.id));
  const voteChoice = cc.voters(challenge.number, tokenId).getChoice();

  return voteChoice;
}

export function fetchUser(address: string): User {
  let user = User.load(address);
  if (user == null) {
    user = new User(address);
    user.canBeHost = false;
    user.address = address;
  }
  user.save();
  return user;
}

export function fetchCampaign(address: string): Campaign {
  let campaign = Campaign.load(address);
  if (campaign == null) {
    campaign = new Campaign(address);
    campaign.address = address;
    campaign.startTime = readStartTime(campaign);
    campaign.periodLength = readPeriod(campaign);
    campaign.epochCount = readTotalEpochsCount(campaign);
    campaign.totalTime = readPeriod(campaign).times(
      readTotalEpochsCount(campaign)
    );
    campaign.endTime = campaign.startTime.plus(campaign.totalTime);
    campaign.memberCount = new BigInt(0);
    campaign.requiredAmount = new BigInt(0);
    campaign.targetToken = fetchToken(Address.zero().toHexString()).id;
    campaign.settled = false;
    campaign.successCount = new BigInt(0);
    campaign.sharedReward = new BigInt(0);
  }
  // uri may change, so always fetch
  campaign.uri = readCampaignUri(campaign);

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
    userCampaign.failure = false;
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

export function fetchChallenge(
  challengeId: BigInt,
  campaign: Campaign
): Challenge {
  let challenge = Challenge.load(challengeId.toString());

  if (challenge === null) {
    challenge = new Challenge(challengeId.toString());

    const challenger = fetchUser(
      readTokenOwner(
        campaign,
        readChallengeChallengerId(campaign, challengeId)
      ).toString()
    );

    const cheater = fetchUser(
      readTokenOwner(
        campaign,
        readChallengeCheaterId(campaign, challengeId)
      ).toString()
    );

    const record = fetchRecord(
      cheater,
      campaign,
      readChallengeEpoch(campaign, challengeId)
    );

    challenge.number = challengeId;
    challenge.campaign = campaign.id;
    challenge.challenger = challenger.id;
    challenge.cheater = cheater.id;
    challenge.record = record.id;
    challenge.result = "NotDecided";
    challenge.agreeCount = new BigInt(0);
    challenge.disagreeCount = new BigInt(0);

    challenge.save();
  }

  return challenge;
}

export function fetchUserVote(user: User, challenge: Challenge): UserVote {
  let userVote = UserVote.load(`${user.id}-${challenge.id}`);
  if (userVote == null) {
    userVote = new UserVote(`${user.id}-${challenge.id}`);
    userVote.user = user.id;
    userVote.campaign = challenge.campaign;
    userVote.challenge = challenge.id;

    userVote.save();
  }

  return userVote;
}
