import { Address, BigInt } from '@graphprotocol/graph-ts';
import {
  SuperSaver,
  Deposit,
  ProcessDeposit,
  ProcessRedeem,
  Redeem,
} from '../generated/SuperSaver/SuperSaver';
import { UserTokenProfile, TokenProfile } from '../generated/schema';

const ZERO = new BigInt(0);

export function handleDeposit(event: Deposit): void {
  let token = event.params.token;
  let sender = event.params.sender;
  let id = token.toHex() + sender.toHex();

  let userTokenProfile = UserTokenProfile.load(id);

  if (userTokenProfile == null) {
    userTokenProfile = new UserTokenProfile(id);

    userTokenProfile.sender = sender;
    userTokenProfile.token = token;
    userTokenProfile.pending = ZERO;
    userTokenProfile.locked = ZERO;
    userTokenProfile.redeem = ZERO;
  }

  let tokenProfile = TokenProfile.load(token.toHex());

  if (tokenProfile == null) {
    tokenProfile = new TokenProfile(token.toHex());

    tokenProfile.pendingDeposit = ZERO;
    tokenProfile.pendingRedeem = ZERO;
  }

  userTokenProfile.pending = userTokenProfile.pending.plus(event.params.amount);
  tokenProfile.pendingDeposit = tokenProfile.pendingDeposit.plus(
    event.params.amount
  );

  userTokenProfile.save();
  tokenProfile.save();
}

export function handleProcessDeposit(event: ProcessDeposit): void {
  let token = event.params.token;

  let tokenProfile = TokenProfile.load(token.toHex());
  if (tokenProfile == null) {
    return;
  }

  tokenProfile.pendingDeposit = ZERO;
  tokenProfile.save();
}

export function handleProcessRedeem(event: ProcessRedeem): void {
  let token = event.params.token;

  let tokenProfile = TokenProfile.load(token.toHex());
  if (tokenProfile == null) {
    return;
  }

  tokenProfile.pendingRedeem = ZERO;
  tokenProfile.save();
}

export function handleRedeem(event: Redeem): void {
  let token = event.params.token;
  let sender = event.params.sender;
  let id = token.toHex() + sender.toHex();

  let userTokenProfile = UserTokenProfile.load(id);
  if (userTokenProfile == null) {
    return;
  }

  let tokenProfile = TokenProfile.load(token.toHex());
  if (tokenProfile == null) {
    return;
  }

  userTokenProfile.redeem = userTokenProfile.redeem.plus(event.params.amount);
  tokenProfile.pendingRedeem = tokenProfile.pendingRedeem.plus(
    event.params.amount
  );

  userTokenProfile.save();
  tokenProfile.save();
}
