import { Component } from '@angular/core';
import { emojis } from '../../../client/emoji';
import { faArrowLeft, faArrowRight, faArrowUp, faArrowDown } from '../../../client/icons';
import { contactEmail, contactDiscord } from '../../../client/data';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'help',
	templateUrl: 'help.pug',
	styleUrls: ['help.scss'],
})
export class Help {
	readonly leftIcon = faArrowLeft;
	readonly rightIcon = faArrowRight;
	readonly upIcon = faArrowUp;
	readonly downIcon = faArrowDown;
	readonly emotes = emojis.map(e => e.names[0]);
	readonly mac = /Macintosh/.test(navigator.userAgent);
	readonly contactEmail = contactEmail;
	readonly contactDiscord = contactDiscord;

	// allow scrolling to #issues and #rules fragments

	constructor(private route: ActivatedRoute) {}

	ngAfterViewInit() {
		this.route.fragment.subscribe(f => {
		  const element = document.querySelector("#" + f);
		  if (element) setTimeout(() => element.scrollIntoView(), 10);
		})
	}
}
