import { DIRECTIONS, OBJECT_TYPE } from './setup';

//basic random movement
export function randomMovement(position, direction, objectExists) {
    let dir = direction;
    let nextMovePos = position + dir.movement;

    //create array of direction fom object keys
    const keys = Object.keys(DIRECTIONS);

    while (
        objectExists(nextMovePos, OBJECT_TYPE.WALL) ||
        objectExists(nextMovePos, OBJECT_TYPE.GHOST)
    ) {
        //get random key from array
        const key = keys[Math.floor(Math.random() * keys.length)];
        //set new move and position
        dir = DIRECTIONS[key];
        nextMovePos = position + dir.movement;
    }

    return { nextMovePos, direction: dir };
}
