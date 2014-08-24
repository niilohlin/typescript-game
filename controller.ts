/// <reference path="model.ts" />

module controller {

    export class AbstractEvent {
        handle(gs: model.GameState) : void {
            throw new Error("To be overwritten");
        }
    }

    export class MoveEvent extends AbstractEvent {
        direction : model.Dir;
        constructor(d: model.Dir) {
            super();
            this.direction = d;
        }
        canMove(gs: model.GameState, movable : model.Movable, d: model.Dir) {
            var hypotheticalX = movable.x;
            var hypotheticalY = movable.y;

            if(d == model.Dir.Up) {
                hypotheticalY -= 1;
            } else if(d == model.Dir.Down) {
                hypotheticalY += 1;
            } else if(d == model.Dir.Right) {
                hypotheticalX += 1;
            } else if(d == model.Dir.Left) {
                hypotheticalX -= 1;
            }
            for(var i : number = 0; i < gs.walls.length; i++) {
                var w : model.Wall = gs.walls[i];
                if(w.x == hypotheticalX && w.y == hypotheticalY) {
                    return false;
                }
            }
            if(gs.ver.x == hypotheticalX && gs.ver.y == hypotheticalY) {
                return this.canMove(gs, gs.ver, d);
            } else if(gs.hor.x == hypotheticalX && gs.hor.y == hypotheticalY) {
                return this.canMove(gs, gs.hor, d);
            }
            return true;
        }

        move(gs: model.GameState, movable : model.Movable, d: model.Dir) {
            if(movable.inHole) {
                return;
            }
            var hypotheticalX = movable.x;
            var hypotheticalY = movable.y;

            if(d == model.Dir.Up) {
                hypotheticalY -= 1;
            } else if(d == model.Dir.Down) {
                hypotheticalY += 1;
            } else if(d == model.Dir.Right) {
                hypotheticalX += 1;
            } else if(d == model.Dir.Left) {
                hypotheticalX -= 1;
            }
            if(gs.ver.x == hypotheticalX && gs.ver.y == hypotheticalY) {

                this.move(gs, gs.ver, d); // Change to event.
            } else if(gs.hor.x == hypotheticalX && gs.hor.y == hypotheticalY) {
            this.move(gs, gs.hor, d); // Change to event.

            }
            movable.x = hypotheticalX;
            movable.y = hypotheticalY;

            if(movable.x == gs.hole.x && movable.y == gs.hole.y) {
                movable.inHole = true;
                if(gs.hor.inHole && gs.ver.inHole) {
                    console.log("you won");
                    throw new Error("not Implemented yet");
                }
            }
        }

        handle(gs: model.GameState) : void {
            var player : model.Movable = null;
            if(this.direction == model.Dir.Up ||
               this.direction == model.Dir.Down) {
                player = gs.ver;
            } else {
                player = gs.hor;
            }
            if(this.canMove(gs, player, this.direction)) {
                this.move(gs, player, this.direction);
            } else {
                console.log("cant move that way");
            }
        }
    }

    export class WinEvent extends AbstractEvent {
        handle(gs: model.GameState) : void {
            gs.nextLevel();
            gs.loadLevel();
        }
    }

    export class RestartEvent extends AbstractEvent {
        handle(gs: model.GameState) : void {
            gs.loadLevel();
        }
    }

    export class Fifo<T> {
        private queue: Array<T> = [];
        next() : T {
            return this.queue.shift();
        }

        enqueue(obj: T) : void {
            this.queue.push(obj);
        }

        empty() : boolean {
            return this.queue.length == 0;
        }
    }

    export class EventHandler {
        fifo : Fifo<AbstractEvent> = new Fifo<AbstractEvent>();

        constructor(public gameState: model.GameState) {
        }

        nextEvent() : void {
            if(!this.fifo.empty()) {
                var e = this.fifo.next();
                e.handle(this.gameState);
            }
        }

        addEvent(e : AbstractEvent) : void {
            this.fifo.enqueue(e);
        }

    }
}
