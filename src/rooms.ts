import type { roomId } from "./state";

export type Spot = {x:number; y:number;w:number; h:number};

type Room = {
    img: string;
    exits: Partial<Record<roomId, Spot>>;
    anchor?: {name: string; spot: Spot};
    examine: string[][];
    flashlightReveal: string;
};

export const ROOMS: Record<roomId, Room> = {
    hallway: {
        img: '/rooms/hallway.png',
        exits: {
            bedroom :{x: 10, y: 30, w: 16, h: 45},
            basement: {x: 75, y:35, w:16, h:45},
        },
        examine: [
            [
                'the wallpaer is yellow and peeling',
                'dusty floorboards. nobody has been here in years',
                'a coat hangs by the door. a guest, long gone.'
            ],
            [
                'the wallpaper moves faintly. theres no draft.',
                'fresh scratch marks run along the floorboards.',
                'the coat is facing the wrong way.',
            ],
            [
                '"HELP" scratched into the baseboard. tiny, desperate letters.',
                'the scratch marks lead toward the basement door.',
                'something wet drips from the coat sleeve.',
            ],
            [
                'your name is on the wall. you never told it to anyone here.',
                'the scratch marks are still being made. nothing is making them.',
                'the coat hooks are all bent outward, away from the wall.',
            ]
        ],
        flashlightReveal: "Behind the wallpaper: a child's drawing of a family. one figure has been scratched out entirely.",
    },

    bedroom: {
        img: '/rooms/bedroom.png',
        exits: {hallway: {x:42, y:60, w:16, h:35}},
        anchor: { name: 'doll', spot: { x: 60, y: 55, w: 10, h: 18 }},
        examine: [
            [
                'a single bed, unmade. dust on every surface.',
                ' a porcelain doll sits on the dresser, facing the door.',
                'the mirror above the dresser is cracked.',
            ],
            [
                'the doll has moved since you entered. you did not touch it.',
                "the mirror shows a room that isnt this one.",
                'child-sized footprints in the dust lead to the bed',
            ],
            [
                'the doll is facing you now. you were not looking.',
                'something in the mirror moves when you stand still.',
                'the footprints are fresh. still pressing into the dust',
            ],
            [
                'the doll blinks',
                'your reflection in the mirror smiles... you did not..',
                'the footprints are wet. Small. Slow.',
            ],
        ],
        flashlightReveal: "under the bed: a journal. last entry dated the night of the incident. the final page reads only: SHE KNOWS..",
    },

    basement: {
        img: '/rooms/basement.png',
        exits: {hallway: {x:42, y:5, w:16, h:25}},
        anchor: {name: 'music box', spot: {x:30, y:65, w:10, h:12}},
        examine: [
            [
                'stone walls, damp. a strong smell of decay.',
                'old pipes running along the ceiling, leaving rust..',
                'a jukebox sits on a shelf, lid closed.',
            ],
            [
                'the music box is playing. you did not start it.',
                'water drips upward along the pipes',
                'something has been digging in the far corner.',
            ],
            [
                'the music box plays faster when you approach.',
                'the stone walls are warm upon touch.',
                'the hole in the corner is deeper now. very recent.'
            ],
            [
                'the music box will not stop.',
                'the walls pulse slowly, like breathing.',
                "something is at the edge of the hole. it is looking up at you.",
            ],
        ],
        flashlightReveal: 'Carved into the stone floor beneath the shelf: a circle of symbol surrounding a name. Your name.',
    },
};