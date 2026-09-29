import {For, Show, createEffect} from 'solid-js';
import {ROOMS} from './rooms';
import {ask, QUESTIONS, type Question} from './radio';

import {
  started, setStarted, reduced, setReduced, room, setRoom, tool, setTool,
  agitation, level, bump, banished, setBanished, saltLeft, setSaltLeft, 
  scared, won, radioLine, busy, type roomId, type Tool, 
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
    setStatic(tool() === 'radio' ? 0.04 + level() * 0.04 : 0);
  });

  const useAnchor = () => {
    if (tool() === 'salt' && saltLeft() > 0) {
      setSaltLeft(saltLeft() - 1);
      setBanished([...banished(), room()]);
    } else {
      bump(10);
    }
  };

  return (
    <div class="game" classList={{reduced: reduced()}} style={{'--agitation':agitation() / 100}}>
      <Show when={!started()}>
        <div class='landing'>
          <h1>DEAD CHANNEL</h1>
          <p class='warn'>
            CONTENT WARNING: sudden loud audio, flashing and darkening visuals, unsettling text and one jump scare. May affect people with photosensitive epilepsy. Headphones recommended.
          </p>
          <div class='landing-buttons'>
            <button onClick={() => begin(false)}>Continue</button>
            <button onClick={() => begin(true)}>Continue with reduced effects</button>
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
