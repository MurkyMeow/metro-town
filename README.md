# pixel.horse

A [Pony Town](https://pony.town) custom server

## Licensing

Pony Town's code is released to public domain. The art and music assets are released under the CC BY-NC 4.0 non-commercial license.
The assets cannot be used for commercial purposes in any way including crowdfunding such as Patreon or PayPal donations without permission.
See `LICENSE_CODE.txt`, `LICENSE_ART.txt` and `LICENSE_MUSIC.txt` files for definitions.
To discuss licensing, contact `ponytownhelp@gmail.com`.

## Prerequisites

* [Node.js](https://nodejs.org/download/release/v9.11.2/) (version 9)
* gulp `npm install -g gulp`
* MongoDB: [download link](https://www.mongodb.com/download-center/community) and [installation instructions](https://docs.mongodb.com/manual/administration/install-community/)
* [ImageMagick](https://imagemagick.org/script/download.php#windows) (optional, required for generating preview gifs in animation tool)
* [Git LFS](https://git-lfs.github.com/)

## Before you clone

**Ensure you have Git LFS installed before you clone the repo!** Git LFS is required to pull down the asset files the game uses, as storing them in normal Git would stuff up the tree pretty badly.

## Installation

Once you have the project cloned, open your terminal of choice (Command Prompt, bash, etc), navigate to the directory you cloned the project in, and run:

```bash
npm install
```

## Setting up Database

- Install MongoDB
- Start `mongo` from command line (you may need to go to `C:\Program Files\MongoDB\Server\4.0\bin` path on windows to run the command)
- Type `use your_database_name` to create database
- Type `db.new_collection.insert({ some_key: "some_value" })` to initialize database
- Type
  ```javascript
  db.createUser(
    {
      user: "your_username",
      pwd: "your_password",
      roles: [ { role: "readWrite", db: "your_database_name" } ]
    }
  )
  ```
  to create database user.
- Type `quit()` to exit mongo

## Setting up OAuth keys

Get OAuth keys for authentication platform of your choice (github, google, twitter, facebook, vkontakte)

### Github

- Go to https://github.com/settings/developers create new OAuth app.
- Set authorization callback URL to `http://<your domain>/auth/github/callback` or `http://localhost:8090/auth/github/callback` for localhost server.
- Add this to `oauth` field in your `config.json`

```json
"github": {
  "clientID": "<your_client_id>",
  "clientSecret": "<your_client_secret>"
}
```

### Twitter

- Go to https://developer.twitter.com/en/apps create new app.
- Set callback URL to `http://<your domain>/auth/twitter/callback` or `http://localhost:8090/auth/twitter/callback` for localhost server.
- Add this to `oauth` field in your `config.json`

```json
"twitter": {
  "consumerKey": "<your_consumer_key>",
  "consumerSecret": "<your_consumer_secret>"
}
```

### Google

- Go to https://console.developers.google.com/apis/dashboard create new project from dropdown at the top, go to credentials and create new entry.
- Add to Authorized JavaScript origins `http://<your domain>` or `http://localhost:8090/` for localhost server.
- Add to Authorized redirect URIs `http://<your domain>/auth/google/callback` or `http://localhost:8090/auth/google/callback` for localhost server.
- Add this to `oauth` field in your `config.json`

```json
"google": {
  "clientID": "<your_client_id>",
  "clientSecret": "<your_client_secret>"
}
```

### Facebook

- Go to https://developers.facebook.com/apps/ add a new app.
- Add "Facebook Login" product to your app
- Enable "Web OAuth Login"
- Add `https://<your domain>/auth/facebook/callback` to Valid OAuth Redirect URIs
- Add this to `oauth` field in your `config.json` (You can find App ID and App Secret in Settings > Basic section)

```json
"facebook": {
  "clientID": "<your_app_id>",
  "clientSecret": "<your_app_secret>",
  "graphApiVersion": "v3.1"
}
```

### VKontakte

- Go to https://vk.com/apps?act=manage and create new app
- Set Authorized redirect URI to `http://<your domain>/auth/vkontakte/callback` or `http://localhost:8090/auth/vkontakte/callback` for localhost server.
- Add this to `oauth` field in your `config.json`

```json
"vkontakte": {
  "clientID": "<your_app_id>",
  "clientSecret": "<secure_key>"
},
```

### Discord

- Go to https://discordapp.com/developers/applications/ and create a new app
- Navigate to the OAuth2 tab
- Add `http://<your domain>/auth/discord/callback` (or `http://localhost:8090/auth/discord/callback` for your localhost server) as a redirect URI
- Navigate back to the General Information tab
- Add this to the `oauth` field in your `config.json`

```json
"discord": {
  "clientID": "<your_client_id>",
  "clientSecret": "<your_client_secret>"
},
```

### Other

If you want to add other sign-in methods you need to find appropriate [passport](http://www.passportjs.org/) package and add it in `src/ts/server/oauth.ts` and add correct entry in `config.json`.

## Configuration

Add `config.json` file in root directory with following content. You can use `config-template.json` as a starting point for your own config. (do not include comments in your `config.json` file)

```javascript
{
  "title": "Pony Town",
  "discordLink": "https://discordapp.com/invite/<invite_code>", // optional
  "contactDiscord": "your_contact_discord#0000", // optional
  "twitterLink": "https://twitter.com/<twitter_name>", // optional
  "contactEmail": "<your_contact_email>",
  "port": 8090,
  "adminPort": 8091,
  "host": "http://localhost:8090/",
  "local": "localhost:8090",
  "adminLocal": "localhost:8091",
  "proxy": false, // set to true or to the ip of your proxy server if hosting pony town behind a proxy like nginx
  "secret": "<some_random_string_here>", // use a long and random string here, it's crucial for your security that nobody else knows this value
  "token": "<some_other_random_string_here>", // use a long and random string here, it's crucial for your security that nobody else knows this value
  "db": "mongodb://<username>:<password>@localhost:27017/<database_name>", // use values you used when setting up database
  "analytics": { // optional google analytics
    "trackingID": "<tracking_id>"
  },
  "facebookAppId": "<facebook_id>", // optional facebook app link
  "assetsPath": "<path_to_graphics_assets>", // optional, for asset generation
  "season": "spring", // optional, defaults to spring; season for all servers, seasons are "spring", "summer", "autumn" and "winter"
  "holiday": "none", // optional, defaults to none; holiday for all servers, holidays are "none", "halloween", "christmas", "stpatricks" and "easter"
  "oauth": {
		"google": {
			"clientID": "<CLIENT_ID_HERE>",
			"clientSecret": "<CLIENT_SECRET_HERE>"
		}
    // other oauth entries here
  },
  "servers": [
    {
      "id": "dev",
      "port": 8090,
      "path": "/s00/ws",
      "local": "localhost:8090",
      "name": "Dev server",
      "desc": "Development server",
      "season": "summer", // optional, defaults to summer, seasons are "spring", "summer", "autumn" and "winter"
      "holiday": "none", // optional, defaults to none, holidays are "none", "halloween", "christmas", "stpatricks" and "easter"
      "flag": "test", // optional flag ("test", "star" or space separated list of country flags)
      "flags": { // optional feature flags
        "test": true, // test server
        "editor": true, // in-game editor
      },
      "alert": "18+", // optional 18+ alert (also blocks underage players)
    },
  ]
}
```

### NOTE!

You **MUST** provide **unique**, **random** values for the `secret` and `token` fields of your config. It is **extremely dangerous** to leave these as default, as these values serve as authentication tokens for internal APIs and session cookies.

To generate new values for these parameters, you can use the following command:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

## Running

### Your first build

pixel.horse has modified the Pony Town archive such that compiled game assets are no longer included. To compile the game assets for the first time, you must use the following command, which will generate the necessary spritesheets and corresponding data **and** run a full production build of the site:

```bash
npm run build-sprites
npm start
```

**If you want to build sprites __only__** (useful if you want to develop the project before deployment), you can use:

```bash
gulp sprites
```

### Production environment

After your initial build (see above), you can use the following commands to generate a fresh production build of the site.

```bash
npm run build
npm start
```

**This will not update spritesheets**; for that, you must use `npm run build-sprites` as discussed previously, or run a [development build](#running-in-development) with the `--sprites` flag.

### Beta environment (with dev tools and in-development features)

```bash
npm run build-beta
node pony-town.js --login --admin --game --tools --beta
```

### Starting as multiple processes

```bash
node pony-town.js --login                    # login server
node pony-town.js --game main                # game server 1 ('main' has to match id from config.json)
node pony-town.js --game safe                # game server 2 ('safe' has to match id from config.json)
node pony-town.js --admin --standaloneadmin  # admin server
```

For these to work on the same URL, paths to game servers and admin server need to be bound to correct ports, using http proxy.

It is recommended to run processes with larger memory pool for large user bases (especially admin and game processes), example:

```bash
node --max_old_space_size=8192 pony-town.js --game main
```

### Recommended production server update procedure

1. Build everything
2. Issue a restart notice (from admin panel `<base_url>/admin/`)
3. Wait around 30s
4. Issue shutdown servers command (from admin panel `<base_url>/admin/`)
5. Wait for the user count to become 0
6. Restart the server

You do not need to shut down the server to build.

### Running in development (compiles faster and has extra tools)

```bash
npm run ts-watch    # terminal 1
npm run wds         # terminal 2
gulp dev            # terminal 3
gulp test           # terminal 4 (optional)
```

```bash
gulp dev --sprites  # run with generation of sprite sheets (use src/ts/tools/trigger.txt to trigger sprite generation without restarting gulp)
gulp dev --test     # run with tests
gulp dev --coverage # run with tests and code coverage
```

### Adding/removing roles

```bash
node cli.js --addrole <account_id> <role>   # roles: superadmin, admin, mod, dev
node cli.js --removerole <account_id> <role>
```

To setup superadmin role use following command

```bash
node cli.js --addrole <your_account_id> superadmin
```

### Additional tools

Admin panel is accessible at `<base_url>/admin/` (requires admin or superadmin role to access)
Tools are accessible at `<base_url>/tools/` (only available in dev mode or when started with --tools flag)

## Customization

- `package.json` - settings for title and description of the website
- `changelog.md` - your public updates
- `assets/images` - logos and team avatars
- `public/images` - additional logos
- `public` - privacy policy and terms of service
- `favicons` - icons
- `src/ts/common/constants.ts` - global settings
- `src/ts/server/maps/*` - maps configuration and setup
- `src/ts/server/start.ts` - world setup
- `src/ts/components/services/audio.ts` - adding/removing sound tracks
- `src/ts/client/credits` - credits and contributors
- `src/style/partials/_variables.scss` - page style configuration

### Custom map introduction

- `src/ts/common/entities.ts` - adding entities
- `src/ts/server/start.ts:35` - adding custom map to the world
- `src/ts/server/map/customMap.ts` - commented introduction to customizing maps

## Repo quirks and notes

### `sprites.ts`

Due to an issue with the build system, an old copy of `src/ts/generated/sprites.ts` is shipped with this repository. In order to prevent Git from seeing changes to this file from local builds and warning you about them when changing branches or pulling new changes, you can use the following command:

```bash
git update-index --assume-unchanged src/ts/generated/sprites.ts
```

Read more about it [here](https://stackoverflow.com/questions/1139762/ignore-files-that-have-already-been-committed-to-a-git-repository).

### Adding assets

1. Edit sprites (`assets-source` folder)
2. Compile sprites (`gulp dev --sprites`)
3. Add relevant code
4. (In some cases) compile sprites again

## Changelog

#### Pony.Town v0.55.2
- Optimized server performance
- Fixed various animation issues
- Fixed issues with kiss animation while turning head
- Added additional server performance stats to the admin panel
- Changed the button on admin panel that removes old events from 10min to 1day

### Pony.Town v0.55.0
- Added Kiss action
- Added being able to extinguish torches by sneezing
- Fixed house tool instructions saying "use mouse wheel" on mobile
- Fixed being able to open two actions menus in some cases
- Fixed actions menu button getting disabled by closing actions menu with the Escape key
- Fixed Yawn and Sneeze animations glitching with some eye styles
- Fixed :thinking: expression being inconsistent with /thinking command
- Fixed flying entities slowing down when flying over water
- Fixed jack-o'-lantern not turning off during the day
- Fixed some UI issues

- Added combining of head and body animations in the Animation tool
- Added flag to not allow closing mouths in Animation tool
- Fixed issue with gif preview in Animation tool
- Added a front leg frame
- Added Save button in account settings automatically redirecting to Home for new accounts
- Updated Help page to provide more workarounds for users who experience game showing black screen
- Updated contributor list

### Pony.Town v0.54.0
- Added a separate logo file for Visit Pony Town button
- Fixed users not being able to close actions menu in some cases
- Fixed torch flames having wrong outlines in some cases
- Fixed lights sometimes popping up through ponies
- Fixed lights being visible through pony eyeshadows
- Fixed lights of held items flickering for some users
- Updated credits

### Pony.Town v0.53.2
- Added changes from Pony.Town update v0.53.2 (https://pony.town/about)
- Updated readme with further instructions on updating server and adding assets
- Updated pony compression to handle up to 63 items per slot instead of 31
- Added Visit PT button
- Added disclaimer notice to Home and About
- Updated licenses
- Removed some unused assets
- Updated Contributor list
- Removed "Pony Town" from public pages

### Pony.Town v0.53.1
- Added option to import and export settings and actions on action bar
- Added different colors of cushions for house customization
- Fixed scroll wheel not working on Firefox
- Fixed not being able to place items behind interactive items like boxes or barrels
- Fixed issue with crystal light

### Initial release - Pony.Town v0.53.0
- Added custom servers
