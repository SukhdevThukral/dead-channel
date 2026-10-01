let ctx: AudioContext | undefined;
let buf: AudioBuffer | undefined;
let staticGain: GainNode | undefined;
let muted = false;

let droneOsc: OscillatorNode | undefined;
let droneGain: GainNode | undefined;

export function startDrone() {
    if (!ctx || droneOsc) return;
    droneOsc = ctx.createOscillator();
    droneGain = ctx.createGain();
    droneOsc.type = 'sine';
    droneOsc.frequency.value = 55;
    droneGain.gain.value = 0;
    droneOsc.connect(droneGain).connect(ctx.destination);
    droneOsc.start();
}

function noise(){
    const s = ctx!.createBufferSource();
    s.buffer = buf!;
    s.loop = true;
    return s;
}

export function startAudio(){
    window.speechSynthesis.getVoices();
    if (ctx) return;

    ctx = new AudioContext();
    buf = ctx.createBuffer(1, ctx.sampleRate*2, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i<data.length; i++) {
        data[i] = Math.random() * 2 -1;
    }

    staticGain = ctx.createGain();
    staticGain.gain.value = 0;

    const loop = noise();
    loop.connect(staticGain);
    loop.start();

    startDrone();
}

export function setStatic(volume: number){
    if (!ctx || muted) return;
    staticGain!.gain.setTargetAtTime(volume, ctx.currentTime, 0.05);
}

export function burst(volume = 0.25, ms =120) {
    if (!ctx || muted) return;

    const g = ctx.createGain();
    g.gain.value = volume;

    const s = noise();
    s.connect(g).connect(ctx.destination);
    s.start();
    s.stop(ctx.currentTime + ms / 1000);
}

export function silence() {
    muted= true;
    if (ctx) {
        staticGain!.gain.setTargetAtTime(0, ctx.currentTime , 0.02);
    }
}

export function heartbeat() {
    if (!ctx || muted){
        return;
    }
    const t = ctx.currentTime;
    const make  = (freq: number, vol: number, when: number, dur: number) => {
        const o = ctx!.createOscillator();
        const g = ctx!.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0, when);
        g.gain.linearRampToValueAtTime(vol,when+0.02);
        g.gain.exponentialRampToValueAtTime(0.001,when+dur);
        o.connect(g).connect(ctx!.destination);
        o.start(when);
        o.stop(when+dur);
    };
    make(60,0.7,t,0.28);
    make(50,0.5,t+0.18, 0.26);
}

export function creak(){
    if (!ctx || muted || !buf){
        return;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type ='bandpass';
    filt.frequency.value = 500 + Math.random() * 800;
    filt.Q.value = 18;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.1);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.3);
    src.connect(filt).connect(g).connect(ctx.destination);
    src.start();
    src.stop(ctx.currentTime + 1.3);
}

export function knock() {
    if (!ctx || muted) {
        return;
    }
    [0, 0.38, 0.76].forEach(dt => {
        const o = ctx!.createOscillator();
        const g = ctx!.createGain();
        o.type = 'sine';
        o.frequency.value = 90 + Math.random() * 50;
        const t = ctx!.currentTime + dt;
        g.gain.setValueAtTime(0.55, t);
        g.gain.exponentialRampToValueAtTime(0.001, t+0.14);
        o.connect(g).connect(ctx!.destination);
        o.start(t);
        o.stop(t + 0.14);
    });
}

export function sting() {
    if (!ctx) return;
    const g = ctx.createGain();
    g.gain.value = 1;

    const s = noise();
    s.connect(g).connect(ctx.destination);
    s.start();
    s.stop(ctx.currentTime + 0.9);
}

export function updateDrone(agitationRatio: number){
    if (!ctx || !droneGain || !droneOsc) return;
    droneGain.gain.setTargetAtTime(agitationRatio * 0.15, ctx.currentTime, 0.5);
    droneOsc.frequency.setTargetAtTime(55 + agitationRatio *40, ctx.currentTime, 0.5);
}

// win win
export function winSound() {
    if (!ctx) {
        return;
    }
    silence();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(220, ctx.currentTime);
    o.frequency.linearRampToValueAtTime(110, ctx.currentTime + 3);

    g.gain.setValueAtTime(0.3, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + 3);

    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 3);
}