import { createSignal } from "solid-js";
import {silence, sting} from './audio';

export type roomId = 'hallway' | 'bedroom' | 'basement';
export type Tool = 'hand' | 'radio' | 'emf' | 'flashlight' | 'salt';

export const [ started, setStarted ] = createSignal(false);
export const [ reduced, setReduced] = createSignal(false);
export const [ room, setRoom] = createSignal<roomId>('hallway');
export const [ tool, setTool] = createSignal<Tool>('hand');
export const [agitation, setAgitation] = createSignal(0);
export const[saltLeft, setSaltLeft] = createSignal(3);
export const [banished, setBanished] = createSignal<roomId[]>([]);
export const [scared, setScared] = createSignal(false);
export const [radioLine, setRadioLine] = createSignal('');
export const [busy, setBusy] = createSignal(false);

export const won = () => banished().length >= 2;

export const level = () => {
    const a = agitation();
    return a < 25 ? 0 : a <50?1:a <75 ? 2 :3;
};

let scareQueued = false;

export function bump(n:number) {
    if (won()) return;
    setAgitation((a) => Math.min(100, a + n));
    if (agitation() >= 100 && !scareQueued) {
        scareQueued = true;
        silence();
        setTimeout(() => {
            setScared(true);
            sting();
        }, 2500);
    }
}