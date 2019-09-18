import { Component } from '@angular/core';
import { Model, getPonyTag } from '../../services/model';
import { defaultPonyState } from '../../../client/ponyHelpers';
import { GameService } from '../../services/gameService';
import { OAuthProvider, PonyObject } from '../../../common/interfaces';
import { stand } from '../../../client/ponyAnimations';

@Component({
	selector: 'home',
	templateUrl: 'home.pug',
	styleUrls: ['home.scss'],
})
export class Home {
	state = defaultPonyState();
	previewPony: PonyObject | undefined = undefined;
	error?: string;
	private animationTime = 0;
	private interval?: any;
	constructor(
		private gameService: GameService,
		private model: Model,
	) {
	}
	get authError() {
		return this.model.authError;
	}
	get accountAlert() {
		return this.model.accountAlert;
	}
	get canInstall() {
		return false;
	}
	get playing() {
		return this.gameService.playing;
	}
	get loading() {
		return this.model.loading || this.model.updating;
	}
	get account() {
		return this.model.account;
	}
	get pony() {
		return this.model.pony;
	}
	get previewInfo() {
		return this.previewPony ? this.previewPony.ponyInfo : this.pony.ponyInfo;
	}
	get previewName() {
		return this.previewPony ? this.previewPony.name : this.pony.name;
	}
	get previewTag() {
		return getPonyTag(this.previewPony || this.pony, this.account);
	}
	signIn(provider: OAuthProvider) {
		this.model.signIn(provider);
	}
	ngOnInit() {
		let last = Date.now();
		this.interval = setInterval(() => {
			const now = Date.now();
			this.update((now - last) / 1000);
			last = now;
		}, 1000 / 24);
	}
	ngOnDestroy() {
		clearInterval(this.interval);
	}
	update(delta: number) {
		this.animationTime += delta;
		const animation = stand;
		this.state.animation = animation;
		this.state.animationFrame = Math.floor(this.animationTime * animation.fps) % animation.frames.length;
	}
}
