/// <reference path="model.ts" />

module controller {

    class AbstractEvent {
        constructor(public gameState: model.GameState){}
        handle() : void {
            throw new Error("Abstact method");
        }
    }

    class MoveEvent extends AbstractEvent {
        direction : model.Dir;
        constructor(gs: model.GameState, private eventHandler: EventHandler, d: model.Dir) {
            super(gs);
            this.direction = d;
        }
        private inBounds(x: number, y: number) : boolean {
            return x >= 0 && x < this.gameState.width && y >= 0 && y < this.gameState.height;
        }
        private dirToVector(d: model.Dir): model.Vector {
            if(d == model.Dir.Up) {
                return {x: 0, y: -1};
            } else if(d == model.Dir.Down) {
                return {x: 0, y: 1};
            } else if(d == model.Dir.Right) {
                return {x: 1, y: 0};
            } else if(d == model.Dir.Left) {
                return {x: -1, y: 0};
            }

        }
        canMove(movable : model.Movable, d: model.Dir) {
            if(movable.inHole) {
                return true;
            }
            var hypotheticalX:number = movable.x;
            var hypotheticalY:number = movable.y;

            if(d == model.Dir.Up) {
                hypotheticalY -= 1;
            } else if(d == model.Dir.Down) {
                hypotheticalY += 1;
            } else if(d == model.Dir.Right) {
                hypotheticalX += 1;
            } else if(d == model.Dir.Left) {
                hypotheticalX -= 1;
            }
            if(! this.inBounds(hypotheticalX, hypotheticalY)) {
                return;
            }
            for(var i : number = 0; i < this.gameState.walls.length; i++) {
                var w : model.Wall = this.gameState.walls[i];
                if(w.x == hypotheticalX && w.y == hypotheticalY) {
                    return false;
                }
            }
            if(this.gameState.ver.x == hypotheticalX && this.gameState.ver.y == hypotheticalY) {
                return this.canMove(this.gameState.ver, d);
            } else if(this.gameState.hor.x == hypotheticalX && this.gameState.hor.y == hypotheticalY) {
                return this.canMove(this.gameState.hor, d);
            }
            return true;
        }

        move(movable : model.Movable, d: model.Dir) {
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
            if(! this.inBounds(hypotheticalX, hypotheticalY)) {
                return;
            }

            if(this.gameState.ver.x == hypotheticalX && this.gameState.ver.y == hypotheticalY) {
                this.move(this.gameState.ver, d); // Change to event.
            } else if(this.gameState.hor.x == hypotheticalX && this.gameState.hor.y == hypotheticalY) {
                this.move(this.gameState.hor, d); // Change to event.

            }
            movable.x = hypotheticalX;
            movable.y = hypotheticalY;

            if(movable.x == this.gameState.hole.x && movable.y == this.gameState.hole.y) {
                movable.inHole = true;
                if(this.gameState.hasWon()) {
                    this.eventHandler.winEvent();
                }
            }
        }

        handle() : void {
            var player : model.Movable = null;
            if(this.direction == model.Dir.Up ||
               this.direction == model.Dir.Down) {
                player = this.gameState.ver;
            } else {
                player = this.gameState.hor;
            }
            if(this.canMove(player, this.direction)) {
                this.move(player, this.direction);
            } else {
                console.log("cant move that way");
            }
        }
    }

    class WinEvent extends AbstractEvent {
        constructor(gs: model.GameState) {
            super(gs);
        }
        handle() : void {
            this.gameState.nextLevel();
            this.gameState.loadLevel();
        }
    }

    class RestartEvent extends AbstractEvent {
        constructor(gs: model.GameState) {
            super(gs);
        }
        handle() : void {
            this.gameState.loadLevel();
        }
    }

    class Fifo<T> {
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
        // Acts as a factory.
        private fifo : Fifo<AbstractEvent> = new Fifo<AbstractEvent>();

        constructor(public gameState: model.GameState) {
        }

        nextEvent() : void {
            if(!this.fifo.empty()) {
                var e = this.fifo.next();
                e.handle();
            }
        }

        moveEvent(d: model.Dir): void {
            this.fifo.enqueue(new MoveEvent(this.gameState, this, d));
        }

        winEvent() : void {
            this.fifo.enqueue(new WinEvent(this.gameState));
        }

        restartEvent() : void {
            this.fifo.enqueue(new RestartEvent(this.gameState));
        }
    }
}
