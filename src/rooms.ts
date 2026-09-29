import type { roomId } from "./state";

export type Spot = {x:number; y:number;w:number; h:number};

type Room = {
    img: string;
    exits: Partial<Record<roomId, Spot>>;
    anchor?: {name: string; spot: Spot};
};

export const ROOMS: Record<roomId, Room> = {
    hallway: {
        img: '/rooms/hallway.png',
        exits: {
            bedroom :{x: 10, y: 30, w: 16, h: 45},
            basement: {x: 75, y:35, w:16, h:45},
        },
    },
    bedroom: {
        img: '/rooms/bedroom.png',
        exits: {hallway: {x:42, y:60, w:16, h:35}},
        anchor: { name: 'doll', spot: { x: 60, y: 55, w: 10, h: 18 }},
    },
    basement: {
        img: '/rooms/basement.png',
        exits: {hallway: {x:42, y:5, w:16, h:25}},
        anchor: {name: 'music box', spot: {x:30, y:65, w:10, h:12}},
    },
};