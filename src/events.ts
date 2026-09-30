import { room, ghostRoom, setGhostRoom, setEmfLevel, setEventText, bump, banished, agitation, scared, won, setShowGhost, type roomId} from './state';

import {creak, knock, heartbeat, burst} from './audio';

export const ADJACENT: Record<roomId, roomId[]> = {
    hallway: ['bedroom', 'basement'],
    bedroom: ['hallway'],
    basement: ['hallway'],
};

interface GameEvent {
    text: string;
    sound: 'creak' | 'knock' | 'burst' | null;
    bumpVal: number;
}

const EVENTS: GameEvent[] = [
    {text:'The temperature drops suddenly', sound:'creak', bumpVal: 8},
    {text:'Something moves in the shadows', sound:'burst', bumpVal: 10},
    {text:'You hear footsteps above you', sound:'knock', bumpVal: 12},
    {text:'The walls are breathing..', sound:'creak', bumpVal: 6},
    {text:"A child's laugh echoes.", sound:'burst', bumpVal: 15},
    {text:'Your vision blurs at the edges', sound: null, bumpVal: 5},
    {text:'Three slow knocks from inside the wall.', sound:'knock', bumpVal: 18},
    {text:'Something whispers behind you', sound:'burst', bumpVal: 12},
    {text:'The air smells like copper', sound:null, bumpVal: 7},
    {text:'You feel a hand on your shoulder.', sound:'creak', bumpVal: 20},
    {text:'The lights die for a moment', sound:null, bumpVal: 5},
    {text:'Something drags across the floor above.', sound:'knock', bumpVal: 14},
];

let timeouts: number[] = [];
let intervals: number[] = [];

function later(fn: () => void, ms: number) {
    timeouts.push(window.setTimeout(fn, ms));
}

function every(fn: () => void, ms: number) {
    intervals.push(window.setInterval(fn,ms));
}

export function startEvents() {
    timeouts.forEach(clearTimeout);
    intervals.forEach(clearInterval);
    timeouts = [];
    intervals = [];
}

export function stopEvents() {
    timeouts.forEach(clearTimeout);
    intervals.forEach(clearInterval);

    timeouts = [];
    intervals = [];
}
