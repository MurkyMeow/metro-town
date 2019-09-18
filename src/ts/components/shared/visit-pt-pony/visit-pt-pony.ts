import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { defaultExpression } from '../../../client/ponyUtils';
import { defaultPonyState } from '../../../client/ponyHelpers';
import { Expression, Muzzle, HeadAnimation, BodyAnimation, Eye } from '../../../common/interfaces';
import { excite_meno, happy_tongue_meno, stand, boop, happy_tongue_meno_2 } from '../../../client/ponyAnimations';
import { FrameService, FrameLoop } from '../../services/frameService';
import { CharacterPreview } from '../character-preview/character-preview';
import { decompressPonyString } from '../../../common/compressPony';

const BLEP: Expression = {
	...defaultExpression,
	left: Eye.Neutral2,
	right: Eye.Neutral2,
	muzzle: Muzzle.Blep,
};

const EXCITED: Expression = {
	...defaultExpression,
	left: Eye.Neutral2,
	right: Eye.Neutral2,
	muzzle: Muzzle.SmileOpen,
};

const MENO = 'DBWIzP8imd08//D19fVazSjcwf1GhLNEiMxENSovLy/NsIdJQDnGqYBiSztWQTM6LychEnE/KRX///9WPeE1HbSpBUEIIASwgEIAAAAAbIAgCFMY34AHAAjwgCMRQCVLY38IDhAAwmFBz4fAIxjKM6SjGlaxjWtYgjGI';

@Component({
	selector: 'visit-pt-pony',
	templateUrl: 'visit-pt-pony.pug',
})
export class VisitPTPony implements OnInit, OnDestroy {
	@ViewChild('characterPreview', { static: true }) characterPreview!: CharacterPreview;
	@Input() scale = 3;
	pony = decompressPonyString(MENO);
	state = defaultPonyState();
	private expression?: Expression;
	private headAnimation?: HeadAnimation;
	private headTime = 0;
	private bodyAnimation?: BodyAnimation;
	private bodyTime = 0;
	private loop: FrameLoop;
	constructor(frameService: FrameService) {
		this.loop = frameService.create(delta => this.tick(delta));
	}
	ngOnInit() {
		this.loop.init();
	}
	ngOnDestroy() {
		this.loop.destroy();
	}
	select() {
		this.headTime = 0;
		this.bodyTime = 0;
		this.expression = EXCITED;
		this.bodyAnimation = Math.random() < 0.25 ? boop : stand;

		const headRandom = Math.random();
		if (headRandom < 0.5) {
			this.headAnimation = excite_meno;
		}
		else if (headRandom < 0.8) {
			this.headAnimation = happy_tongue_meno;
		}
		else {
			this.headAnimation = happy_tongue_meno_2;
		}
	}
	reset() {
		this.expression = undefined;
	}
	private tick(delta: number) {
		this.headTime += delta;
		this.bodyTime += delta;

		if (this.headAnimation) {
			const frame = Math.floor(this.headTime * this.headAnimation.fps);

			if (frame >= this.headAnimation.frames.length && !this.headAnimation.loop) {
				this.headAnimation = undefined;
				this.state.headAnimation = undefined;
				this.state.headAnimationFrame = 0;
				this.characterPreview.blink();
			} else {
				this.state.headAnimation = this.headAnimation;
				this.state.headAnimationFrame = frame % this.headAnimation.frames.length;
			}
		} else {
			this.state.headAnimation = undefined;

			if (this.expression) {
				if (Math.random() < 0.01) {
					this.expression = undefined;
				}
			} else {
				if (Math.random() < 0.005) {
					this.expression = BLEP;
				}
			}
		}

		if (this.bodyAnimation) {
			const frame = Math.floor(this.bodyTime * this.bodyAnimation.fps * 0.75);

			if (frame >= this.bodyAnimation.frames.length && !this.bodyAnimation.loop) {
				this.bodyAnimation = undefined;
				this.state.animation = stand;
				this.state.animationFrame = 0;
			} else {
				this.state.animation = this.bodyAnimation;
				this.state.animationFrame = frame % this.bodyAnimation.frames.length;
			}
		}

		this.state.expression = this.expression;
	}
}
