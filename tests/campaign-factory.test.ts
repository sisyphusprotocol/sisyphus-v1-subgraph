import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
} from "matchstick-as/assembly/index";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { User, Campaign, UserCampaign, Record } from "../generated/schema";
import { AdminChanged } from "../generated/CampaignFactoryUpgradable/CampaignFactoryUpgradable";
import {
  handleCampaignCreated,
  handleWhiteTokenSet,
} from "../src/campaign-factory";
import {
  createEvCampaignCreatedEvent,
  createEvWhiteTokenSetEvent,
} from "./campaign-factory-utils";

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Handle campaign created", () => {
  beforeAll(() => {
    let previousAdmin = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    );
    let newAdmin = Address.fromString(
      "0x0000000000000000000000000000000000000002"
    );
    let newCampaignCreateEvent = createEvCampaignCreatedEvent(
      previousAdmin,
      newAdmin
    );
    handleCampaignCreated(newCampaignCreateEvent);
  });

  afterAll(() => {
    clearStore();
  });

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("ExampleEntity created and stored", () => {
    // assert.entityCount("ExampleEntity", 1)
    // // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    // assert.fieldEquals(
    //   "ExampleEntity",
    //   "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
    //   "previousAdmin",
    //   "0x0000000000000000000000000000000000000001"
    // )
    // assert.fieldEquals(
    //   "ExampleEntity",
    //   "0xa16081f360e3847006db660bae1c6d1b2e17ec2a",
    //   "newAdmin",
    //   "0x0000000000000000000000000000000000000001"
    // )
    // // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  });
});

describe("Handle white token set", () => {
  beforeAll(() => {
    let tokenAddress = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    );
    let allowAmount = new BigInt(10 * 18);
    let newWhiteTokenSetEvent = createEvWhiteTokenSetEvent(
      tokenAddress,
      allowAmount
    );
    handleWhiteTokenSet(newWhiteTokenSetEvent);
  });

  afterAll(() => {
    clearStore();
  });

  test("", () => {});
});
