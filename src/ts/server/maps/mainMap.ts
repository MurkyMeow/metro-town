import * as fs from 'fs';
import { sample, random } from 'lodash';
import { pathTo } from '../paths';
import { World } from '../world';
import { createServerMap, deserializeMap, snapshotTiles, setTile, lockTile, deserializeEntities } from '../serverMap';
import { TileType, Season, MapType, Holiday, ServerFlags, MapFlags } from '../../common/interfaces';
import { rect } from '../../common/rect';
import * as entities from '../../common/entities';
import {
	addSpawnPointIndicators
} from '../mapUtils';
import {
	give, createSign,
	boopLight
} from '../controllerUtils';
import { ServerEntity, IClient, ServerMap } from '../serverInterfaces';
import { GhostAnimation } from '../../common/entities';
import { isGift, unholdItem, getNextToyOrExtra } from '../playerUtils';
import { toInt, hasFlag } from '../../common/utils';
import { updateAccountState } from '../accountUtils';
import { saySystem } from '../chat';
import { tileHeight } from '../../common/constants';
import { updateEntityOptions, setEntityAnimation } from '../entityUtils';
import { toWorldX } from '../../common/positionUtils';
import { deserializeTiles } from '../../common/compress';
import { WallController } from '../controllers';

const mainMapData = JSON.parse(fs.readFileSync(pathTo('store', 'main.json'), 'utf8'));
const mainMapEntities = fs.readFileSync(pathTo('store', 'main.txt'), 'utf8');
const mainMapTiles = deserializeTiles(mainMapData.tiles);

function createCookieTable(x: number, y: number) {
	return entities.cookieTable(x, y + 0.5) as ServerEntity;
}

function createToyStash(x: number, y: number) {
	return [
		entities.giftPileSign(x, y - 0.1),
		createSign(x, y, 'Toy Stash', (_, client) => updateEntityOptions(client.pony, getNextToyOrExtra(client)), entities.sign),
	];
}

function donateGift(_: any, client: IClient) {
	if (client.account.state && client.account.state.gifts) {
		let count = 0;
		updateAccountState(client.account, state => state.gifts = count = Math.max(0, toInt(state.gifts) - 1));
		saySystem(client, `${count} 🎁`);
	}

	if (isGift(client.pony.options && client.pony.options.hold)) {
		unholdItem(client.pony);
	}
}

function donateCandy(_: any, client: IClient) {
	if (client.account.state && client.account.state.candies) {
		let count = 0;
		updateAccountState(client.account, state => state.candies = count = Math.max(0, toInt(state.candies) - 1));
		saySystem(client, `${count} 🍬`);
	}
}

function donateEgg(_: any, client: IClient) {
	if (client.account.state && client.account.state.eggs) {
		let count = 0;
		updateAccountState(client.account, state => state.eggs = count = Math.max(0, toInt(state.eggs) - 1));
		saySystem(client, `${count} 🥚`);
	}
}

function removeSeasonalObjects(world: World, map: ServerMap) {
	const remove: ServerEntity[] = [];

	for (const region of map.regions) {
		for (const entity of region.entities) {
			if (hasFlag(entity.serverFlags, ServerFlags.Seasonal)) {
				remove.push(entity);
			}
		}
	}

	for (const entity of remove) {
		world.removeEntity(entity, map);
	}
}

function addSeasonalObjects(world: World, map: ServerMap, season: Season, holiday: Holiday) {
	const isWinter = season === Season.Winter;
	const isAutumn = season === Season.Autumn;
	const isSpring = season === Season.Spring;
	const isSummer = season === Season.Summer;
	const isHalloween = holiday === Holiday.Halloween;
	const isChristmas = holiday === Holiday.Christmas;
	const isEaster = holiday === Holiday.Easter;

	function add(entity: ServerEntity) {
		entity.serverFlags! |= ServerFlags.Seasonal;
		return world.addEntity(entity, map);
	}

	function addEntities(entities: ServerEntity[]) {
		return entities.map(add);
	}

	function addHolly(x: number, y: number) {
		add(entities.holly(x, y + (1 / tileHeight)));
	}

	function addHollyDecoration(x: number, y: number, a = true, b = true, c = true, d = true) {
		if (isChristmas) {
			a && addHolly(x - 2.8, y);
			b && addHolly(x - 1, y);
			c && addHolly(x + 1, y);
			d && addHolly(x + 2.8, y);
		}
	}

	addHollyDecoration(65.00, 71.00, true, false, true, false);
	addHollyDecoration(64.00, 76.00);
	addHollyDecoration(55.00, 76.50, true, false);

	if (isSpring || isSummer) {
		add(entities.flowerPatch1(70.00, 55.00));
		add(entities.flowerPatch2(46.50, 78.00));
		add(entities.flowerPatch2(80.00, 49.50));
		add(entities.flowerPatch2(100.60, 75.50));
		add(entities.flowerPatch2(78.00, 92.00));
		add(entities.flowerPatch3(69.50, 69.00));
		add(entities.flowerPatch3(48.80, 82.00));
		add(entities.flowerPatch3(86.50, 53.50));
		add(entities.flowerPatch4(66.00, 61.00));
		add(entities.flowerPatch4(87.50, 63.50));
		add(entities.flowerPatch4(56.00, 89.70));
		add(entities.flowerPatch5(53.50, 68.00));
		add(entities.flowerPatch5(77.70, 96.00));
		add(entities.flowerPatch5(77.00, 71.30));
		add(entities.flowerPatch5(87.50, 69.00));
		add(entities.flowerPatch7(93.40, 65.70));
		add(entities.flowerPatch1(112.09, 64.63));
		add(entities.flowerPatch2(107.70, 53.77));
		add(entities.flowerPatch2(69.16, 107.00));
		add(entities.flowerPatch3(106.73, 94.79));
		add(entities.flowerPatch3(113.59, 61.96));
		add(entities.flowerPatch3(70.50, 104.90));
		add(entities.flowerPatch4(58.03, 112.92));
		add(entities.flowerPatch4(53.31, 99.88));
		add(entities.flowerPatch6(106.72, 93.46));
		add(entities.flowerPatch5(116.31, 50.94));

		add(entities.flowerPatch1(125.31, 148.25));
		add(entities.flowerPatch1(153.06, 133.58));
		add(entities.flowerPatch1(143.68, 87.20));
		add(entities.flowerPatch1(85.25, 150.75));
		add(entities.flowerPatch1(66.71, 139.75));

		add(entities.flowerPatch2(79.13, 148.92));
		add(entities.flowerPatch2(65.56, 126.83));
		add(entities.flowerPatch2(149.75, 147.42));
		add(entities.flowerPatch2(131.78, 87.12));

		add(entities.flowerPatch3(143.13, 151.50));
		add(entities.flowerPatch3(148.19, 131.58));
		add(entities.flowerPatch3(152.81, 95.42));
		add(entities.flowerPatch3(123.94, 83.00));
		add(entities.flowerPatch3(92.38, 156.08));
		add(entities.flowerPatch3(114.88, 134.08));
		add(entities.flowerPatch3(119.13, 154.67));
		add(entities.flowerPatch3(69.41, 133.00));
		add(entities.flowerPatch3(75.69, 154.33));

		add(entities.flowerPatch4(62.44, 131.25));
		add(entities.flowerPatch4(86.63, 146.58));
		add(entities.flowerPatch4(58.69, 150.83));
		add(entities.flowerPatch4(123.78, 155.08));
		add(entities.flowerPatch4(146.72, 153.25));
		add(entities.flowerPatch4(143.81, 95.75));
		add(entities.flowerPatch4(126.75, 85.92));

		add(entities.flowerPatch5(144.03, 148.25));
		add(entities.flowerPatch5(150.09, 134.08));
		add(entities.flowerPatch5(133.28, 91.08));
		add(entities.flowerPatch5(151.09, 97.83));
		add(entities.flowerPatch5(124.47, 85.33));
		add(entities.flowerPatch5(85.41, 157.08));
		add(entities.flowerPatch5(100.66, 147.75));
		add(entities.flowerPatch5(114.91, 132.50));
		add(entities.flowerPatch5(90.47, 132.08));
		add(entities.flowerPatch5(84.16, 148.67));
		add(entities.flowerPatch5(66.50, 133.25));
		add(entities.flowerPatch5(67.94, 138.67));
		add(entities.flowerPatch5(59.44, 153.25));
		add(entities.flowerPatch5(74.44, 156.33));

		add(entities.flowerPatch2(41.28, 96.54));
		add(entities.flowerPatch3(25.19, 88.21));
		add(entities.flowerPatch3(21.66, 109.17));
		add(entities.flowerPatch4(8.53, 102.63));
		add(entities.flowerPatch5(23.28, 112.21));
		add(entities.flowerPatch1(36.00, 126.46));
		add(entities.flowerPatch3(38.50, 123.92));
		add(entities.flowerPatch4(31.50, 126.58));
		add(entities.flowerPatch4(27.81, 122.46));
		add(entities.flowerPatch3(14.91, 140.08));
		add(entities.flowerPatch5(14.75, 137.88));
		add(entities.flowerPatch3(11.66, 152.75));
		add(entities.flowerPatch4(9.69, 150.92));
		add(entities.flowerPatch4(2.66, 117.96));
		add(entities.flowerPatch2(4.44, 113.21));
		add(entities.flowerPatch2(37.97, 64.63));
		add(entities.flowerPatch4(38.94, 62.25));
		add(entities.flowerPatch2(24.28, 61.46));
		add(entities.flowerPatch5(24.53, 60.42));
		add(entities.flowerPatch6(25.84, 66.04));
		add(entities.flowerPatch4(26.25, 45.54));
		add(entities.flowerPatch6(26.56, 43.75));
		add(entities.flowerPatch2(22.63, 24.88));
		add(entities.flowerPatch4(23.47, 21.96));
		add(entities.flowerPatch4(30.69, 14.63));
		add(entities.flowerPatch3(32.81, 16.42));
		add(entities.flowerPatch3(46.13, 4.79));
		add(entities.flowerPatch3(98.97, 10.46));
		add(entities.flowerPatch4(100.94, 44.96));
		add(entities.flowerPatch4(124.34, 43.25));
		add(entities.flowerPatch3(134.41, 45.88));
		add(entities.flowerPatch4(135.47, 27.33));
		add(entities.flowerPatch6(136.63, 29.92));
		add(entities.flowerPatch1(131.78, 4.50));
		add(entities.flowerPatch4(127.97, 4.67));
		add(entities.flowerPatch4(122.09, 28.42));
		add(entities.flowerPatch6(121.53, 30.96));
		add(entities.flowerPatch6(122.31, 41.63));
		add(entities.flowerPatch6(101.91, 47.17));
		add(entities.flowerPatch3(50.66, 39.42));
		add(entities.flowerPatch4(48.47, 38.00));
		add(entities.flowerPatch6(48.78, 41.46));
		add(entities.flowerPatch6(32.63, 46.13));
		add(entities.flowerPatch6(14.94, 55.08));
		add(entities.flowerPatch7(14.25, 56.79));

		// hill above orchard
		add(entities.flowerPatch1(81.56, 17.71));
		add(entities.flowerPatch1(72.44, 12.46));
		add(entities.flowerPatch2(80.38, 13.25));
		add(entities.flowerPatch3(74.09, 21.00));
		add(entities.flowerPatch3(75.25, 5.83));
		add(entities.flowerPatch3(85.31, 10.25));
		add(entities.flowerPatch4(80.25, 4.96));
		add(entities.flowerPatch4(77.38, 18.17));
		add(entities.flowerPatch4(64.22, 5.63));
		add(entities.flowerPatch5(73.69, 19.29));
		add(entities.flowerPatch5(90.22, 11.29));
		add(entities.flowerPatch5(77.34, 3.67));
		add(entities.flowerPatch5(64.88, 12.25));
		add(entities.flowerPatch6(70.34, 12.92));
		add(entities.flowerPatch6(85.75, 9.04));
		add(entities.flowerPatch6(82.91, 3.79));
		add(entities.flowerPatch6(61.38, 5.71));
		add(entities.flowerPatch7(73.63, 3.96));
		add(entities.flowerPatch7(74.53, 18.38));
		add(entities.flowerPatch7(67.19, 11.17));

		add(entities.cloverPatch4(43.94, 116.83));
		add(entities.cloverPatch4(51.00, 116.29));
		add(entities.cloverPatch4(60.47, 117.92));
		add(entities.cloverPatch4(58.16, 109.04));
		add(entities.cloverPatch3(60.66, 116.17));
		add(entities.cloverPatch3(57.13, 117.50));
		add(entities.cloverPatch3(58.06, 110.46));
		add(entities.cloverPatch5(48.88, 113.58));
		add(entities.cloverPatch5(64.38, 113.75));
		add(entities.cloverPatch5(41.97, 105.54));
		add(entities.cloverPatch4(52.97, 103.71));
		add(entities.cloverPatch3(79.19, 115.25));
		add(entities.cloverPatch3(89.06, 117.08));
		add(entities.cloverPatch4(83.25, 110.67));
		add(entities.cloverPatch5(82.50, 113.54));
		add(entities.cloverPatch6(85.84, 117.92));
		add(entities.cloverPatch3(103.38, 108.17));
		add(entities.cloverPatch3(110.06, 117.38));
		add(entities.cloverPatch5(113.78, 117.92));
		add(entities.cloverPatch5(105.91, 107.00));
		add(entities.cloverPatch5(104.47, 109.75));
		add(entities.cloverPatch4(117.47, 97.17));
		add(entities.cloverPatch6(89.69, 83.46));
		add(entities.cloverPatch6(108.50, 73.88));
		add(entities.cloverPatch3(99.00, 64.80));
		add(entities.cloverPatch5(97.78, 66.63));
		add(entities.cloverPatch5(90.38, 69.29));
		add(entities.cloverPatch6(88.81, 65.21));
		add(entities.cloverPatch6(80.59, 53.42));
		add(entities.cloverPatch6(115.03, 45.58));
		add(entities.cloverPatch7(84.66, 55.29));
		add(entities.cloverPatch7(116.16, 45.79));
		add(entities.cloverPatch5(81.72, 54.29));
		add(entities.cloverPatch5(43.53, 75.83));
		add(entities.cloverPatch7(46.38, 76.63));
		add(entities.cloverPatch3(69.98, 48.58));
		add(entities.cloverPatch3(73.11, 43.50));
		add(entities.cloverPatch5(67.27, 48.31));
		add(entities.cloverPatch5(74.25, 45.19));
		add(entities.cloverPatch6(69.94, 47.40));
		add(entities.cloverPatch7(89.36, 63.65));
		add(entities.clover1(72.00, 70.00));
		add(entities.cloverPatch4(55.38, 148.38));
		add(entities.cloverPatch4(42.91, 141.83));
		add(entities.cloverPatch5(64.66, 145.75));
		add(entities.cloverPatch5(48.78, 131.00));
		add(entities.cloverPatch6(46.34, 131.96));
		add(entities.cloverPatch6(91.16, 146.83));
		add(entities.cloverPatch4(103.41, 137.33));
		add(entities.cloverPatch6(134.22, 149.08));
		add(entities.cloverPatch6(133.78, 135.79));
		add(entities.cloverPatch3(151.78, 128.38));
		add(entities.cloverPatch4(156.84, 109.63));
		add(entities.cloverPatch4(123.19, 108.54));
		add(entities.cloverPatch3(152.09, 91.63));
		add(entities.cloverPatch3(126.94, 97.04));
		add(entities.cloverPatch7(149.22, 81.13));
		add(entities.cloverPatch6(157.34, 74.00));
	}

	if (isAutumn) {
		add(entities.leafpileStickRed(151.19, 98.60));
		add(entities.leaves5(150.11, 99.15));
		add(entities.leaves5(143.66, 105.88));
		add(entities.leaves4(149.91, 106.00));
		add(entities.leaves2(143.14, 100.50));
		add(entities.leaves1(67.00, 48.00));
		add(entities.leaves2(68.00, 45.00));
		add(entities.leaves3(61.20, 71.50));
		add(entities.leaves3(46.00, 46.00));
		add(entities.leaves3(86.00, 47.00));
		add(entities.leaves4(83.50, 64.00));
		add(entities.leaves4(88.50, 58.00));
		add(entities.leaves4(71.50, 47.00));
		add(entities.leaves4(45.00, 76.20));
		add(entities.leaves4(84.00, 55.50));
		add(entities.leaves5(82.00, 54.00));
		add(entities.leaves5(69.00, 53.00));
		add(entities.leaves5(42.50, 48.70));
		add(entities.leaves3(70.50, 70.50));
		add(entities.leaves5(53.00, 87.00));
		add(entities.leaves4(57.00, 89.00));
		add(entities.leaves4(117.28, 46.00));
		add(entities.leaves2(61.00, 86.00));
		add(entities.leaves3(66.00, 87.00));
		add(entities.leaves1(69.00, 87.50));
		add(entities.leaves2(72.00, 85.50));
		add(entities.leafpileStickOrange(71.00, 69.50));
		add(entities.leafpileSmallYellow(44.00, 45.50));
		add(entities.leafpileSmallOrange(64.00, 72.00));
		add(entities.leafpileStickOrange(67.50, 47.30));
		add(entities.leafpileStickYellow(84.50, 46.30));
		add(entities.leafpileMediumYellow(47.30, 75.50));
		add(entities.leafpileMediumRed(51.00, 89.00));
		add(entities.leafpileBigYellow(79.00, 54.50));
		add(entities.leafpileBigstickRed(45.00, 52.20));
		add(entities.leafpileBigstickRed(50.50, 88.00));
		add(entities.leafpileSmallOrange(66.40, 58.00));
		add(entities.leafpileBigstickOrange(66.50, 69.80));
		add(entities.leafpileStickOrange(67.50, 71.60));
		add(entities.leafpileSmallOrange(67.00, 70.50));
		add(entities.leafpileSmallYellow(91.00, 95.70));
		add(entities.leafpileBigYellow(84.00, 86.30));
		add(entities.leafpileBigRed(94.00, 91.40));
		add(entities.leafpileBigYellow(76.00, 96.00));
		add(entities.leafpileMediumYellow(77.50, 97.50));
		add(entities.leafpileBigstickRed(85.80, 74.00));
		add(entities.leafpileMediumOrange(87.00, 75.50));
		add(entities.leafpileMediumAltOrange(89.00, 83.50));
		add(entities.leafpileMediumRed(80.00, 92.50));
		add(entities.leafpileSmallOrange(80.00, 84.80));
		add(entities.leaves1(85.00, 90.00));
		add(entities.leaves2(89.00, 95.00));
		add(entities.leaves3(92.00, 93.00));
		add(entities.leaves4(95.00, 88.00));
		add(entities.leaves5(90.00, 85.00));
		add(entities.leaves1(93.00, 77.00));
		add(entities.leaves2(86.00, 83.00));
		add(entities.leaves3(77.00, 82.00));
		add(entities.leaves4(75.00, 84.00));
		add(entities.leaves5(77.00, 91.00));
		add(entities.leaves1(84.00, 92.00));
		add(entities.leaves2(83.00, 97.00));
		add(entities.leaves3(89.00, 95.00));
		add(entities.leaves4(95.00, 94.00));
		add(entities.leaves5(97.00, 88.00));
		add(entities.leaves1(75.00, 81.00));
		add(entities.leaves2(79.00, 95.00));
		add(entities.leaves1(79.00, 77.00));
		add(entities.leaves2(83.00, 73.00));
		add(entities.leaves3(87.00, 71.00));
		add(entities.leaves4(98.00, 73.00));
		add(entities.leafpileBigYellow(96.25, 103.29));
		add(entities.leafpileBigstickYellow(127.69, 95.46));
		add(entities.leafpileBigOrange(118.63, 116.04));
		add(entities.leafpileBigYellow(133.50, 135.38));
		add(entities.leafpileBigRed(118.06, 136.38));
		add(entities.leafpileBigOrange(143.25, 84.21));
		add(entities.leafpileBigstickRed(89.69, 114.71));
		add(entities.leafpileMediumRed(83.19, 112.88));
		add(entities.leafpileMediumOrange(110.81, 126.13));
		add(entities.leafpileMediumYellow(121.81, 137.21));
		add(entities.leafpileMediumRed(137.50, 131.71));
		add(entities.leafpileMediumOrange(123.69, 97.96));
		add(entities.leafpileMediumYellow(109.75, 81.29));
		add(entities.leaves5(101.16, 112.71));
		add(entities.leaves5(152.19, 91.21));
		add(entities.leaves5(100.06, 83.79));
		add(entities.leaves5(151.31, 125.46));
		add(entities.leaves5(147.19, 116.13));
		add(entities.leaves5(141.63, 135.04));
		add(entities.leaves4(115.38, 127.29));
		add(entities.leaves4(143.69, 133.38));
		add(entities.leaves4(148.56, 118.88));
		add(entities.leaves4(150.44, 93.88));
		add(entities.leaves4(107.25, 86.04));
		add(entities.leaves4(122.88, 108.38));
		add(entities.leaves3(153.25, 94.96));
		add(entities.leaves3(156.44, 108.96));
		add(entities.leaves3(142.63, 134.71));
		add(entities.leaves3(151.44, 131.46));
		add(entities.leaves3(101.50, 114.71));
		add(entities.leaves3(102.50, 111.46));
		add(entities.leaves3(116.50, 128.79));
		add(entities.leaves3(107.06, 84.96));
		add(entities.leaves3(122.63, 110.46));
		add(entities.leaves3(132.94, 105.29));
		add(entities.leaves2(148.88, 82.13));
		add(entities.leaves2(109.38, 85.04));
		add(entities.leaves2(103.81, 113.29));
		add(entities.leaves2(130.06, 94.63));
		add(entities.leaves2(120.56, 106.79));
		add(entities.leaves2(148.19, 120.54));
		add(entities.leaves2(142.00, 137.13));
		add(entities.leaves2(152.81, 132.38));
		add(entities.leaves1(157.69, 88.71));
		add(entities.leaves1(149.69, 80.13));
		add(entities.leaves1(105.50, 84.21));
		add(entities.leaves1(108.63, 113.38));
		add(entities.leaves1(116.81, 116.79));
		add(entities.leaves1(117.50, 128.46));

		add(entities.leaves5(65.09, 24.92));
		add(entities.leaves5(42.56, 22.00));
		add(entities.leaves5(45.13, 28.96));
		add(entities.leaves5(71.13, 32.71));
		add(entities.leaves4(62.31, 32.54));
		add(entities.leaves3(41.78, 28.50));
		add(entities.leaves3(63.97, 24.17));
		add(entities.leaves2(66.75, 29.21));
		add(entities.leaves2(68.91, 31.42));
		add(entities.leaves2(59.72, 43.71));
		add(entities.leaves1(61.00, 42.75));
		add(entities.leaves1(47.53, 28.92));
		add(entities.leaves1(41.00, 25.04));
		add(entities.leaves3(66.09, 22.00));
		add(entities.leaves3(72.25, 21.00));
		add(entities.leaves4(69.91, 20.50));
		add(entities.leaves2(46.09, 43.88));
		add(entities.leafpileMediumRed(43.31, 29.25));
		add(entities.leafpileStickYellow(66.63, 27.75));
		add(entities.leafpileMediumYellow(62.44, 16.54));
		add(entities.leaves3(56.81, 17.17));
		add(entities.leaves1(50.16, 31.04));
		add(entities.leafpileBigYellow(32.69, 69.21));
		add(entities.leafpileMediumAltYellow(12.31, 63.63));
		add(entities.leafpileSmallOrange(24.16, 78.67));
		add(entities.leafpileStickYellow(11.88, 64.33));
		add(entities.leaves5(30.59, 66.50));
		add(entities.leaves5(32.41, 54.00));
		add(entities.leaves5(12.34, 61.67));
		add(entities.leaves4(25.91, 77.17));
		add(entities.leaves4(22.81, 66.79));
		add(entities.leaves4(9.94, 57.79));
		add(entities.leaves3(29.69, 54.54));
		add(entities.leaves3(28.97, 64.92));
		add(entities.leaves3(24.41, 79.54));
		add(entities.leaves3(10.97, 61.04));
		add(entities.leaves2(24.94, 67.25));
		add(entities.leaves2(34.81, 68.46));
		add(entities.leaves2(32.13, 56.08));
		add(entities.leaves2(10.97, 63.83));
		add(entities.leaves2(29.03, 77.38));
		add(entities.leaves2(16.09, 48.46));
		add(entities.leaves4(10.75, 46.75));
		add(entities.leaves1(8.53, 59.79));
		add(entities.leaves1(28.75, 66.67));
		add(entities.leaves1(29.97, 51.79));
		add(entities.leaves1(14.47, 65.58));
		add(entities.leaves1(31.38, 78.63));
		add(entities.leafpileBigOrange(23.44, 36.88));
		add(entities.leafpileMediumAltRed(13.09, 45.21));
		add(entities.leafpileMediumYellow(31.22, 25.71));
		add(entities.leafpileStickYellow(26.00, 26.13));
		add(entities.leafpileSmallOrange(20.75, 19.58));
		add(entities.leaves5(24.03, 38.38));
		add(entities.leaves5(29.88, 38.88));
		add(entities.leaves5(28.16, 22.50));
		add(entities.leaves5(24.94, 16.75));
		add(entities.leaves4(12.78, 42.71));
		add(entities.leaves4(26.53, 36.63));
		add(entities.leaves4(21.34, 20.21));
		add(entities.leaves4(26.84, 26.83));
		add(entities.leaves3(28.19, 43.67));
		add(entities.leaves3(28.94, 42.04));
		add(entities.leaves3(8.81, 47.42));
		add(entities.leaves3(24.50, 20.00));
		add(entities.leaves2(32.19, 35.04));
		add(entities.leaves2(30.81, 23.54));
		add(entities.leaves2(24.63, 20.63));
		add(entities.leaves2(39.19, 15.42));
		add(entities.leaves2(15.47, 46.88));
		add(entities.leafpileSmallYellow(30.19, 40.88));
		add(entities.leafpileBigRed(11.22, 9.63));
		add(entities.leafpileMediumAltYellow(38.22, 7.71));
		add(entities.leafpileStickRed(44.44, 6.25));
		add(entities.leafpileSmallOrange(25.31, 8.46));
		add(entities.leaves5(20.84, 6.17));
		add(entities.leaves5(43.78, 6.04));
		add(entities.leaves4(9.06, 7.88));
		add(entities.leaves4(38.94, 5.75));
		add(entities.leaves4(40.34, 13.96));
		add(entities.leaves3(42.78, 15.04));
		add(entities.leaves3(22.81, 8.50));
		add(entities.leaves3(13.06, 9.71));
		add(entities.leaves2(25.25, 6.83));
		add(entities.leaves2(8.44, 5.50));
		add(entities.leaves1(9.16, 5.17));
		add(entities.leaves1(20.44, 5.21));
		add(entities.leaves1(33.75, 22.92));
		add(entities.leaves1(29.09, 21.21));
		add(entities.leaves1(42.03, 5.17));
		add(entities.leafpileMediumAltOrange(59.41, 5.83));
		add(entities.leafpileMediumAltYellow(90.59, 3.33));
		add(entities.leafpileStickRed(75.69, 5.67));
		add(entities.leafpileSmallOrange(70.53, 23.00));
		add(entities.leaves5(84.19, 21.67));
		add(entities.leaves5(77.75, 5.25));
		add(entities.leaves4(75.16, 3.92));
		add(entities.leaves4(76.31, 15.38));
		add(entities.leaves3(87.00, 20.79));
		add(entities.leaves3(76.91, 14.33));
		add(entities.leaves3(89.41, 4.63));
		add(entities.leaves3(71.38, 6.08));
		add(entities.leaves2(71.50, 7.08));
		add(entities.leaves2(83.16, 23.71));
		add(entities.leaves2(88.84, 2.71));
		add(entities.leaves1(84.00, 23.88));
		add(entities.leaves1(75.03, 16.58));
		add(entities.leaves1(87.81, 4.71));
		add(entities.leaves1(91.88, 2.29));
		add(entities.leaves1(73.13, 8.08));
		add(entities.leaves1(72.03, 23.00));
		add(entities.leafpileStickRed(84.03, 36.21));
		add(entities.leafpileSmallYellow(82.78, 30.21));
		add(entities.leaves5(81.00, 32.67));
		add(entities.leaves5(87.53, 34.88));
		add(entities.leaves4(87.78, 37.00));
		add(entities.leaves4(79.47, 35.29));
		add(entities.leaves4(87.69, 29.83));
		add(entities.leaves3(78.34, 36.75));
		add(entities.leaves3(73.16, 35.21));
		add(entities.leaves3(85.66, 33.13));
		add(entities.leaves2(82.81, 36.13));
		add(entities.leaves2(83.94, 28.75));
		add(entities.leaves2(81.94, 29.71));
		add(entities.leaves2(87.00, 29.50));
		add(entities.leaves1(83.81, 30.38));
		add(entities.leaves1(85.38, 37.54));
		add(entities.leaves1(84.44, 37.00));
		add(entities.leaves1(82.34, 20.67));
		add(entities.leaves5(62.47, 5.17));
		add(entities.leaves4(58.72, 6.75));
		add(entities.leaves2(61.34, 3.29));
		add(entities.leaves1(63.25, 5.17));
		add(entities.leaves2(64.00, 2.79));
		add(entities.leafpileMediumYellow(107.56, 35.00));
		add(entities.leafpileStickYellow(115.25, 22.21));
		add(entities.leafpileBigYellow(119.63, 6.58));
		add(entities.leafpileSmallYellow(105.16, 6.21));
		add(entities.leafpileStickYellow(118.34, 33.83));
		add(entities.leaves5(108.16, 32.17));
		add(entities.leaves5(106.63, 21.54));
		add(entities.leaves5(123.50, 9.67));
		add(entities.leaves5(127.22, 34.83));
		add(entities.leaves4(119.25, 7.67));
		add(entities.leaves4(117.25, 8.50));
		add(entities.leaves4(99.06, 37.79));
		add(entities.leaves4(103.13, 19.50));
		add(entities.leaves4(102.75, 4.29));
		add(entities.leaves3(109.03, 24.79));
		add(entities.leaves3(100.38, 21.04));
		add(entities.leaves3(97.16, 36.79));
		add(entities.leaves3(107.97, 9.58));
		add(entities.leaves3(103.78, 7.21));
		add(entities.leaves3(125.94, 12.38));
		add(entities.leaves3(123.09, 12.08));
		add(entities.leaves3(117.41, 34.42));
		add(entities.leaves3(127.53, 38.17));
		add(entities.leaves2(115.56, 34.75));
		add(entities.leaves2(109.88, 33.42));
		add(entities.leaves2(108.41, 25.54));
		add(entities.leaves2(113.69, 21.25));
		add(entities.leaves2(116.34, 7.29));
		add(entities.leaves2(109.38, 7.79));
		add(entities.leaves2(99.69, 5.67));
		add(entities.leaves2(100.88, 19.29));
		add(entities.leaves2(103.63, 35.42));
		add(entities.leaves2(123.16, 36.71));
		add(entities.leaves1(115.16, 20.00));
		add(entities.leaves1(114.69, 22.75));
		add(entities.leaves1(106.69, 24.67));
		add(entities.leaves1(107.91, 8.17));
		add(entities.leaves1(98.56, 5.67));
		add(entities.leaves1(121.91, 6.42));
		add(entities.leaves1(121.84, 9.00));
		add(entities.leaves1(124.28, 13.38));
		add(entities.leaves1(129.13, 37.21));
		add(entities.leaves1(100.31, 36.67));
		add(entities.leaves1(103.75, 23.79));
		add(entities.leaves3(104.19, 15.67));
		add(entities.leaves2(104.00, 17.63));
		add(entities.leafpileBigOrange(137.00, 24.29));
		add(entities.leafpileMediumAltYellow(150.91, 9.96));
		add(entities.leafpileStickYellow(138.81, 9.75));
		add(entities.leaves5(153.50, 23.21));
		add(entities.leaves5(151.94, 5.50));
		add(entities.leaves5(136.25, 3.79));
		add(entities.leaves4(136.75, 8.54));
		add(entities.leaves4(150.34, 12.29));
		add(entities.leaves3(141.63, 8.67));
		add(entities.leaves3(139.16, 23.92));
		add(entities.leaves2(141.03, 22.71));
		add(entities.leaves2(137.41, 25.92));
		add(entities.leaves2(155.00, 26.13));
		add(entities.leaves2(148.31, 11.00));
		add(entities.leaves3(139.63, 2.50));
		add(entities.leaves1(137.13, 26.92));
		add(entities.leaves1(156.41, 26.67));
		add(entities.leaves1(148.88, 12.33));
		add(entities.leaves1(152.66, 7.13));
		add(entities.leaves4(155.44, 6.29));
		add(entities.leaves4(138.94, 5.00));
		add(entities.leaves3(139.19, 10.50));
		add(entities.leaves3(141.06, 25.46));
		add(entities.leaves1(140.13, 27.13));
		add(entities.leaves1(153.84, 22.63));
		add(entities.leafpileStickRed(141.97, 24.58));
		add(entities.leaves1(115.78, 44.00));
		add(entities.leaves2(117.47, 43.38));
		add(entities.leaves3(103.44, 44.88));
		add(entities.leaves2(102.97, 46.21));
		add(entities.leaves1(104.03, 46.50));
		add(entities.leaves4(97.44, 64.04));
		add(entities.leaves2(96.56, 62.67));
		add(entities.leaves3(118.56, 69.04));
		add(entities.leaves2(116.56, 69.13));
		add(entities.leaves1(117.59, 68.46));
		add(entities.leaves1(119.34, 70.96));
		add(entities.leaves2(87.13, 44.96));
		add(entities.leaves2(83.31, 53.04));
		add(entities.leaves5(155.84, 73.50));
		add(entities.leaves4(156.66, 75.67));
		add(entities.leaves1(154.56, 75.88));
		add(entities.leaves4(148.13, 80.63));
		add(entities.leaves2(147.16, 79.13));
		add(entities.leaves2(139.81, 83.63));
		add(entities.leaves3(141.75, 85.67));
		add(entities.leaves1(141.19, 84.75));
		add(entities.leaves1(133.78, 67.58));
		add(entities.leaves2(134.66, 67.67));
		add(entities.leaves3(136.22, 66.25));
		add(entities.leaves1(135.81, 67.83));
		add(entities.leaves1(142.66, 86.50));
		add(entities.leaves1(157.56, 77.25));
		add(entities.leaves4(151.13, 87.50));
		add(entities.leaves2(150.66, 86.21));
		add(entities.leaves2(158.03, 85.54));
		add(entities.leaves4(144.44, 94.21));
		add(entities.leaves4(127.34, 92.50));
		add(entities.leaves2(126.97, 91.79));
		add(entities.leaves2(131.22, 95.79));
		add(entities.leaves1(125.72, 99.46));
		add(entities.leaves1(125.13, 108.04));
		add(entities.leaves1(155.22, 106.42));
		add(entities.leaves2(152.72, 99.21));
		add(entities.leaves2(147.91, 95.67));
		add(entities.leaves2(132.94, 107.50));
		add(entities.leaves3(131.41, 149.21));
		add(entities.leaves2(131.09, 148.13));
		add(entities.leaves1(131.72, 147.54));
		add(entities.leaves4(134.91, 148.83));
		add(entities.leaves4(137.22, 137.63));
		add(entities.leaves4(110.41, 130.33));
		add(entities.leaves4(118.78, 138.54));
		add(entities.leaves2(116.84, 137.79));
		add(entities.leaves2(112.13, 130.17));
		add(entities.leaves3(25.44, 84.75));
		add(entities.leaves1(26.38, 83.79));
		add(entities.leaves4(86.25, 114.58));
		add(entities.leaves5(89.63, 117.63));
		add(entities.leaves2(86.25, 117.00));
		add(entities.leaves1(84.25, 117.21));
		add(entities.leaves5(41.75, 82.58));
		add(entities.leaves2(38.91, 80.96));
		add(entities.leaves1(40.78, 84.29));
		add(entities.leaves3(40.75, 81.38));
	}

	function addSnowpony(x: number, y: number, type: number) {
		const snowpony = entities.snowponies[type - 1];
		const entity = add(snowpony(x, y + 0.5));
		lockTile(map, entity.x - 0.5, entity.y);
		lockTile(map, entity.x + 0.5, entity.y);
	}

	function addSnowPile(entity: ServerEntity) {
		add(entity);
		lockTile(map, entity.x - 0.5, entity.y);
		lockTile(map, entity.x + 0.5, entity.y);

		if (
			entity.type === entities.snowPileSmall.type ||
			entity.type === entities.snowPileMedium.type ||
			entity.type === entities.snowPileBig.type
		) {
			lockTile(map, entity.x - 0.5, entity.y - 1);
			lockTile(map, entity.x + 0.5, entity.y - 1);
		}

		if (
			entity.type === entities.snowPileMedium.type ||
			entity.type === entities.snowPileBig.type
		) {
			lockTile(map, entity.x - 1, entity.y);
			lockTile(map, entity.x - 0.5, entity.y + 1);
			lockTile(map, entity.x + 0.5, entity.y + 1);
		}

		if (entity.type === entities.snowPileBig.type) {
			lockTile(map, entity.x + 1, entity.y);
			lockTile(map, entity.x - 1.5, entity.y);
			lockTile(map, entity.x - 1, entity.y + 1);
			lockTile(map, entity.x + 1, entity.y + 1);
		}
	}

	if (isWinter) {
		addSnowpony(44.00, 57.00, 1);
		addSnowpony(65.00, 64.00, 1);
		addSnowpony(68.00, 65.00, 2);
		addSnowpony(84.00, 56.00, 2);
		addSnowpony(67.00, 82.00, 1);
		addSnowpony(59.00, 87.00, 2);
		addSnowpony(85.19, 152.67, 3);
		addSnowpony(86.16, 153.04, 6);
		addSnowpony(86.09, 122.83, 4);
		addSnowpony(115.09, 109.13, 5);
		addSnowpony(108.31, 128.29, 3);
		addSnowpony(88.44, 104.71, 7);
		addSnowpony(106.50, 86.13, 9);
		addSnowpony(107.31, 86.67, 8);
		addSnowpony(87.88, 92.33, 5);
		addSnowpony(107.50, 58.83, 1);
		addSnowpony(85.09, 56.92, 1);
		addSnowpony(83.38, 57.25, 6);
		addSnowpony(66.03, 83.13, 7);
		addSnowpony(51.69, 102.38, 1);
		addSnowpony(69.41, 112.50, 1);
		addSnowpony(67.84, 111.17, 4);
		addSnowpony(53.69, 133.33, 9);
		addSnowpony(59.75, 119.79, 6);
		addSnowpony(65.03, 156.46, 2);
		addSnowpony(49.13, 148.38, 3);
		addSnowpony(119.19, 149.96, 3);
		addSnowpony(136.06, 156.00, 7);
		addSnowpony(141.22, 130.92, 5);
		addSnowpony(116.06, 136.58, 2);
		addSnowpony(147.50, 101.04, 4);
		addSnowpony(138.91, 97.92, 3);
		addSnowpony(125.50, 88.75, 2);
		addSnowpony(137.13, 67.50, 7);
		addSnowpony(115.13, 65.88, 2);
		addSnowpony(135.53, 44.33, 2);
		addSnowpony(153.34, 51.00, 5);
		addSnowpony(156.78, 60.08, 3);
		addSnowpony(116.88, 46.79, 8);
		addSnowpony(123.56, 53.67, 3);
		addSnowpony(100.56, 44.75, 4);
		addSnowpony(156.31, 124.88, 3);
		addSnowpony(149.50, 150.00, 6);
		addSnowpony(54.41, 132.83, 8);

		addSnowpony(29.69, 67.63, 1);
		addSnowpony(26.72, 44.42, 2);
		addSnowpony(23.22, 26.04, 3);
		addSnowpony(20.97, 27.21, 4);
		addSnowpony(12.97, 14.71, 5);
		addSnowpony(37.81, 28.21, 6);
		addSnowpony(50.38, 4.00, 7);
		addSnowpony(81.78, 18.00, 8);
		addSnowpony(80.00, 19.50, 1);
		addSnowpony(84.25, 3.08, 2);
		addSnowpony(97.19, 21.25, 3);
		addSnowpony(86.47, 38.42, 4);
		addSnowpony(122.47, 27.42, 5);
		addSnowpony(133.44, 7.54, 6);
		addSnowpony(130.31, 9.04, 7);
		addSnowpony(143.41, 19.42, 8);
		addSnowpony(20.63, 78.13, 1);
		addSnowpony(25.25, 90.63, 2);
		addSnowpony(27.56, 102.08, 3);
		addSnowpony(22.19, 109.83, 4);
		addSnowpony(5.72, 113.42, 5);
		addSnowpony(2.19, 116.75, 6);
		addSnowpony(13.75, 138.71, 7);
		addSnowpony(3.50, 150.63, 8);
		addSnowpony(35.09, 151.63, 1);
		addSnowpony(37.75, 123.75, 2);

		addSnowPile(entities.snowPileBig(67.06, 78.46));
		addSnowPile(entities.snowPileMedium(65.25, 77.21));
		addSnowPile(entities.snowPileSmall(61.13, 70.08));
		addSnowPile(entities.snowPileSmall(68.44, 71.25));
		addSnowPile(entities.snowPileBig(74.84, 94.58));
		addSnowPile(entities.snowPileSmall(76.56, 95.50));
		addSnowPile(entities.snowPileBig(52.97, 60.04));
		addSnowPile(entities.snowPileBig(80.63, 54.29));
		addSnowPile(entities.snowPileSmall(82.94, 65.04));
		addSnowPile(entities.snowPileBig(117.19, 80.38));
		addSnowPile(entities.snowPileSmall(122.19, 83.38));
		addSnowPile(entities.snowPileSmall(135.81, 66.58));
		addSnowPile(entities.snowPileBig(150.25, 99.42));
		addSnowPile(entities.snowPileMedium(143.50, 106.67));
		addSnowPile(entities.snowPileSmall(148.28, 98.88));
		addSnowPile(entities.snowPileMedium(115.75, 98.04));
		addSnowPile(entities.snowPileMedium(139.81, 85.25));
		addSnowPile(entities.snowPileMedium(137.53, 98.79));
		addSnowPile(entities.snowPileMedium(115.50, 45.79));
		addSnowPile(entities.snowPileBig(151.88, 138.79));
		addSnowPile(entities.snowPileSmall(150.09, 138.00));
		addSnowPile(entities.snowPileSmall(140.28, 144.50));
		addSnowPile(entities.snowPileSmall(102.56, 147.13));
		addSnowPile(entities.snowPileBig(92.75, 139.75));
		addSnowPile(entities.snowPileBig(74.34, 157.38));
		addSnowPile(entities.snowPileSmall(73.19, 155.96));
		addSnowPile(entities.snowPileSmall(87.09, 147.63));
		addSnowPile(entities.snowPileBig(69.59, 134.54));
		addSnowPile(entities.snowPileMedium(84.66, 130.25));
		addSnowPile(entities.snowPileMedium(77.41, 121.38));
		addSnowPile(entities.snowPileSmall(79.13, 120.75));
		addSnowPile(entities.snowPileSmall(77.34, 133.83));
		addSnowPile(entities.snowPileBig(72.84, 106.33));
		addSnowPile(entities.snowPileMedium(63.41, 121.63));
		addSnowPile(entities.snowPileSmall(64.91, 122.29));
		addSnowPile(entities.snowPileTiny(71.06, 70.04));
		addSnowPile(entities.snowPileTiny(64.25, 77.88));
		addSnowPile(entities.snowPileTiny(44.41, 76.17));
		addSnowPile(entities.snowPileTiny(51.28, 69.00));
		addSnowPile(entities.snowPileTiny(74.56, 83.79));
		addSnowPile(entities.snowPileTinier(64.72, 78.29));
		addSnowPile(entities.snowPileTinier(67.31, 71.04));
		addSnowPile(entities.snowPileTinier(60.56, 69.21));
		addSnowPile(entities.snowPileTinier(51.44, 59.58));
		addSnowPile(entities.snowPileTinier(74.19, 84.25));
		addSnowPile(entities.snowPileTiny(49.75, 87.50));
		addSnowPile(entities.snowPileTiny(77.31, 100.83));
		addSnowPile(entities.snowPileTiny(75.81, 118.29));
		addSnowPile(entities.snowPileTiny(74.25, 106.83));
		addSnowPile(entities.snowPileTinier(76.22, 118.58));
		addSnowPile(entities.snowPileTinier(73.75, 107.00));
		addSnowPile(entities.snowPileTinier(75.63, 95.92));
		addSnowPile(entities.snowPileTiny(62.28, 121.96));
		addSnowPile(entities.snowPileTinier(62.91, 122.42));
		addSnowPile(entities.snowPileTinier(86.19, 147.25));
		addSnowPile(entities.snowPileTinier(78.50, 121.54));
		addSnowPile(entities.snowPileTiny(85.69, 130.50));
		addSnowPile(entities.snowPileTiny(72.44, 156.25));
		addSnowPile(entities.snowPileTiny(101.75, 146.29));
		addSnowPile(entities.snowPileTiny(112.34, 152.42));
		addSnowPile(entities.snowPileTiny(93.28, 110.67));
		addSnowPile(entities.snowPileTiny(103.28, 122.71));
		addSnowPile(entities.snowPileTinier(103.75, 122.96));
		addSnowPile(entities.snowPileTinier(93.72, 111.00));
		addSnowPile(entities.snowPileTiny(116.81, 97.13));
		addSnowPile(entities.snowPileTiny(110.28, 91.79));
		addSnowPile(entities.snowPileTiny(115.78, 80.96));
		addSnowPile(entities.snowPileTinier(116.16, 81.33));
		addSnowPile(entities.snowPileTinier(123.00, 83.42));
		addSnowPile(entities.snowPileTinier(116.66, 45.96));
		addSnowPile(entities.snowPileTinier(140.84, 85.33));
		addSnowPile(entities.snowPileTiny(138.75, 98.96));
		addSnowPile(entities.snowPileTinier(139.09, 98.79));
		addSnowPile(entities.snowPileTiny(148.47, 99.33));
		addSnowPile(entities.snowPileTinier(147.34, 98.58));
		addSnowPile(entities.snowPileTinier(144.66, 106.79));
		addSnowPile(entities.snowPileTiny(149.13, 138.50));
		addSnowPile(entities.snowPileTiny(141.09, 144.63));
		addSnowPile(entities.snowPileTinier(149.63, 138.88));
		addSnowPile(entities.snowPileTinier(140.63, 145.00));
		addSnowPile(entities.snowPileTiny(85.88, 147.67));
		addSnowPile(entities.snowPileTiny(94.34, 139.96));
		addSnowPile(entities.snowPileTinier(82.88, 56.88));
		addSnowPile(entities.snowPileTiny(85.84, 56.54));
		addSnowPile(entities.snowPileTinier(85.31, 57.13));
		addSnowPile(entities.snowPileTiny(66.91, 82.79));
		addSnowPile(entities.snowPileTinier(66.47, 83.21));
		addSnowPile(entities.snowPileTinier(65.38, 82.92));
		addSnowPile(entities.snowPileTinier(68.75, 112.17));
		addSnowPile(entities.snowPileTinier(54.13, 133.38));
		addSnowPile(entities.snowPileTinier(84.44, 152.42));
		addSnowPile(entities.snowPileTiny(85.41, 152.96));
		addSnowPile(entities.snowPileTiny(86.56, 152.04));
		addSnowPile(entities.snowPileTinier(86.97, 152.38));
		addSnowPile(entities.snowPileTinier(105.84, 85.96));
		addSnowPile(entities.snowPileTiny(106.53, 86.29));
		addSnowPile(entities.snowPileTinier(107.91, 86.42));
		addSnowPile(entities.snowPileTinier(155.66, 61.17));
		addSnowPile(entities.snowPileTiny(157.47, 60.42));
		addSnowPile(entities.snowPileTinier(157.72, 60.21));
		addSnowPile(entities.snowPileTinier(116.22, 46.42));
		addSnowPile(entities.snowPileBig(94.25, 68.29));
		addSnowPile(entities.snowPileMedium(73.56, 43.42));
		addSnowPile(entities.snowPileMedium(52.75, 38.46));
		addSnowPile(entities.snowPileSmall(52.03, 39.88));
		addSnowPile(entities.snowPileBig(43.72, 30.13));
		addSnowPile(entities.snowPileSmall(54.22, 17.13));
		addSnowPile(entities.snowPileTiny(48.69, 30.38));
		addSnowPile(entities.snowPileTiny(53.22, 39.46));
		addSnowPile(entities.snowPileTiny(60.19, 34.79));
		addSnowPile(entities.snowPileSmall(79.28, 37.21));
		addSnowPile(entities.snowPileSmall(84.19, 22.21));
		addSnowPile(entities.snowPileBig(99.34, 21.25));
		addSnowPile(entities.snowPileTiny(97.88, 22.29));
		addSnowPile(entities.snowPileSmall(106.94, 42.13));
		addSnowPile(entities.snowPileMedium(120.38, 26.79));
		addSnowPile(entities.snowPileSmall(121.00, 28.00));
		addSnowPile(entities.snowPileMedium(145.56, 20.17));
		addSnowPile(entities.snowPileBig(144.41, 21.29));
		addSnowPile(entities.snowPileBig(134.91, 4.46));
		addSnowPile(entities.snowPileSmall(120.56, 7.88));
		addSnowPile(entities.snowPileSmall(155.88, 55.21));
		addSnowPile(entities.snowPileSmall(148.28, 114.38));
		addSnowPile(entities.snowPileSmall(138.84, 154.50));
		addSnowPile(entities.snowPileMedium(139.88, 153.13));
		addSnowPile(entities.snowPileMedium(60.38, 150.25));
		addSnowPile(entities.snowPileBig(36.41, 149.33));
		addSnowPile(entities.snowPileMedium(37.31, 150.63));
		addSnowPile(entities.snowPileMedium(16.25, 138.88));
		addSnowPile(entities.snowPileSmall(15.31, 139.83));
		addSnowPile(entities.snowPileSmall(2.63, 149.38));
		addSnowPile(entities.snowPileMedium(4.19, 113.96));
		addSnowPile(entities.snowPileSmall(4.97, 115.08));
		addSnowPile(entities.snowPileSmall(29.34, 102.83));
		addSnowPile(entities.snowPileMedium(25.66, 89.00));
		addSnowPile(entities.snowPileSmall(26.91, 89.88));
		addSnowPile(entities.snowPileSmall(32.91, 69.38));
		addSnowPile(entities.snowPileSmall(21.13, 76.46));
		addSnowPile(entities.snowPileMedium(15.81, 53.46));
		addSnowPile(entities.snowPileMedium(25.94, 27.25));
		addSnowPile(entities.snowPileSmall(24.22, 28.50));
		addSnowPile(entities.snowPileBig(13.53, 17.13));
		addSnowPile(entities.snowPileSmall(12.34, 16.38));
		addSnowPile(entities.snowPileSmall(22.59, 5.46));
		addSnowPile(entities.snowPileMedium(52.38, 3.96));
		addSnowPile(entities.snowPileTiny(51.13, 4.71));
		addSnowPile(entities.snowPileTinier(50.94, 13.33));
		addSnowPile(entities.snowPileSmall(89.22, 2.71));
	}

	function addXmasTree(x: number, y: number) {
		x -= 33;
		y -= 24;
		addEntities(entities.pine(x + 33, y + 24, 1));
		add(entities.xmasLights(x + 33, y + 24));
		add(entities.xmasLight(x + 33.22, y + 24.88));
		add(entities.xmasLight(x + 33.59, y + 24.04));
		add(entities.xmasLight(x + 32.28, y + 24.08));
		add(entities.xmasLight(x + 31.84, y + 24.42));
		add(entities.xmasLight(x + 30.97, y + 24.00));
		add(entities.xmasLight(x + 32.31, y + 22.63));
		add(entities.xmasLight(x + 31.63, y + 21.75));
		add(entities.xmasLight(x + 32.75, y + 20.92));
		add(entities.xmasLight(x + 32.19, y + 19.50));
		add(entities.xmasLight(x + 32.75, y + 18.17));
		add(entities.xmasLight(x + 33.38, y + 18.42));
		add(entities.xmasLight(x + 33.38, y + 19.79));
		add(entities.xmasLight(x + 33.94, y + 20.42));
		add(entities.xmasLight(x + 33.63, y + 22.33));
		add(entities.xmasLight(x + 34.00, y + 22.46));
		add(entities.xmasLight(x + 34.38, y + 21.83));
		add(entities.xmasLight(x + 35.00, y + 23.63));
		add(entities.xmasLight(x + 34.56, y + 24.17));
	}

	function addGraveWithGhost(x: number, y: number, tombType: number) {
		const tombs = [entities.tombstone1, entities.tombstone2];
		const tomb = add(tombs[tombType](x, y));
		const createGhost = tombType === 0 ? entities.ghost1 : entities.ghost2;
		const createGhostHooves = tombType === 0 ? entities.ghostHooves1 : entities.ghostHooves2;
		const ghost = add(createGhost(x + toWorldX(1), y));
		const hooves = add(createGhostHooves(x + toWorldX(1), y));
		return { tomb, ghost, hooves };
	}

	const addGhost = (x: number, y: number, tombType: number, anims?: number[]) => {
		const { ghost, hooves, tomb } = addGraveWithGhost(x, y, tombType);
		const randomDelay = () => random(1 * 60, 5 * 60, true);
		let delay = randomDelay();
		let resetDelay = 0;
		let reset = true;

		ghost.serverUpdate = delta => {
			delay -= delta;
			resetDelay -= delta;

			if (delay < 0) {
				const flip = Math.random() > 0.5;
				const anim = sample(anims || (tomb.type === entities.tombstone1.type ? [1, 3] : [1, 2, 3]))!;
				setEntityAnimation(ghost, anim, flip);
				setEntityAnimation(hooves, anim, flip);
				delay = randomDelay();
				reset = false;
				resetDelay = 5;
			} else if (!reset && resetDelay < 0) {
				setEntityAnimation(ghost, GhostAnimation.None);
				setEntityAnimation(hooves, GhostAnimation.None);
				reset = true;
			}
		};
	};

	const createEyes = (x: number, y: number) => {
		const entity = add(entities.eyes(x, y));
		let delay = 5;
		let open = true;

		entity.serverUpdate = delta => {
			delay -= delta;

			if (delay < 0) {
				if (open) {
					setEntityAnimation(entity, 1);
					delay = 0.2;
					open = false;
				} else {
					setEntityAnimation(entity, 0);
					delay = random(5, 10, true);
					open = true;
				}
			}
		};
	};

	const addJacko = (x: number, y: number) => {
		add(entities.jacko(x, y)).boop = boopLight;
	};

	const addJackoLanternSpot = (x: number, y: number) => {
		const giveLantern = give(entities.jackoLanternOn.type, 'Now go collect some candies!');

		add(createSign(x, y, 'Jack-o-Lanterns', giveLantern, entities.signQuest));

		addJacko(x + 0.5, y - 0.3);
		addJacko(x - 0.3, y + 0.3);

		add(entities.jackoLanternOff(x + 0.2, 17.7 + y - 18.5));
		add(entities.jackoLanternOff(x + 0.7, 17.8 + y - 18.5));
		add(entities.jackoLanternOff(x + 0.3, y + 0.2));
		add(entities.jackoLanternOff(x + 0.7, y + 0.5));
		add(entities.jackoLanternOn(x, 19.2 + y - 18.5));
		add(entities.jackoLanternOn(x + 0.5, 19.4 + y - 18.5));
		add(entities.jackoLanternOn(x - 0.9, 19.2 + y - 18.5));
	};

	if (isHalloween) {
		const donateX = 64, donateY = 79;
		add(createSign(donateX, donateY, 'Donate candies', donateCandy, entities.signDonate));
		add(entities.box(donateX + 0.1, donateY + 1.2)).interact = donateCandy;

		add(entities.jackoOn(132.69, 108.79));
		add(entities.jackoOn(131.31, 134.79));
		add(entities.jackoOn(134.55, 139.38));
		add(entities.jackoOn(122.94, 105.38));
		add(entities.jackoOn(126.63, 107.38));
		add(entities.jackoOn(127.75, 110.88));
		add(entities.jackoOn(126.13, 124.38));
		add(entities.jackoOn(126.44, 133.71));
		add(entities.jackoOn(126.88, 137.71));
		add(entities.jackoOn(132.38, 136.88));

		addGhost(149.53, 135.58, 1);
		addGhost(144.38, 100.21, 1);
		addGhost(149.84, 100.58, 1);
		add(entities.tombstone2(144.56, 105.25));
		addGhost(146.34, 105.29, 1);
		add(entities.tombstone1(146.28, 100.50));
		addGhost(148.25, 100.50, 0);
		add(entities.tombstone1(148.34, 105.38));
		add(entities.tombstone1(150.03, 105.21));
		addGhost(102.28, 93.29, 1);
		addGhost(66.59, 57.46, 1);
		addGhost(72.19, 69.21, 1);

		createEyes(155.52, 102.73);
		createEyes(156.81, 104.02);
		createEyes(155.66, 104.71);
		createEyes(158.05, 106.65);
		createEyes(147.25, 111.96);
		createEyes(146.59, 109.33);
		createEyes(148.19, 110.27);
		createEyes(141.31, 111.52);
		createEyes(145.23, 115.35);
		createEyes(144.16, 114.44);
		createEyes(142.39, 107.33);
		createEyes(141.19, 108.63);
		createEyes(142.39, 111.02);
		createEyes(149.59, 113.52);
		createEyes(150.22, 113.06);
		createEyes(140.02, 107.44);
		createEyes(142.83, 115.50);
		createEyes(138.78, 111.50);
		createEyes(137.22, 112.27);

		createEyes(144.59, 93.00);
		createEyes(145.43, 93.95);
		createEyes(147.40, 91.25);
		createEyes(146.90, 93.04);
		createEyes(148.68, 92.37);
		createEyes(153.15, 94.29);
		createEyes(154.46, 94.95);
		createEyes(152.40, 96.08);
		createEyes(154.87, 97.20);
		createEyes(155.53, 97.79);

		add(entities.jackoLanternOn(131.97, 149.77));
		add(entities.jackoLanternOn(132.02, 83.46));
		add(entities.jackoLanternOn(131.98, 149.85));
		add(entities.jackoLanternOn(106.45, 150.31));
		add(entities.jackoLanternOn(107.14, 149.79));
		add(entities.jackoLanternOn(80.33, 93.19));

		addGhost(45.34, 152.83, 0);
		addGhost(45.75, 106.08, 0);
		addGhost(59.78, 96.83, 0);
		addGhost(81.00, 93.00, 0);
		addGhost(83.62, 132.875, 0);
		addGhost(115.96, 45.79, 0);
		addGhost(149.75, 81.58, 0);
		addGhost(52.40, 138.70, 1);
		addGhost(52.12, 88.29, 1);
		addGhost(49.06, 64.83, 1);
		addGhost(48.43, 50.83, 1);
		addGhost(80.72, 115.83, 1);
		addGhost(86.50, 46.83, 1);
		addGhost(113.812, 107.37, 1);
		addGhost(118.062, 125.12, 1);
		addGhost(106.59, 149.83, 1);
		addGhost(132.43, 83.12, 1);
		addGhost(135.46, 67.66, 1);
		addGhost(131.53, 149.50, 1);

		add(entities.jackoLanternOn(45.84, 153.20));
		add(entities.jackoLanternOn(46.15, 152.75));
		add(entities.jackoLanternOn(53.00, 138.70));
		add(entities.jackoLanternOn(48.56, 64.58));
		add(entities.jackoLanternOn(48.93, 51.04));
		add(entities.jackoLanternOn(72.53, 69.58));
		add(entities.jackoLanternOn(80.31, 116.16));
		add(entities.jackoLanternOn(83.06, 133.29));
		add(entities.jackoLanternOn(86.15, 47.12));
		add(entities.jackoLanternOn(115.50, 46.13));
		add(entities.jackoLanternOn(114.25, 107.83));
		add(entities.jackoLanternOn(114.53, 107.41));
		add(entities.jackoLanternOn(132.03, 83.41));
		add(entities.jackoLanternOn(132.93, 83.08));
		add(entities.jackoLanternOn(115.50, 46.12));
		add(entities.jackoLanternOn(149.15, 81.37));
		add(entities.jackoLanternOn(144.15, 105.58));
		add(entities.jackoLanternOn(146.75, 100.83));
		add(entities.jackoLanternOn(150.63, 105.58));

		add(entities.jackoLanternOn(52.68, 139.04));
		add(entities.jackoLanternOn(46.28, 106.41));
		add(entities.jackoLanternOn(52.53, 88.62));
		add(entities.jackoLanternOn(135.84, 67.91));

		add(entities.jackoLanternOff(52.62, 88.12));
		add(entities.jackoLanternOff(106.09, 150.04));
		add(entities.jackoLanternOff(51.93, 138.58));

		addJacko(71.90, 70.00);
		addJacko(90.20, 66.40);
		addJacko(80.00, 53.80);
		addJacko(67.30, 88.60);
		addJacko(86.20, 97.30);
		addJacko(99.70, 92.00);
		addJacko(91.00, 86.10);
		addJacko(85.70, 75.10);
		addJacko(84.50, 91.40);
		addJacko(99.00, 87.00);
		addJacko(91.60, 55.90);
		addJacko(95.60, 47.50);
		addJacko(98.40, 44.20);
		addJacko(100.10, 49.00);
		addJacko(87.20, 46.50);
		addJacko(69.70, 47.20);
		addJacko(49.10, 89.50);
		addJacko(59.10, 97.60);
		addJacko(46.70, 98.10);
		addJacko(52.20, 77.40);
		addJacko(62.50, 72.20);
		addJacko(66.70, 71.40);

		addJacko(97.50, 100.79);
		addJacko(110.34, 92.79);
		addJacko(117.34, 99.38);
		addJacko(108.94, 101.50);
		addJacko(109.63, 102.21);
		addJacko(108.00, 85.00);
		addJacko(93.50, 106.17);
		addJacko(113.22, 108.17);
		addJacko(117.56, 117.38);
		addJacko(118.81, 125.33);
		addJacko(117.25, 127.71);
		addJacko(118.03, 129.50);
		addJacko(93.22, 135.46);
		addJacko(78.94, 147.54);
		addJacko(82.00, 147.67);
		addJacko(102.06, 146.83);
		addJacko(96.59, 146.58);
		addJacko(108.75, 141.33);
		addJacko(110.03, 146.71);
		addJacko(147.88, 148.04);
		addJacko(145.41, 150.08);
		addJacko(147.28, 153.67);
		addJacko(150.78, 153.00);
		addJacko(150.78, 149.08);
		addJacko(152.88, 131.38);
		addJacko(143.25, 137.17);
		addJacko(141.22, 116.13);
		addJacko(138.16, 132.46);
		addJacko(141.34, 102.04);
		addJacko(141.31, 103.88);
		addJacko(134.56, 86.71);
		addJacko(139.34, 85.29);
		addJacko(148.50, 81.71);
		addJacko(150.09, 82.54);
		addJacko(129.78, 98.67);
		addJacko(136.75, 66.38);
		addJacko(117.63, 70.33);
		addJacko(131.81, 52.63);
		addJacko(116.72, 46.21);
		addJacko(137.22, 55.25);
		addJacko(131.91, 49.21);
		addJacko(124.63, 47.08);
		addJacko(122.69, 51.58);

		addJacko(125.97, 145.21);
		addJacko(115.91, 139.92);
		addJacko(119.59, 145.54);

		addJacko(53.59, 133.58);
		addJacko(48.78, 136.08);
		addJacko(48.22, 142.75);
		addJacko(55.22, 143.50);
		addJacko(58.34, 135.21);
		addJacko(58.94, 140.63);

		addJacko(76.63, 125.00);
		addJacko(76.59, 128.88);
		addJacko(77.06, 120.88);
		addJacko(86.91, 121.08);
		addJacko(86.84, 129.33);
		addJacko(76.91, 134.63);
		addJacko(86.47, 135.50);
		addJacko(137.40, 97.60);

		addJacko(44.53, 152.91);
		addJacko(49.56, 65.16);
		addJacko(81.50, 92.41);
		addJacko(81.18, 116.25);
		addJacko(116.71, 46.20);
		addJacko(118.81, 125.33);
		addJacko(148.50, 81.70);
		addJacko(150.09, 82.54);
		addJacko(151.46, 99.08);

		addJacko(45.09, 105.75);

		add(entities.jackoLanternOff(66.60, 72.10));
		add(entities.jackoLanternOff(67.20, 71.90));

		addJackoLanternSpot(101.00, 100.00);
		addJackoLanternSpot(147.00, 135.00);
		addJackoLanternSpot(190.00, 176.00);
		addJackoLanternSpot(107.00, 173.00);
		addJackoLanternSpot(165.00, 95.00);
	}

	if (isChristmas) {
		addEntities(createToyStash(103.87, 86.12));

		const donateX = 64, donateY = 79;
		add(createSign(donateX, donateY, 'Donate gifts', donateGift, entities.signDonate));
		add(entities.boxGifts(donateX + 0.1, donateY + 1.2)).interact = donateGift;

		const xmasTreeY = 49.5, xmasTreeX = 40.25;
		addXmasTree(33 + xmasTreeX, 24 + xmasTreeY);
		add(entities.giftPilePine(33 + xmasTreeX, 24.5 + xmasTreeY));
		add(entities.giftPile6(31.13 + xmasTreeX, 25.13 + xmasTreeY));
		add(entities.giftPile1(34.75 + xmasTreeX, 25.71 + xmasTreeY));
		add(createCookieTable(32.7 + xmasTreeX, 26.5 + xmasTreeY));

		add(entities.mistletoe(86.40, 83.00));
		add(entities.mistletoe(92.00, 93.00));
		add(entities.giftPile4(43.50, 53.50));
		add(entities.giftPileTree(81.10, 92.50));
		add(entities.giftPile1(76.00, 90.00));
		add(entities.giftPile3(79.00, 53.00));
		add(entities.giftPile6(85.00, 54.50));

		add(entities.giftPileTree(97.28, 64.38));
		add(entities.giftPilePine(63.03, 98.38));
		add(entities.giftPile5(65.25, 98.83));
		add(entities.giftPile6(61.03, 99.29));
		add(entities.giftPile1(65.09, 112.96));
		add(entities.giftPile3(63.06, 113.67));
		add(entities.giftPile4(64.59, 114.71));
		add(entities.giftPile2(57.50, 146.04));
		add(entities.giftPile6(58.25, 147.67));
		add(entities.giftPileTree(132.38, 149.08));
		add(entities.giftPile5(134.03, 149.33));
		add(entities.giftPile2(147.47, 126.58));
		add(entities.giftPileTree(137.84, 115.21));
		add(entities.giftPile5(134.06, 121.79));
		add(entities.giftPilePine(147.59, 101.86));
		add(entities.giftPile1(143.16, 98.99));
		add(entities.giftPile4(134.41, 67.58));
		add(entities.giftPilePine(154.81, 55.63));
		add(entities.giftPile1(144.13, 45.54));
		add(entities.giftPile3(132.66, 47.25));
		add(entities.giftPileTree(118.78, 48.25));

		add(entities.giftPile1(51.31, 31.33));
		add(entities.giftPile2(58.66, 31.75));
		add(entities.giftPile4(72.28, 37.50));
		add(entities.giftPile6(91.06, 38.13));
		add(entities.giftPile3(100.00, 38.17));
		add(entities.giftPileTree(143.56, 14.21));
		add(entities.giftPile1(126.03, 12.08));
		add(entities.giftPileInteractive(148.91, 34.50));
		add(entities.giftPile6(96.97, 11.79));
		add(entities.giftPile2(77.22, 6.46));
		add(entities.giftPileTree(62.66, 6.13));
		add(entities.giftPile3(20.78, 6.71));
		add(entities.giftPile1(8.41, 15.75));
		add(entities.giftPile6(15.13, 32.08));
		add(entities.giftPileInteractive(14.22, 33.04));
		add(entities.giftPileTree(25.66, 59.29));
		add(entities.giftPile6(16.03, 77.17));
		add(entities.giftPile1(22.09, 105.88));
		add(entities.giftPileInteractive(9.34, 96.17));
		add(entities.giftPile3(24.25, 144.25));
		add(entities.giftPile6(14.88, 155.13));
		add(entities.giftPile1(33.19, 133.13));
		add(entities.giftPile6(41.56, 122.17));

		add(entities.holly(121.00, 145.17));
		add(entities.holly(122.03, 145.17));
		add(entities.holly(123.00, 145.13));
		add(entities.holly(125.00, 145.13));
		add(entities.holly(118.00, 140.17));
		add(entities.holly(121.03, 140.13));
		add(entities.holly(119.03, 140.21));
		add(entities.holly(135.00, 144.17));
		add(entities.holly(137.03, 144.17));
		add(entities.holly(138.03, 144.17));
		add(entities.holly(137.00, 140.13));
		add(entities.holly(139.00, 140.13));
		add(entities.holly(140.00, 140.04));
		add(entities.holly(142.00, 140.13));
		add(entities.holly(143.00, 144.58));
		add(entities.holly(144.97, 144.63));
		add(entities.holly(121.00, 100.13));
		add(entities.holly(124.00, 100.13));
		add(entities.holly(119.03, 100.13));
		add(entities.holly(117.97, 100.13));
		add(entities.holly(118.03, 105.21));
		add(entities.holly(120.00, 105.17));
		add(entities.holly(79.00, 147.21));
		add(entities.holly(82.03, 147.17));
		add(entities.holly(76.97, 147.21));
		add(entities.holly(84.00, 147.17));
		add(entities.holly(85.03, 147.17));
		add(entities.holly(86.00, 147.08));
		add(entities.holly(77.03, 136.17));
		add(entities.holly(80.03, 136.13));
		add(entities.holly(81.00, 136.17));
		add(entities.holly(83.00, 137.17));
		add(entities.holly(86.00, 137.17));
		add(entities.holly(87.00, 137.08));
		add(entities.holly(88.00, 137.17));
		add(entities.holly(73.03, 100.88));
		add(entities.holly(76.81, 100.88));
		add(entities.holly(81.03, 97.04));
		add(entities.holly(83.63, 100.67));
		add(entities.holly(87.44, 100.71));
		add(entities.holly(92.22, 96.08));
		add(entities.holly(96.72, 100.58));
		add(entities.holly(45.50, 53.13));
		add(entities.holly(49.31, 53.13));

		add(entities.giftPile3(120.69, 145.46));
		add(entities.mistletoe(130.81, 149.46));
		add(entities.mistletoe(125.56, 139.38));
		add(entities.mistletoe(140.09, 131.50));
		add(entities.mistletoe(154.81, 107.88));
		add(entities.mistletoe(132.06, 123.25));
		add(entities.mistletoe(148.16, 114.54));
		add(entities.giftPile6(137.34, 131.17));
		add(entities.giftPile3(47.94, 142.42));
		add(entities.giftPile2(76.00, 147.75));

		add(createCookieTable(29.43, 70.20));
		add(createCookieTable(104.75, 58.92));
		add(createCookieTable(79.31, 6.70));
		add(createCookieTable(110.06, 93.00));
		add(createCookieTable(146.47, 145.21));
	}

	if (isEaster) {
		const giveBasket = give(entities.basket.type);

		// spot 1
		add(entities.basketBin(73.00, 74.00)).interact = giveBasket;
		add(entities.eggBasket2(73.53, 74.88));
		add(entities.eggBasket3(74.41, 73.92));
		add(entities.eggBasket4(74.16, 74.17));
		add(createSign(74.00, 73.80, 'Egg baskets', giveBasket, entities.signQuest));

		// spot 2
		add(entities.basketBin(33 + 70, 34 + 53)).interact = giveBasket;
		add(entities.eggBasket2(33.53 + 70, 34.88 + 53));
		add(entities.eggBasket3(34.41 + 70, 33.92 + 53));
		add(entities.eggBasket4(34.16 + 70, 34.17 + 53));
		add(createSign(34 + 70, 33.8 + 53, 'Egg baskets', giveBasket, entities.signQuest));

		// donation spot
		add(createSign(62.00, 78.00, 'Donate eggs', donateEgg, entities.signDonate));
		add(entities.barrel(62.15, 78.87)).interact = donateEgg;
	}
}

export function updateMainMapSeason(world: World, map: ServerMap, season: Season, holiday: Holiday) {
	removeSeasonalObjects(world, map);
	addSeasonalObjects(world, map, season, holiday);

	const isWinter = season === Season.Winter;

	for (let y = 0, i = 0; y < map.height; y++) {
		for (let x = 0; x < map.width; x++ , i++) {
			const tile = mainMapTiles[i];

			if (isWinter) {
				if (x > 18 && (tile === TileType.Water || tile === TileType.WalkableWater || tile === TileType.Boat)) {
					setTile(map, x, y, tile === TileType.Water ? TileType.Ice : TileType.WalkableIce);
				} else {
					setTile(map, x, y, tile);
				}
			} else {
				if (tile === TileType.Ice || tile === TileType.SnowOnIce) {
					setTile(map, x, y, TileType.Water);
				} else if (tile === TileType.WalkableIce) {
					setTile(map, x, y, TileType.WalkableWater);
				} else {
					setTile(map, x, y, tile);
				}
			}
		}
	}

	snapshotTiles(map);

	for (const controller of map.controllers) {
		controller.initialize(world.now / 1000);
	}
}

export function createMainMap(world: World): ServerMap {
	const mapSize = 20;
	const map = createServerMap('', MapType.Cave, mapSize, mapSize, TileType.Grass);

	map.flags |= MapFlags.EdibleGrass;
	map.flags |= MapFlags.EditableEntities;
	map.flags |= MapFlags.EditableTiles;
	map.flags |= MapFlags.EditableWalls;

	// spawns

	map.spawnArea = rect(51, 21, 8, 8);

	map.spawns.set('cave', rect(75.5, 27, 2, 2));

	const wallController = new WallController(world, map, entities.metroWalls);
	wallController.isTall = () => true;
	map.controllers.push(wallController);

	// tiles

	deserializeMap(map, mainMapData);
	if (mainMapEntities) deserializeEntities(world, map, mainMapEntities);

	if (!DEVELOPMENT) {
		snapshotTiles(map);
	}

	if (DEVELOPMENT) {
		addSpawnPointIndicators(world, map);
	}

	return map;
}
