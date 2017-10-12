import {KEYS} from './constants';

export function getHandleFor(ev) {
    return Number(ev.currentTarget.getAttribute('data-handle-key'));
}

export function killEvent(ev) {
    ev.stopPropagation();
    ev.preventDefault();
}

export const stepMultiplier = {
    [KEYS.LEFT]: v => v * -1,
    [KEYS.RIGHT]: v => v * 1,
    [KEYS.UP]: v => v * 1,
    [KEYS.DOWN]: v => v * -1,
    [KEYS.PAGE_DOWN]: v => (v > 1 ? -v : v * -10),
    [KEYS.PAGE_UP]: v => (v > 1 ? v : v * 10),
};
