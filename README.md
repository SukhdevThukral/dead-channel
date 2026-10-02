>_a browser horror game speedrun (i swear its my last one), where you investigate an abandoned location wiht a "creature" in it._

<br>

## what ts is

youre a field investigator, with an inventory - a radio, an EMF meter, a flashlight, and a salt shaker (please dont ask me why the shaker).

a presecne watches u and your job is to weaken it and seal it out of the 2 rooms before the agitation bar is filled and it takes you instead :D.

the ghost is gonna move, the lights grow dimmer, the doors lock on their own.

## how ts was built

for this, ive used [SolidJS](https://www.solidjs.com/) and [Typescript](https://www.typescriptlang.org/) for all the reactive states, UI, WebAudio API for everything sound related - all synthesized :p except the ambient music loop, WebSpeech API for voice recoginition and ghost's speech synthesis, and again as always Vanilla CSS for the atmosphere and the style. so basically zero runtime dependencies besides SolidJS :D

## how ts works

- rooms - hallway, bedroom, basement, you click on the hotspots made on the falls (transparent) to move between them. the ghost has its own locaiton and roams independently, so you will want to track it.

- tools (switch from the toolbar at the bottom):
1. hand - use to examine room, text changes with the level of agitation of the creature - but it gets worse the closer you are to losing.

2. radio - you get an option to ask 3 questions. its replies are angrier at the higher levels - yo can use your actual mice (but to only those three questions for now D: )

3. emf - it shows you ghost's proximity

4. flashlight - it obviously makes the room brighter, and the hotspots become more visible.

5. salt(3) - this is the seal tool, you have to weaken the ghost first via radio (to distract it), then place salt at the anchor point in the same room.

- agitation - it goes up with everything you do, moving rooms, using tools, getting caught near the ghost, doesnt go down unless you seal a room.

- win condition :D - seal the ghost out of the 2 rooms.

## running ts locally

you'll NEED [Node.js](https://nodejs.org/en)

```
npm install
npm run dev
```

then you can just open the localhost link with the port 5173 and yay thats your entire setup.

things worth knowing while testing:
 - the radio is using WebSpeech API and specifically looks for "Google UK English Male" / "David" and if neither is available on your sytem the ghost will still reply visually js without the voice.
 - seal logic requires the ghost to be weakened (8s window after the radio reply) AND in the same room as you, AND YOU NEED TO click the anchor hotspot.

## assets

i tried making the most of the visuals except the rooms i copied them from the internet so :p (well i tried at very least)
- tools :

<br>

- logo : 

## agitation levels (the boring part as always)
`0` - calm, the room is normal and ghost replies are cryptic but mild at very least.

`1` (25+) - examine text starts getting annoying

`2` (50+) - the ghost starts getting restless and the replies are less cooperative as compared to before.

`3` (75+) - examine text gets actively threatening, heartbeat kicks in and EMF starts spiking.

`4` (100) - you lose and the signal's lost :p

## accessibility (though id add ts asw)

ive added a content warning on the landing screen, since it contains flashing, visual changes, loud static noise and it may affect people with photosensitive epilepsy.

you can use the *REDUCED EFFECTS* mode though as it turns off the jumpscare, flashes, glitch and animatins, its fully playable but not as enjoyable as the prior.

headphones are recommeneded btw.