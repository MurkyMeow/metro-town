import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AccountSettings, BrowserSettings, GraphicsQuality } from '../../../common/interfaces';
import { SettingsService } from '../../services/settingsService';
import {
	DEFAULT_CHATLOG_OPACITY, MAX_CHATLOG_RANGE, MIN_CHATLOG_RANGE, isChatlogRangeUnlimited, MAX_FILTER_WORDS_LENGTH
} from '../../../common/constants';
import { StorageService } from '../../services/storageService';
import { cloneDeep } from '../../../common/utils';
import { PonyTownGame } from '../../../client/game';
import { updateRangeIndicator, readFileAsText } from '../../../client/clientUtils';
import { faSlidersH, faCommentSlash, faGamepad, faImage, faDownload, faUpload, faComment } from '../../../client/icons';

@Component({
	selector: 'settings-modal',
	templateUrl: 'settings-modal.pug',
	styleUrls: ['settings-modal.scss'],
})
export class SettingsModal implements OnInit, OnDestroy {
	readonly maxChatlogRange = MAX_CHATLOG_RANGE;
	readonly minChatlogRange = MIN_CHATLOG_RANGE;
	readonly maxGraphicsQuality: number;
	readonly maxGraphicsQualityValue: GraphicsQuality;
	readonly gameIcon = faSlidersH;
	readonly chatIcon = faComment;
	readonly filtersIcon = faCommentSlash;
	readonly controlsIcon = faGamepad;
	readonly graphicsIcon = faImage;
	readonly exportIcon = faDownload;
	readonly importIcon = faUpload;
	@Output() close = new EventEmitter();
	account: AccountSettings = {};
	browser: BrowserSettings = {};
	accountBackup: AccountSettings = {};
	browserBackup: BrowserSettings = {};
	private done = false;
	private subscription?: Subscription;
	constructor(
		private settingsService: SettingsService,
		private storage: StorageService,
		private game: PonyTownGame,
	) {
		if (game.webgl) {
			if (game.webgl.failedFBO) {
				this.maxGraphicsQuality = 0;
				this.maxGraphicsQualityValue = GraphicsQuality.Low;
			}
			else if (game.webgl.failedDepthBuffer) {
				this.maxGraphicsQuality = 1;
				this.maxGraphicsQualityValue = GraphicsQuality.Medium;
			}
			else {
				this.maxGraphicsQuality = 2;
				this.maxGraphicsQualityValue = GraphicsQuality.High;
			}
		}
		else {
			this.maxGraphicsQuality = 2;
			this.maxGraphicsQualityValue = GraphicsQuality.High;
		}
	}
	get pane() {
		return this.storage.getItem('settings-modal-pane') || 'game';
	}
	set pane(value: string) {
		this.storage.setItem('settings-modal-pane', value);
	}
	get chatlogRangeText() {
		const range = this.account.chatlogRange;
		return isChatlogRangeUnlimited(range) ? 'entire screen' : `${range} tiles`;
	}
	get graphicsQualityText() {
		if (!this.game.webgl || (this.browser.graphicsQuality === undefined)) {
			return 'Undefined';
		}

		if (this.game.webgl.failedFBO || (this.browser.graphicsQuality === GraphicsQuality.Low)) {
			return 'Low';
		}
		else if (this.game.webgl.failedDepthBuffer || (this.browser.graphicsQuality === GraphicsQuality.Medium)) {
			return 'Medium';
		}
		else {
			return 'High';
		}
	}
	ngOnInit() {
		this.accountBackup = cloneDeep(this.settingsService.account);
		this.browserBackup = cloneDeep(this.settingsService.browser);
		this.account = this.settingsService.account;
		this.browser = this.settingsService.browser;
		this.setupDefaults();
		this.subscription = this.game.onLeft.subscribe(() => this.cancel());
	}
	ngOnDestroy() {
		this.finishChatlogRange();

		if (!this.done) {
			this.cancel();
		}

		this.subscription && this.subscription.unsubscribe();
	}
	reset() {
		this.account = this.settingsService.account = {};
		this.browser = this.settingsService.browser = {};
		this.setupDefaults();
	}
	cancel() {
		this.done = true;
		this.settingsService.account = this.accountBackup;
		this.settingsService.browser = this.browserBackup;
		this.close.emit();
	}
	ok() {
		if (this.account.filterWords) {
			let filter = this.account.filterWords;

			while (filter.length > MAX_FILTER_WORDS_LENGTH && /\s/.test(filter)) {
				filter = filter.trim().replace(/\s+\S+$/, '');
			}

			if (filter.length > MAX_FILTER_WORDS_LENGTH) {
				this.account.filterWords = '';
			} else {
				this.account.filterWords = filter;
			}
		}

		this.done = true;
		this.settingsService.saveAccountSettings(this.account);
		this.settingsService.saveBrowserSettings(this.browser);
		this.close.emit();
	}
	switchTimestamp(state?: string) {
		if (!state) this.browser.timestamp = undefined;
		else if (state === '12') this.browser.timestamp = '12';
		else if (state === '24') this.browser.timestamp = '24';
	}
	updateChatlogRange(range: number | undefined) {
		document.body.classList.add('translucent-modals');
		updateRangeIndicator(range, this.game);
	}
	finishChatlogRange() {
		document.body.classList.remove('translucent-modals');
		updateRangeIndicator(undefined, this.game);
	}
	private setupDefaults() {
		if (this.account.chatlogOpacity === undefined) {
			this.account.chatlogOpacity = DEFAULT_CHATLOG_OPACITY;
		}

		if (this.account.chatlogRange === undefined) {
			this.account.chatlogRange = MAX_CHATLOG_RANGE;
		}

		if (this.account.filterWords === undefined) {
			this.account.filterWords = '';
		}

		if (this.browser.graphicsQuality === undefined) {
			this.browser.graphicsQuality = this.maxGraphicsQualityValue;
		}
	}
	export() {
		const account = { ...this.account, actions: undefined };
		const browser = this.browser;
		const data = JSON.stringify({ account, browser });
		saveAs(new Blob([data], { type: 'text/plain;charset=utf-8' }), `pony-town-settings.json`);
	}
	async import(file: File | undefined) {
		if (file) {
			const text = await readFileAsText(file);
			const { account, browser } = JSON.parse(text);
			const actions = this.account.actions;
			Object.assign(this.account, { ...account, actions });
			Object.assign(this.browser, browser);
		}
	}
}
