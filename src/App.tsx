import {For, Show, createEffect} from 'solid-js';
import {ROOMS} from './rooms';
import {ask, QUESTIONS, startVoice, stopVoice, type Question} from './radio';

import {
  started, setStarted, reduced, setReduced, room, setRoom, tool, setTool,
  agitation, level, bump, banished, setBanished, saltLeft, setSaltLeft, 
  scared, won, radioLine, busy, voiceOn, setVoiceOn, voiceDenied, setVoiceDenied, type roomId, type Tool, 
} from './state';

import {startAudio, setStatic} from './audio';

const TOOLS: Tool[] = ['hand', 'radio', 'emf', 'flashlight', 'salt'];

export default function App(){
  const current = () => ROOMS[room()];

  const begin = (reduce: boolean) => {
    setReduced(reduce);
    startAudio();
    setStarted(true);
  };

  createEffect(() => {
    if (!started()) return;
    setStatic(tool() === 'radio' ? 0.02 + level() * 0.02 : 0);
  });

  const useAnchor = () => {
    if (tool() === 'salt' && saltLeft() > 0) {
      setSaltLeft(saltLeft() - 1);
      setBanished([...banished(), room()]);
    } else {
      bump(10);
    }
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

  return (
    <div class="game" classList={{reduced: reduced()}} style={{'--agitation':agitation() / 100}}>
      <Show when={!started()}>
        <div class='landing'>
          <div class='landing-inner'>
            <div class='landing-tag'> · FIELD INVESTIGATION KIT</div>
            <h1 class='landing-title'>DEAD<br/>CHANNEL</h1>
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
        <div class='room' style={{'background-image':`url(${current().img})`}}>
          <For each={Object.entries(current().exits)}>
            {([to, s]) => (
              <button class='hotspot' style={{left: `${s!.x}%`, top: `${s!.y}%`, width: `${s!.w}%`, height: `${s!.h}%`}} onClick={() => {setRoom(to as roomId); bump(2); }}/>
            )}
          </For>

          <Show when={current().anchor && !banished().includes(room())}>
            <button class='hotspot anchor' style={{left: `${current().anchor!.spot.x}%`, top: `${current().anchor!.spot.y}%`,
                width: `${current().anchor!.spot.w}%`, height: `${current().anchor!.spot.h}%`,}} onClick={useAnchor}/>
          </Show>
        </div>

        <Show when={tool() === 'radio'}>
          <div class='radio'>
            <div class='radio-screen'>{radioLine() || '~ static ~'}</div>
            <div class='radio-buttons'>
              <For each={Object.keys(QUESTIONS) as Question[]}>
                {(q) => <button disabled={busy()} onClick={()=> ask(q)}>{QUESTIONS[q]}</button>}
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
        <div class='jumpscare'/>
        <div class='end lost'>
          <h2>SIGNAL LOST</h2>
          <button onClick={() => location.reload()}>try again</button>
        </div>
      </Show>

      <Show when={won() && !scared()}>
        <div class='end'>
          <h2>THE CHANNEL GOES QUIET</h2>
          <button onClick={() => location.reload()}>play again</button>
        </div>
      </Show>
    </div>
  );
}
