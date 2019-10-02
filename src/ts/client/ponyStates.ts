import { animatorState as state, animatorTransition as transition, anyState, AnimatorState } from '../common/animator';
import {
	stand, sit, sitDown, standUp, lie, lieDown, sitUp, flyBug, fly, flyUp, flyDown, flyUpBug, flyDownBug,
	trot, boop, boopSit, swim, sitToTrot, lieToTrot, boopLie, trotToFly, trotToFlyBug, boopFly, boopFlyBug,
	flyToTrot, flyToTrotBug, swing, swimToTrot, trotToSwim, swimToFly, flyToSwim, boopSwim, swimToFlyBug, flyToSwimBug,
	kissBody, kissLiftHoofBody, kissFlyBody, kissFlyBugBody, kissLieBody, kissSitBody, kissSwimBody, kissToTrot
} from './ponyAnimations';
import { BodyAnimation } from '../common/interfaces';

function n(value: string) {
	return (DEVELOPMENT || SERVER) ? value : '';
}

export const standing = state(n('standing'), stand);
export const trotting = state(n('trotting'), trot);

export const swimming = state(n('swimming'), swim);
export const swimmingToTrotting = state(n('swimming-to-trotting'), swimToTrot);
export const trottingToSwimming = state(n('trotting-to-swimming'), trotToSwim);
export const swimmingToFlying = state(n('swimming-to-flying'), swimToFly, { bug: swimToFlyBug });
export const flyingToSwimming = state(n('flying-to-swimming'), flyToSwim, { bug: flyToSwimBug });

export const booping = state(n('booping'), boop);
export const boopingSitting = state(n('booping-sitting'), boopSit);
export const boopingLying = state(n('booping-lying'), boopLie);
export const boopingFlying = state(n('booping-flying'), boopFly, { bug: boopFlyBug });
export const boopingSwimming = state(n('booping-swimming'), boopSwim);

export const kissing = state(n('kissing'), kissBody);
export const kissingHoof = state(n('kissing'), kissLiftHoofBody);
export const kissingFlying = state(n('kissing-flying'), kissFlyBody, { bug: kissFlyBugBody });
export const kissingLying = state(n('kissing-lying'), kissLieBody);
export const kissingSitting = state(n('kissing-sitting'), kissSitBody);
export const kissingSwimming = state(n('kissing-swimming'), kissSwimBody);
export const kissingToTrotting = state(n('sitting-to-trotting'), kissToTrot);

export const sitting = state(n('sitting'), sit);
export const sittingDown = state(n('sitting-down'), sitDown);
export const standingUp = state(n('standing-up'), standUp);
export const sittingToTrotting = state(n('sitting-to-trotting'), sitToTrot);

export const lying = state(n('lying'), lie);
export const lyingDown = state(n('lying-down'), lieDown);
export const sittingUp = state(n('sitting-up'), sitUp);
export const lyingToTrotting = state(n('lying-to-trotting'), lieToTrot);

export const hovering = state(n('hovering'), fly, { bug: flyBug });
export const flying = state(n('flying'), fly, { bug: flyBug });
export const flyingUp = state(n('flying-up'), flyUp, { bug: flyUpBug });
export const flyingDown = state(n('flying-down'), flyDown, { bug: flyDownBug });

export const trottingToFlying = state(n('trotting-to-flying'), trotToFly, { bug: trotToFlyBug });
export const flyingToTrotting = state(n('flying-to-trotting'), flyToTrot, { bug: flyToTrotBug });

export const swinging = state(n('swinging'), swing);

export const ponyStates = [
	anyState, standing, trotting, swimming, swimmingToTrotting, trottingToSwimming,
	booping, boopingSitting, boopingLying, boopingFlying,
	sitting, sittingDown, standingUp, sittingToTrotting,
	lying, lyingDown, sittingUp, lyingToTrotting,
	hovering, flying, flyingUp, flyingDown, trottingToFlying, flyingToTrotting,
	swinging, swimmingToFlying, flyingToSwimming, boopingSwimming, kissing, kissingHoof,
	kissingFlying, kissingLying, kissingSitting, kissingSwimming, kissingToTrotting
];

transition(hovering, flyingDown, { exitAfter: 0 });
transition(flyingDown, standing);
transition(standing, sittingDown, { exitAfter: 0 });
transition(sittingDown, sitting);
transition(sitting, lyingDown, { exitAfter: 0 });
transition(lyingDown, lying);

transition(lying, sittingUp, { exitAfter: 0 });
transition(sittingUp, sitting);
transition(sitting, standingUp, { exitAfter: 0 });
transition(standingUp, standing);
transition(standing, flyingUp, { exitAfter: 0 });
transition(flyingUp, hovering);
// transition(flyingUp, trottingToFlying, { exitAfter: 0, keepTime: true });

transition(sitting, sittingToTrotting, { exitAfter: 0, onlyDirectTo: trotting });
transition(sittingToTrotting, trotting, { enterTime: 6.1 / 16 });
transition(sittingToTrotting, standing);

transition(lying, lyingToTrotting, { exitAfter: 0, onlyDirectTo: trotting });
transition(lyingToTrotting, trotting, { enterTime: 6.1 / 16 });
transition(lyingToTrotting, standing, { exitAfter: 5 / 6 });

transition(trotting, trottingToFlying, { exitAfter: 4 / 16 });
transition(trottingToFlying, flying);

transition(flying, flyingToTrotting, { exitAfter: 0 });
transition(flyingToTrotting, trotting, { enterTime: 6 / 16 });

transition(swimming, swimmingToTrotting, { exitAfter: 0 });
transition(swimming, swimmingToFlying, { exitAfter: 0 });
transition(swimmingToTrotting, trotting);
transition(swimmingToTrotting, standing);
transition(trotting, trottingToSwimming, { exitAfter: 0 });
transition(standing, trottingToSwimming, { exitAfter: 0 });
transition(trottingToSwimming, swimming);
transition(swimmingToFlying, hovering);
transition(swimmingToFlying, flying);
transition(flying, flyingToSwimming, { exitAfter: 0 });
transition(hovering, flyingToSwimming, { exitAfter: 0 });
transition(flyingToSwimming, swimming);

transition(trotting, standing, { exitAfter: 0 });
transition(flying, hovering, { exitAfter: 0, keepTime: true });

transition(boopingSwimming, swimming);
transition(swimming, boopingSwimming, { exitAfter: 0 });
transition(booping, standing);
transition(standing, booping, { exitAfter: 0 });
transition(boopingSitting, sitting);
transition(sitting, boopingSitting, { exitAfter: 0 });
transition(boopingLying, lying);
transition(lying, boopingLying, { exitAfter: 0 });
transition(boopingFlying, hovering, { enterTime: 1.1 / 10 });
transition(hovering, boopingFlying, { exitAfter: 0 });

transition(kissingSwimming, swimming);
transition(swimming, kissingSwimming, { exitAfter: 0 });
transition(kissing, standing);
transition(standing, kissing, { exitAfter: 0 });
transition(kissingHoof, standing);
transition(standing, kissingHoof, { exitAfter: 0 });
transition(kissingFlying, hovering, { enterTime: 1.1 / 10 });
transition(hovering, kissingFlying, { exitAfter: 0 });
transition(kissingLying, lying);
transition(lying, kissingLying, { exitAfter: 0 });
transition(kissingSitting, sitting);
transition(sitting, kissingSitting, { exitAfter: 0 });

transition(kissing, kissingToTrotting, { exitAfter: 0, onlyDirectTo: trotting });
transition(kissingToTrotting, trotting);

transition(kissingSitting, sittingToTrotting, { exitAfter: 0, onlyDirectTo: trotting });
transition(sittingToTrotting, standing);

transition(kissingLying, lyingToTrotting, { exitAfter: 0, onlyDirectTo: trotting });
transition(lyingToTrotting, standing);

transition(anyState, trotting, { exitAfter: 0, keepTime: true });
transition(anyState, flying, { exitAfter: 0, keepTime: true });

transition(standing, swinging, { exitAfter: 0 });
transition(swinging, standing);

export function isFlyingUp(state: AnimatorState<BodyAnimation> | undefined) {
	return state === flyingUp || state === trottingToFlying || state === swimmingToFlying;
}

export function isFlyingDown(state: AnimatorState<BodyAnimation> | undefined) {
	return state === flyingDown || state === flyingToTrotting || state === flyingToSwimming;
}

export function isSwimmingState(state: AnimatorState<BodyAnimation> | undefined) {
	return state === swimming || state === trottingToSwimming || state === swimmingToTrotting ||
		state === flyingToSwimming || state === swimmingToFlying || state === boopingSwimming ||
		state === kissingSwimming;
}

export function isFlyingUpOrDown(state: AnimatorState<BodyAnimation> | undefined) {
	return isFlyingUp(state) || isFlyingDown(state);
}

export function isSittingDown(state: AnimatorState<BodyAnimation> | undefined) {
	return state === sittingDown;
}
export function isSittingUp(state: AnimatorState<BodyAnimation> | undefined) {
	return state === sittingUp;
}

export function toBoopState(state: AnimatorState<BodyAnimation>) {
	switch (state) {
		case standing: return booping;
		case sitting: return boopingSitting;
		case lying: return boopingLying;
		case hovering: return boopingFlying;
		case swimming: return boopingSwimming;
		default: return undefined;
	}
}

export function toKissState(state: AnimatorState<BodyAnimation>) {
	switch (state) {
		case standing: return (Math.random() < 0.5 ? kissing : kissingHoof);
		case sitting: return kissingSitting;
		case lying: return kissingLying;
		case hovering: return kissingFlying;
		case swimming: return kissingSwimming;
		default: return undefined;
	}
}
