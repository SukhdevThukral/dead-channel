import {For, Show, createEffect} from 'solid-js';
import {ROOMS} from './rooms';
import {ask, QUESTIONS, startVoice, stopVoice, type Question} from './radio';
import { startEvents, stopEvents } from './events';

import { doorsLocked, lightsOut, ghostWeakened } from './state';

import {
  started, setStarted, reduced, setReduced, room, setRoom, tool, setTool,
  agitation, level, bump, banished, setBanished, saltLeft, setSaltLeft, 
  scared, won, radioLine, busy, voiceOn, setVoiceOn, voiceDenied, setVoiceDenied, emfLevel, eventText, examineText, showGhost, type roomId, type Tool, setExamineText, ghostRoom,
  setAgitation, 
} from './state';

import {startAudio, setStatic, updateDrone, knock, winSound} from './audio';


const TOOLS: Tool[] = ['hand', 'radio', 'emf', 'flashlight', 'salt'];
const emf_label = ['', 'QUIET', 'FAINT', 'ACTIVE', 'STRONG', 'PEAK'];

export default function App(){
  const current = () => ROOMS[room()];
  let examineTimer: ReturnType<typeof setTimeout> | null = null;

  const begin = (reduce: boolean) => {
    setReduced(reduce);
    startAudio();
    setStarted(true);
    startEvents();
  };

  createEffect(() => {
    if (started() && won() && !scared()){
      winSound();
      
    }
  })

  createEffect(() => {
    if (!started()) return;
    setStatic(tool() === 'radio' ? 0.02 + level() * 0.02 : 0);
  });
  
  createEffect(() => {
    if (!started()) return;
    updateDrone(agitation() / 100);
  });

  const useAnchor = () => {
    if (tool() !== 'salt') {
      bump(10);
      return;
    }
    
    if (saltLeft() <= 0){
      showExamine('no salt remaining.', 2000);
    }

    if (!ghostWeakened()){
      showExamine('the presence resists. weaken it first.', 2500);
      return;
    }

    if (ghostRoom() !== room()){
      showExamine('the presence is not here. you need to find it first', 2500);
      bump(5);
      return;
    }

    setSaltLeft(saltLeft() - 1);
    setBanished([...banished(), room()]);
    setAgitation(a => Math.max(0, a - 20));

    knock();
    showExamine('the presence recoils and the room has been sealed.', 3500);
  };

  const toggleVoice=()=> {
    if (voiceOn()) {
      stopVoice();
      setVoiceOn(false);
    } else {
      startVoice(() => setVoiceDenied(true));
      setVoiceOn(true);
    }
  };

  const showExamine = (text: string, ms = 4500) => {
    if (examineTimer) {
      clearTimeout(examineTimer);
    }
    setExamineText(text);
    examineTimer = setTimeout(() => setExamineText(''), ms);
  };

  const examineRoom = () => {
    const texts = current().examine[level()];
    showExamine(texts[Math.floor(Math.random() * texts.length)]);
    bump(4);
  };

  const revealFlashlight = () => {
    showExamine(current().flashlightReveal,  6000)
    bump(7);
  };


  return (
    <div class="game" classList={{reduced: reduced(), 'pre-scare' : agitation() >= 90}} style={{'--agitation':agitation() / 100}}>
      <Show when={!started()}>
        <div class='landing'>
          <div class='landing-inner'>
            
            <div class='landing-tag'> · FIELD INVESTIGATION KIT</div>
            <h1 class='landing-title'>
              <span class='title-dead-row'>
                <img src='/logo.png' class='landing-logo' alt=''/>
                DEAD
              </span> <span class='title-channel'>CHANNEL</span>
            </h1>
            <div class='landing-divider'/>
            <div class='landing-cw'>
              <span class='cw-label'>⚠⚠ CONTENT WARNING </span>
              <p>
                This experience contains flashing and sudden visual changes, sudden loud audio, unsettling text, and jumpscare.<br/>
                It may affect people with photosensitive epilepsy.
              </p>
              <p class='headphones-note'>
                › Headphones are strongly recommended.
              </p>
            </div>

            <div class='landing-goal'>
              YOUR GOAL is to banish the presence from 2 rooms before the agitation of the creature reaches 100.
            </div>

            <div class='landing-buttons'>
              <button onClick={() => begin(false)}>
                ENTER WITH FULL EFFECTS
              </button>
              <button class='btn-reduced' onClick={() => begin(true)}>
                ENTER WITH REDUCED EFFECTS
              </button>
            </div>
            <div class='landing-footer'>
              SIGNAL ACTIVE · UNKNOWN LOCATION · PROCEED WITH CAUTION
            </div>
          </div>
        </div>
      </Show>

      <Show when={started()}>
        <div class='agitation-bar'>
          <div class='agitation-fill' style={{width: `${agitation()}%`}}/>
        </div>

        <div class='ghost-signal'>
          SIGNAL · {ghostRoom().toUpperCase()}
          {banished().includes(ghostRoom()) ? ' · SEALED' : ''}
        </div>

        <div class='room' classList={{'lights-out' : lightsOut(), 'flashlight-active' : tool() === 'flashlight'}} style={{'background-image':`url(${current().img})`}}>
          <Show when={showGhost()}>
            <div class='ghost-flash'/>
          </Show>

          <Show when={ghostWeakened()}>
            <div class='weakened-notice'>▸ SIGNAL DISRUPTED - PLACE SALT NOW.</div>
          </Show>

          <Show when={tool() === 'salt' && current().anchor && !banished().includes(room())}>
            <div class='anchor-hint'>
              USE SALT HERE: {current().anchor!.name.toUpperCase()}
            </div>
          </Show>

          <For each={Object.entries(current().exits)}>
            {([to, s]) => (
              <button class='hotspot' disabled={doorsLocked()} style={{left: `${s!.x}%`, top: `${s!.y}%`, width: `${s!.w}%`, height: `${s!.h}%`}} onClick={() => {setRoom(to as roomId); bump(2); }}/>
            )}
          </For>

          <Show when={current().anchor && !banished().includes(room())}>
            <button class='hotspot anchor' classList={{'anchor-ready' : tool() === 'salt', 'anchor-weakened' : tool() === 'salt' && ghostWeakened()}} style={{left: `${current().anchor!.spot.x}%`, top: `${current().anchor!.spot.y}%`,
                width: `${current().anchor!.spot.w}%`, height: `${current().anchor!.spot.h}%`,}} onClick={useAnchor}/>
          </Show>
        </div>

        <Show when={tool() === 'radio'}>
          <div class='radio'>
            <div class='radio-screen'>{radioLine() || '~ static ~'}</div>
            <div class='radio-buttons'>
              <For each={Object.keys(QUESTIONS) as Question[]}>
                {(q) => (
                  <button disabled={busy()} onClick={()=> ask(q)}>{QUESTIONS[q]}</button>
                )}
              </For>
            </div>
            <div class='voice-row'>
              <Show when={!voiceDenied()}>
                <button class='voice-btn' classList={{active: voiceOn()}} onClick={toggleVoice}>
                  {voiceOn() ? 'LISTENING..' : 'SPEAK TO IT'}
                </button>
              </Show>
              <Show when={voiceDenied()}>
                <span class='voice-denied'>mic denied - use the buttons above</span>
              </Show>
            </div>
          </div>
        </Show>

        <Show when={tool() === 'emf'}>
          <div class='emf-panel'>
            <div class='emf-reading' classList={{'emf-danger': emfLevel() >= 4}}>
              {emf_label[emfLevel()]}
            </div>
            <div class='emf-bars'>
              <For each={[1,2,3,4,5]}>
                {(n) => (
                  <div class='emf-bar' classList={{lit: emfLevel() >= n, danger: n >= 4 && emfLevel() >= n,}}/>
                  )}
              </For>
            </div>
            <img src='/emf-meter.png' class='emf-device-img' alt=''/>
          </div>
        </Show>

        <Show when={tool() === 'flashlight'}>
          <div class='flashlight-panel'>
            <img src='/flashlight.png' class='flashlight-img' alt='flash'/>
          </div>
          <div class='tool-panel'>
            <button class='tool-action-btn' onClick={revealFlashlight}>
              LOOK CAREFULLY
            </button>
          </div>
        </Show>

        <Show when={tool() === 'hand'}>
          <div class='hand-panel'>
            <img src='/hand.png' class='hand-img' alt=''/>
          </div>
          <div class='tool-panel'>
            <button class='tool-action-btn' onClick={examineRoom}>
              EXAMINE ROOM
            </button>
          </div>
        </Show>

        <Show when={tool() === 'salt'}>
          <div class='salt-panel'>
            <img src='/salt.png' class='salt-img' alt=''/>
          </div>
        </Show>

        <Show when={examineText()}>
          <div class='examine-result'>{examineText()}</div>
        </Show>

        <Show when={eventText()}>
          <div class='event-notification'>{eventText()}</div>
        </Show>

        <div class='hud-room'>
          {room().toUpperCase()}
          {banished().includes(room()) ? ' · SEALED' : ''}
        </div>

        <div class='toolbar'>
          <For each={TOOLS}>
            {(t) => (
              <button classList={{active: tool() === t}} onClick={() => setTool(t)}>
                {t}{t === 'salt' ? `(${saltLeft()})` : ''}
              </button>
            )}
          </For>
        </div>
      </Show>

      <Show when={scared()}>
        <div class='scare-flash'/>
        <div class='jumpscare'/>
        <div class='end lost'>
          <h2>SIGNAL LOST</h2>
          <button onClick={() => { stopEvents(); location.reload()} }>try again</button>
        </div>
      </Show>

      <Show when={won() && !scared()}>
        <div class='end'>
          <h2>THE CHANNEL GOES QUIET</h2>
          <button onClick={() => { stopEvents(); location.reload()}}>play again</button>
        </div>
      </Show>
    </div>
  );
}
