import {level, bump, busy, setBusy,setRadioLine} from './state';
import { burst } from './audio';
import { setGhostWeakened } from './state';

export type Question = 'here' | 'name' | 'want';

export const QUESTIONS: Record<Question, string> = {
    here: 'Are you there?',
    name: "Whats your name?",
    want: 'What do you want?',
};

const REPLIES: Record<Question, string[][]> = {
    here: [
        ['yes', '...here', 'always'],
        ['still here', 'closer than you think', 'yes. stop asking'],
        ['i hear you', 'i am behind the door', 'STOP ASKING'],
        ['GET OUT', 'BEHIND you', 'I SEE YOU'],
    ],
    name: [
        ['no name', 'forgotten', 'you first'],
        ['you would not say it', 'it was taken', 'why do you want it'],
        ['NOT YOURS TO KNOW', 'stop', 'i will tell you when you leave'],
        ['NO NAME', 'RUN', 'YOURS SOON'],
    ],
    want: [
        ['company', 'to be heard', 'stay a while'],
        ['you to stay', 'the door is locked', 'listen'],
        ['YOU TO LEAVE', 'my house', 'STOP'],
        ['OUT', 'YOU', 'NOW'],
    ],
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let last: Question | null = null;

function pauseRecognition(){
    recognition?.stop();
}

function resumeRecognition(){
    if (recognition){
        try {
            recognition.start();
        } catch {
        }
    }
}

export async function ask(q: Question) {
    if (busy()) return;
    setBusy(true);
    window.speechSynthesis.cancel();

    bump(last === q ? 12 : 6);
    last = q;

    setRadioLine('');
    burst(0.3, 400);
    await sleep(600);

    const pool = REPLIES[q][level()];
    const reply = pool[Math.floor(Math.random() * pool.length)];
    const words = reply.split(' ');

    pauseRecognition();

    await new Promise<void>((resolve)=>{
        let i = 0;
        const next = () => {
            if (i >= words.length){ 
                resolve(); 
                return; 
            }
            const word = words[i++];
            setRadioLine((line) => (line ? line + ' ' : '') + word);

            const u = speakWord(word);
            u.onend   = () => { burst(0.04, 60); setTimeout(next, 200 + Math.random() * 200); };
            u.onerror = () => setTimeout(next, 400);
        };
        burst(0.04, 60);
        next();
    });

    resumeRecognition();
    setGhostWeakened(true);
    setTimeout(() => setGhostWeakened(false), 8000);
    setBusy(false);
}


function speakWord(word: string): SpeechSynthesisUtterance {
    const voices = window.speechSynthesis.getVoices();
    const u  = new SpeechSynthesisUtterance(word);
    const voice = 
        voices.find(v=> v.name === 'Google UK English Male') ?? voices.find(v=> v.name.toLowerCase().includes('david'));
    if (voice) {
        u.voice = voice;
    }
    u.rate = 0.4;
    u.pitch = 0;
    u.volume = 1;
    window.speechSynthesis.speak(u);
    return u;
}

let recognition: any = null;

export function startVoice(onDenied: () => void) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
        onDenied();
        return;
    }

    navigator.mediaDevices.getUserMedia({audio:true}).then((stream) => {
        stream.getTracks().forEach(t => t.stop());

        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (e: any) => {
            const transcript: string = e.results[e.results.length - 1][0].transcript.toLowerCase().trim();
            if (transcript.includes('there') || transcript.includes('hello') || transcript.includes('anyone'))
                ask('here');
            else if (transcript.includes('name') || transcript.includes('who'))
                ask('name');
            else if (transcript.includes('want') || transcript.includes('why'))
                ask('want');
            else
                bump(4);
        };

        recognition.onend = () => {
            if (!recognition){
                return;
            };
            if (!busy()) {
                try {
                    recognition.start();
                } catch {
                }
            };
        }

        recognition.onerror = (e:any) => {
            if (e.error === 'not-allowed' || e.error === 'service-not-allowed'){
                onDenied();
                recognition = null;
            }
        };

        recognition.start();

    }).catch(() => onDenied());
}


export function stopVoice() {
    const r = recognition;
    recognition = null;
    r?.stop();
}