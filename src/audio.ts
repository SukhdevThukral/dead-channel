let ctx: AudioContext | undefined;
let buf: AudioBuffer | undefined;
let staticGain: GainNode | undefined;
let muted = false;

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
    noise().connect(staticGain).connect(ctx.destination);

    const loop = noise();
    loop.connect(staticGain);
    loop.start();
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

export function sting() {
    if (!ctx) return;
    const g = ctx.createGain();
    g.gain.value = 1;

    const s = noise();
    s.connect(g).connect(ctx.destination);
    s.start();
    s.stop(ctx.currentTime + 0.9);
}