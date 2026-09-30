import {level, bump, busy, setBusy,setRadioLine} from './state';
import { burst } from './audio';

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

export async function ask(q: Question) {
    if (busy()) return;
    setBusy(true);

    bump(last === q ? 12:6);
    last = q;

    setRadioLine('');
    burst(0.3, 400);
    await sleep(600);

    const pool = REPLIES[q][level()];
    const reply = pool[Math.floor(Math.random() * pool.length)];

    for (const word of reply.split(' ')){
        await sleep(350 + Math.random()*400);
        burst(0.12, 90);
        speak(word);
        setRadioLine((line) => (line ? line + ' ' : '') + word);
    }

    setBusy(false);
}

async function speak(word: string): Promise<void> {
    const say = (voices: SpeechSynthesisVoice[]) => {
        const u = new SpeechSynthesisUtterance(word);
        u.rate = 0.6;
        u.pitch = 0.1;
        u.volume = 0.9;
        const dark = voices.find(v => 
            v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('mark') || v.name.toLowerCase().includes('daniel') 
        );
        if (dark) u.voice = dark;
        window.speechSynthesis.speak(u);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0){
        say(voices);
    } else {
        window.speechSynthesis.onvoiceschanged = () => {
            say(window.speechSynthesis.getVoices());
            window.speechSynthesis.onvoiceschanged = null;
        };
    }
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
            if (recognition){
                recognition.start();
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