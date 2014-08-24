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
        handle(gs: model.GameState) : void {
            var player : model.Movable = null;
            if(this.direction == model.Dir.Up ||
               this.direction == model.Dir.Down) {
                player = gs.ver;
            } else {
                player = gs.hor;
            }
            if(player.canMove(this.direction)) {
                player.move(this.direction);
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
