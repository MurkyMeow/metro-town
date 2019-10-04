import { TimingEntry, TimingEntryType } from '../common/adminInterfaces';
import { MINUTE } from '../common/constants';
import { counterNow } from '../common/interfaces';

const ENTRIES_LIMIT = 20000;

let entries: TimingEntry[] = [];
let entriesCount = 0;
let isProfilingEnabled = false;
let lastFetchTime = Date.now();

export function getTimingEnabled() {
	return isProfilingEnabled;
}

export function setTimingEnabled(isEnabled: boolean) {
	if (isProfilingEnabled === isEnabled) {
		return;
	}

	isProfilingEnabled = isEnabled;

	if (isEnabled) {
		for (let i = 0; i < ENTRIES_LIMIT; i++) {
			entries.push({ type: 0, time: 0, name: undefined });
		}
	}
	else {
		entries = [];
	}
}

export function timingStart(name: string) {
	if (isProfilingEnabled) {
		if (entriesCount < ENTRIES_LIMIT) {
			const entry = entries[entriesCount];
			entry.type = TimingEntryType.Start;
			entry.time = counterNow();
			entry.name = name;
			entriesCount++;
		} else {
			console.warn(`exceeded timing entry limit`);
		}
	}
}

export function timingEnd() {
	if (isProfilingEnabled) {
		if (entriesCount < ENTRIES_LIMIT) {
			const entry = entries[entriesCount];
			entry.type = TimingEntryType.End;
			entry.time = counterNow();
			entry.name = undefined;
			entriesCount++;
		} else {
			console.warn(`exceeded timing entry limit`);
		}
	}
}

export function timingReset() {
	entriesCount = 0;
}

export function timingEntries() {
	lastFetchTime = Date.now();
	if (!isProfilingEnabled) {
		setTimingEnabled(true);
		return [];
	}
	return entries.slice(0, entriesCount);
}

export function timingUpdate() {
	if (isProfilingEnabled) {
		if (Date.now() - lastFetchTime > MINUTE) {
			setTimingEnabled(false);
		}
	}
}
