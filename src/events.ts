import {doorsLocked, setDoorsLocked, lightsOut, setLightsOut, room, setAgitation, ghostRoom, setGhostRoom, setEmfLevel, setEventText, bump, banished, agitation, scared, won, setShowGhost, type roomId, setExamineText} from './state';

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

function scheduleDoorLock() {
    later(() => {
        if (scared() || won()){
            return;
        }
    })
}

export function startEvents() {
    timeouts.forEach(clearTimeout);
    intervals.forEach(clearInterval);

    timeouts = [];
    intervals = [];

    scheduleRandomEvent();
    scheduleGhostMove();
    scheduleGhostFlash();
    scheduleHeartbeat();

    every(() => {
        if (scared() || won()){
            return;
        }
        const inSealed = banished().includes(room());
        setAgitation(a=> Math.max(0, a - (inSealed ? 3 : 1)));
    }, 4000);

    every(() => {
        if (scared() || won()) {
            return;
        }
        const g = ghostRoom(), p = room();
        const base = g === p ? 4 : ADJACENT[p].includes(g) ? 2 : 1;
        const spike = Math.random() < 0.12 ? 2 : 0;
        setEmfLevel(Math.min(5, base + Math.floor(Math.random() * 2) + spike));
    }, 1800);

    every(() => {
        if (scared() || won()){
            return;
        }
        if (ghostRoom() === room()) {
            bump(2);
        }
    }, 5000);


}

export function stopEvents(){
    timeouts.forEach(clearTimeout);
    intervals.forEach(clearInterval);

    timeouts = [];
    intervals = [];
}

function scheduleRandomEvent() {
    later(() => {
        if (scared() || won()) {
            return;
        }
        const eve = EVENTS[Math.floor(Math.random() * EVENTS.length)];

        setEventText(eve.text);
        bump(eve.bumpVal);
        if (eve.sound === 'creak') {
            creak();
        } else if (eve.sound === 'knock') {
            knock();
        } else if (eve.sound === 'burst') {
            burst(0.15, 250);
        }
        later(() => setEventText(''), 3500);
        scheduleRandomEvent();
    }, 12000 + Math.random() * 20000);
}

function scheduleGhostMove() {
    later(() => {
        if (scared() || won()) {
            return;
        }
        const current = ghostRoom();
        const opts = ADJACENT[current].filter(r => !banished().includes(r));
        if (opts.length) {
            const next = opts[Math.floor(Math.random() * opts.length)] as roomId;
            setGhostRoom(next);
            if (next === room()) {
                setEventText('a cold presence enters the room...')
                bump(15);
                creak();
                later(() => setEventText(''), 3000);
            }
        }
        scheduleGhostMove();
    }, 20000 + Math.random() * 25000);
}

function scheduleGhostFlash() {
    later(() => {
        if (scared() || won()) {
            return;
        }
        if (ghostRoom() === room() && agitation() > 30){
            setShowGhost(true);
            burst(0.05, 100);
            later(() => setShowGhost(false), 150 + Math.floor(Math.random() *200));
        }
        scheduleGhostFlash();
    }, 8000 + Math.random() * 12000);
}

function scheduleHeartbeat() {
    if (scared() || won()){
        return;
    }
    const a = agitation();
    if (a>50){
        heartbeat();
    }
    later(scheduleHeartbeat, a>85 ? 700 : a> 70 ? 950 : 1500);
}