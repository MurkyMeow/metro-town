export interface Credit {
	name: string;
	title: string;
	avatarIndex: number;
	links: string[];
}

export interface Contributor {
	name: string;
	links?: string[];
}

export interface Contributors {
	group: string;
	contributors: Contributor[];
}

// The Team
export const CREDITS: Credit[] = [
	// example:
	// {
	// 	name: 'Your name',
	// 	title: 'Your role on the team',
	// 	avatarIndex: 0, // place of the avatar in /assets/images/avatars.jpg
	// 	links: ['https://twitter.com/your_twitter_handle'],
	// },
	{
		name: 'Bytewave',
		title: 'Programmer / Moderator',
		avatarIndex: 0,
		links: ['https://twitter.com/BytewaveMLP', 'https://github.com/BytewaveMLP']
	},
	{
		name: 'CyberPon3',
		title: 'Programmer / Moderator',
		avatarIndex: 2,
		links: ['https://twitter.com/CyberPon3']
	},
	{
		name: 'Keupoz',
		title: 'Programmer',
		avatarIndex: 3,
		links: ['https://github.com/Keupoz']
	},
	{
		name: 'Luney',
		title: 'Programmer',
		avatarIndex: 5,
		links: ['https://twitter.com/luneythesnep', 'https://github.com/LunarMist']
	},
	{
		name: 'MysticBlare',
		title: 'Artist',
		avatarIndex: 1,
		links: ['https://twitter.com/MysticBlare']
	},
	{
		name: 'NotMyWing',
		title: 'Programmer / Moderator',
		avatarIndex: 4,
		links: ['https://twitter.com/NotMyWing', 'https://github.com/Neeve01']
	},
	{
		name: 'Stubenhocker',
		title: 'Programmer',
		avatarIndex: 6,
		links: ['https://github.com/Stubenhocker1399', 'https://twitter.com/Stubenhocker13']
	},
	{
		name: 'Sunberry',
		title: 'Moderator',
		avatarIndex: 9,
		links: ['https://twitter.com/Sunberreiy']
	},
	{
		name: 'Terncode',
		title: 'Programmer',
		avatarIndex: 7,
		links: ['https://twitter.com/terncode', 'https://github.com/Terncode']
	},
	{
		name: 'ZizzyDizzyMC',
		title: 'Server Host',
		avatarIndex: 8,
		links: ['https://twitter.com/ZizzyDizzyMC']
	}
];

export const CONTRIBUTORS: Contributors[] = [
	{
		group: 'Music Composers',
		contributors: [
			{ name: 'Wandering Artist', links: ['https://wanderingartist.bandcamp.com/', 'https://www.youtube.com/user/WanderingArtistMusic'] },
		],
	},
	{
		group: 'Programmers',
		contributors: [
			{ name: 'Industrialice' },
			{ name: 'Thorn Rose', links: ['https://github.com/Thorn-Rose'] },
		],
	},
	{
		group: 'Artists',
		contributors: [
			{ name: 'Shino', links: ['https://www.deviantart.com/shinodage'] },
			{ name: 'ChiraChan', links: ['https://www.deviantart.com/chiramii-chan', 'https://chirachan-art.tumblr.com/'] },
			{ name: 'Goodly', links: ['https://www.deviantart.com/goodlyay'] },
			{ name: 'TioRafaJP', links: ['https://www.deviantart.com/tiorafajp', 'https://www.youtube.com/user/RafaelJP2'] },
			{ name: 'ShareMyShipment', links: ['https://www.deviantart.com/sharemyshipment'] },
			{ name: 'Velenor' },
			{ name: 'Meno', links: ['https://twitter.com/menojar', 'https://www.deviantart.com/menojar'] },
			{ name: 'OtakuAP', links: ['https://www.deviantart.com/otakuap'] },
			{ name: 'Disastral' },
			{ name: 'CyberPon3', links: ['https://twitter.com/CyberPon3'] },
			{ name: 'Paulpeoples', links: ['https://www.deviantart.com/paulpeopless'] },
			{ name: 'Velvet-Frost', links: ['https://www.deviantart.com/velvet-frost'] },
			{ name: 'Jet7Wave', links: ['https://www.deviantart.com/jetwave'] },
			{ name: 'Lalieri', links: ['https://lalieri.tumblr.com/'] },
			{ name: 'Ruef-bae', links: ['https://www.deviantart.com/ruef-bae'] },
			{ name: 'Alchemist3rd' },
			{ name: 'Firecracker' },
			{ name: 'ZippySqrl', links: ['https://www.deviantart.com/zippysqrl'] },
			{ name: 'Karnel333' },
			{ name: 'Wellfugzee' },
			{ name: 'ScribblesHeart', links: ['https://www.deviantart.com/scribblesdesu'] },
			{ name: 'dsp2003', links: ['https://dsp2003.tumblr.com/', 'http://www.deviantart.com/dsp2003'] },
			{ name: 'Towmacow Waffles', links: ['https://www.deviantart.com/towmacowwaffles'] },
			{ name: 'OrchidPony', links: ['https://www.deviantart.com/orchidpony'] },
			{ name: 'Cherry Cerise', links: ['https://www.deviantart.com/cherryceriseart'] },
			{ name: 'RADIOstations', links: ['https://twitter.com/stagbeeble'] },
			{ name: 'Ultimate Fluff' },
			{ name: 'SC', links: ['https://0somecunt0.tumblr.com/tagged/sfw'] },
			{ name: 'SailorDolpin', links: ['https://vk.com/id324582699'] },
			{ name: 'Deeraw', links: ['https://www.deviantart.com/deerdraw', 'https://twitter.com/TheOnlyDeeraw'] },
			{ name: 'Aviivix' },
			{ name: 'SnowFl8keAnge1' },
			{ name: '3aHo3a', links: ['https://twitter.com/imnuclearimwild'] },
		],
	},
];
