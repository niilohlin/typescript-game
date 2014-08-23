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
            if(player.canMove(gs, this.direction)) {
                player.move(gs, this.direction);
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
    }

    export class EventHandler {
        fifo : Fifo<AbstractEvent> = new Fifo<AbstractEvent>();

        constructor(public gameState: model.GameState) {
        }

        nextEvent() : void {
            var e = this.fifo.next();
            e.handle(this.gameState);
        }

        addEvent(e : AbstractEvent) : void {
            this.fifo.enqueue(e);
        }

    }
}

module model {
    export enum Dir {Up, Down, Left, Right};

    export class Square {
        x : number;
        y : number;
        dim : number;
        constructor(x: number, y: number, dim: number = 10) {
            this.x = x;
            this.y = y;
            this.dim = dim;
        }
    }

    export class Hole extends Square {
        constructor(x: number, y: number) {
            super(x, y);
        }
    }

    export class Wall extends Square {
        constructor(x: number, y: number) {
            super(x, y);
        }
    }

    export class Movable extends Square {
        inHole : boolean = false;
        constructor(x: number, y: number) {
            super(x, y);
        }

        canMove(gs : GameState, d: Dir) : boolean {
            var hypotheticalX = this.x;
            var hypotheticalY = this.y;

            if(d == Dir.Up) {
                hypotheticalY -= 1;
            } else if(d == Dir.Down) {
                hypotheticalY += 1;
            } else if(d == Dir.Right) {
                hypotheticalX += 1;
            } else if(d == Dir.Left) {
                hypotheticalX -= 1;
            }
            for(var i : number = 0; i < gs.walls.length; i++) {
                var w : Wall = gs.walls[i];
                if(w.x == hypotheticalX && w.y == hypotheticalY) {
                    return false;
                }
            }
            if(gs.ver.x == hypotheticalX && gs.ver.y == hypotheticalY) {
                return gs.ver.canMove(gs, d);
            } else if(gs.hor.x == hypotheticalX && gs.hor.y == hypotheticalY) {
                return gs.hor.canMove(gs, d);
            }
            return true;
        }

        move(gs: GameState, d: Dir) : void {
            var hypotheticalX = this.x;
            var hypotheticalY = this.y;

            if(d == Dir.Up) {
                hypotheticalY -= 1;
            } else if(d == Dir.Down) {
                hypotheticalY += 1;
            } else if(d == Dir.Right) {
                hypotheticalX += 1;
            } else if(d == Dir.Left) {
                hypotheticalX -= 1;
            }
            if(gs.ver.x == hypotheticalX && gs.ver.y == hypotheticalY) {
               gs.ver.move(gs, d);
            } else if(gs.hor.x == hypotheticalX && gs.hor.y == hypotheticalY) {
                gs.hor.move(gs, d);
            }
            this.x = hypotheticalX;
            this.y = hypotheticalY;
        }
    }

    export class Horizontal extends Movable {
        constructor(x: number, y: number) {
            super(x, y);
        }
    }

    export class Vertical extends Movable {
        constructor(x: number, y: number) {
            super(x, y);
        }
    }

    class LevelLoader {
        loadLevel(gs : GameState, level: number) {
            gs.width = 9;
            gs.height = 9;
            gs.walls = [new Wall(1, 1), new Wall(7, 4), new Wall(6, 7)];
            gs.hole = new Hole(4, 2);
            gs.hor = new Horizontal(4, 3);
            gs.ver = new Vertical( 4, 6);
        }
    }

    export class GameState {
        constructor() {
            this.levelLoader = new LevelLoader();
        }
        private levelLoader : LevelLoader;
        private level : number = 0;
        width : number = 9;
        height: number = 9;
        walls : Wall[];
        hole  : Hole;
        hor   : Horizontal = new Horizontal(5, 5);
        ver   : Vertical;
        loadLevel() : void {
            this.levelLoader.loadLevel(this, this.level);
            this.hor.inHole = false;
            this.ver.inHole = false;
        }

        nextLevel() : void {
            this.level += 1;
        }

        hasWon() : boolean {
            return this.hor.inHole && this.ver.inHole;
        }
    }
}

module view {

    export class View {
        gameState : model.GameState;
        eventHandler : controller.EventHandler;
        constructor(gs: model.GameState, ev: controller.EventHandler) {
            this.gameState = gs;
            this.eventHandler = ev;

            var up = document.createElement("button");
            up.innerText = "Up";

            up.onclick = (function() {
                /* "this" refers to the anynomus function instead of the class
                   ergo the "ev" closure */
                ev.addEvent(new controller.MoveEvent(model.Dir.Up));
                ev.nextEvent();
            });
            document.body.appendChild(up);

            var down = document.createElement("button");
            down.innerText = "Down";

            down.onclick = (function() {
                /* "this" refers to the anynomus function instead of the class
                   ergo the "ev" closure */
                ev.addEvent(new controller.MoveEvent(model.Dir.Down));
                ev.nextEvent();
            });
            document.body.appendChild(down);
            var left = document.createElement("button");
            left.innerText = "Left";

            left.onclick = (function() {
                /* "this" refers to the anynomus function instead of the class
                   ergo the "ev" closure */
                ev.addEvent(new controller.MoveEvent(model.Dir.Left));
                ev.nextEvent();
            });
            document.body.appendChild(left);
            var right = document.createElement("button");
            right.innerText = "Right";

            right.onclick = (function() {
                /* "this" refers to the anynomus function instead of the class
                   ergo the "ev" closure */
                ev.addEvent(new controller.MoveEvent(model.Dir.Right));
                ev.nextEvent();
            });
            document.body.appendChild(right);

        }

        render () : void {
            var disp: string[][] = [];
            for(var i:number = 0; i < this.gameState.height; i++) {
                disp[i] = [];
                for(var j: number = 0; j < this.gameState.width; j++) {
                    disp[i][j] = ' ';
                }
            }

            disp[this.gameState.hor.y][this.gameState.hor.x] = '=';
            disp[this.gameState.ver.y][this.gameState.ver.x] = '|';
            disp[this.gameState.hole.y][this.gameState.hole.x] = 'O';
            for(var i:number = 0; i < this.gameState.walls.length; i++) {
                disp[this.gameState.walls[i].y][this.gameState.walls[i].x] = '#';
            }

            var rows : string[] = [];
            for(var i: number = 0; i < disp.length; i < i++) {
                rows[i] = disp[i].join("");
            }
            console.log(rows.join("\n"));
        }
    }
}

function main() {
    var gameState : model.GameState = new model.GameState();
    gameState.loadLevel();
    var eventHandler : controller.EventHandler = new controller.EventHandler(gameState);
    var cli : view.View = new view.View(gameState, eventHandler);
    cli.render();
    function callRender() {
        cli.render();
    }
    setInterval(callRender, 100);
}
main();
