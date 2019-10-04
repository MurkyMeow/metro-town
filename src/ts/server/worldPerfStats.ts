import { defaultWorldPerfStats } from '../common/adminInterfaces';
import { counterNow } from '../common/interfaces';
import { getTimingEnabled } from './timing';

const FRAME_HISTORY_SIZE = 25;

let stats = defaultWorldPerfStats();
const frameHistory: number[] = [];
frameHistory.length = FRAME_HISTORY_SIZE;
frameHistory.fill(-1);
let frameHistoryPtr = 0;

function addFrameToHistory(time: number) {
	frameHistory[frameHistoryPtr++] = time;
	if (frameHistoryPtr === FRAME_HISTORY_SIZE) {
		frameHistoryPtr = 0;
	}
}

export function updateWorldPerfStats(
	frameStart: number, clients: number, movingEntities: number, regionsCount: number, mapsCount: number, clientQueue: number,
	controllersCount: number, clientsWithAdds: number, clientsWithUpdates: number, clientsWithSays: number, totalSays: number,
	sent: number, received: number, sentPackets: number, receivedPackets: number) {
	const time = counterNow() - frameStart;
	stats.lastUpdateTime = time;
	addFrameToHistory(time);
	stats.isSamplingEnabled = getTimingEnabled();
	stats.clients = clients;
	stats.movingEntities = movingEntities;
	stats.regionsCount = regionsCount;
	stats.mapsCount = mapsCount;
	stats.clientQueue = clientQueue;
	stats.controllersCount = controllersCount;
	stats.clientsWithAdds = clientsWithAdds;
	stats.clientsWithUpdates = clientsWithUpdates;
	stats.clientsWithSays = clientsWithSays;
	stats.totalSays = totalSays;
	stats.sent = sent;
	stats.received = received;
	stats.sentPackets = sentPackets;
	stats.receivedPackets = receivedPackets;

	let avg = 0, nonZero = 0;
	stats.maxUpdateTime = Number.MIN_VALUE;
	stats.minUpdateTime = Number.MAX_VALUE;

	for (const f of frameHistory) {
		if (f < 0) {
			continue;
		}
		if (f < stats.minUpdateTime) {
			stats.minUpdateTime = f;
		}
		if (f > stats.maxUpdateTime) {
			stats.maxUpdateTime = f;
		}
		avg += f;
		++nonZero;
	}

	stats.avgUpdateTime = avg / nonZero;
}

export function getWorldPerfStats() {
	return stats;
}
