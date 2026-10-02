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
            bedroom :{x: 38, y: 30, w: 24, h: 45},
            basement : {x: 5, y: 40, w: 15, h: 45},
            
        },anchor: {name: 'barred door', spot:{x:3, y :20, w:12, h:55}},
        examine: [
            [
                'a long corridor, fluorescent light hums overhead.',
                'barred doors line the left wall. all of them locked.',
                'something at the far end. probably nothing (hopefully)'
            ],
            [
                'the light flickers. for a second',
                'one of the barred doors is slightly open now.',
                'the shadow at the end of the corridor has not moved yet.',
            ],
            [
                'the light burns brighter than it should.',
                'scratch marks are on the inside of the bars. from inside.',
                'the shadow at the end is closer.. you did not see it move at all.',
            ],
            [
                'the light dies for a moment. something breathes nearby.',
                'all the bars are open now. you closed them.',
                'the shadow is right behind you. do not turn around.',
            ]
        ],
        flashlightReveal: "the beam catches something on the far wall. written in what looks like rust: ONE OF US NEVER LEFT..",
    },

    bedroom: {
        img: '/rooms/bedroom.png',
        exits: {hallway: {x:82, y:15, w:14, h:75}},
        anchor: { name: 'window', spot: { x: 30, y: 8, w: 38, h: 50 }},
        examine: [
            [
                'an empty bed. sheets been twisted like someone left in a hurry',
                'a clock on the wall. it has stopped at 3:16',
                'curtains moving against a closed window..',
            ],
            [
                'the bed has an impression in it. looks fresh.',
                "the clock has started ticking again. but backwards",
                'something is behind the curtains. a shape.',
            ],
            [
                'the sheets seem warm. someone was probably just here',
                'the clock reads 3:14 again. it never left apparently..',
                'the shape behind the curtain has not moved at all. it seems to wait.',
            ],
            [
                'there is a second impression in the best. almost your size.',
                'the clock falls off the wall. the hands keep moving.',
                'the curtain pulls back on its own. nothing is there. nothing is visible.',
            ],
        ],
        flashlightReveal: "the light finds the clock face. behind the glass, a note: YOU HAVE BEEN HERE BEFORE.",
    },

    basement: {
        img: '/rooms/basement.png',
        exits: {hallway: {x:8, y:5, w:22, h:55}},
        anchor: {name: 'cage', spot: {x:38, y:25, w:22, h:50}},
        examine: [
            [
                'wooden stairs descent into dark. pipes cross the ceiling.',
                'a cage structure in the cnter. door hanging open..',
                'shelves along the far wall. jars of something dark.',
            ],
            [
                'the cage door is closing now. you did not close it.',
                'the pipes knock once. then silence.',
                'one of the jars has fallen. the liquid does not spread.',
            ],
            [
                'something has been inside the cage recently. very recently..',
                'the pipes are too warm. much too warm.',
                'the liquid from the jar moves slowly toward the stairs.'
            ],
            [
                'the cage is locked. from the inside.',
                'the pipes screamed for exactly one second.',
                "the liquid has stopped at you feet. it is waiting.",
            ],
        ],
        flashlightReveal: 'the beam has hit the cage. scratched into the wood floor inside it: IT LOCKS FROM THE OUTSIDE. THIS IS A LIE.',
    },
};