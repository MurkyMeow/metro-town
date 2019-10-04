import { argv } from 'yargs';
import { ServerConfig } from '../common/adminInterfaces';

export interface AppConfig {
	title: string;
	twitterLink?: string;
	supporterLink?: string;
	discordLink?: string;
	contactEmail?: string;
	contactDiscord?: string;
	port: number;
	adminPort?: number;
	host: string;
	proxy?: number;
	noindex?: boolean;
	secret: string;
	token: string;
	local: string;
	adminLocal?: string;
	sw?: boolean;
	db: string;
	pg: any;
	rollbar?: {
		environment: string;
		clientToken: string;
		serverToken: string;
		gulpToken: string;
	};
	analytics?: {
		trackingID: string;
	};
	assetsPath?: string;
	season?: string;
	holiday?: string;
	oauth: { [key: string]: any };
	servers: ServerConfig[];
	facebookAppId?: string;
}

export interface AppPackage {
	name: string;
	version: string;
	description: string;
}

export interface AppArgs {
	port?: string;
	login?: boolean;
	admin?: boolean;
	standaloneadmin?: boolean;
	game?: string;
	superadmin?: string;
	users?: boolean;
	tools?: boolean;
	webpack?: boolean;
	local?: boolean;
	nocleanup?: boolean;
}

export const args = argv as AppArgs;
export const { version, description }: AppPackage = require('../../../package.json');
export const config: AppConfig = require('../../../config.json');

// append / to host if the server op forgot it
if (!config.host.endsWith('/')) {
	config.host += '/';
}

const INSECURE_RANDOM_VALUES = [
	'gfhfdshtrdhgedryhe4t3y5uwjthr',
	'sdlfgihsdor8ghor8dgdrgdegrdg',
	'<some_random_string_here>',
	'<some_other_random_string_here>',
];

if (!DEVELOPMENT && !TESTS &&
	(!config.secret || !config.token
	|| config.secret.length < 16
	|| config.token.length < 16
	|| config.secret === config.token
	|| INSECURE_RANDOM_VALUES.includes(config.secret)
	|| INSECURE_RANDOM_VALUES.includes(config.token))) {
	console.error(
`
================================================================================
                           WARNING! WARNING! WARNING!

Your config parameters token and secret appear to be insecure!
This is **VERY** insecure, as these values serve as authentication tokens for
internal APIs and session cookies. You **must** change these values in order to
prevent potential exploits.

To generate new values for these parameters, you can use the following command:
    node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

Exiting here, as the security of your application cannot be guaranteed...
================================================================================
`
	);

	process.exit(1);
}

const loginServer: ServerConfig = { id: 'login', filter: false, port: config.port } as any;
const adminServer: ServerConfig = { id: 'admin', filter: false, port: config.adminPort || config.port } as any;

export const gameServers = config.servers.filter(s => !s.hidden);

const allServers = [...gameServers, loginServer, adminServer];
allServers.forEach(s => s.flags = s.flags || {});
const serverId = args.game || (args.login ? 'login' : (args.admin ? 'admin' : allServers[0].id));

export const server = allServers.find(s => s.id === serverId) || allServers[0];
export const port = (args.port && parseInt(args.port, 10)) || server.port || config.port;
