
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
        constructor(public gameState: GameState, x: number, y: number) {
            super(x, y);
        }

        canMove(d: Dir) : boolean {
            var gs = this.gameState;
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
                return gs.ver.canMove(d);
            } else if(gs.hor.x == hypotheticalX && gs.hor.y == hypotheticalY) {
                return gs.hor.canMove(d);
            }
            return true;
        }

        move(d: Dir) : void {
            if(this.inHole) {
                return;
            }
            var gs = this.gameState;
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

                gs.ver.move(d);
            } else if(gs.hor.x == hypotheticalX && gs.hor.y == hypotheticalY) {
                gs.hor.move(d);
            }
            this.x = hypotheticalX;
            this.y = hypotheticalY;

            if(this.x == gs.hole.x && this.y == gs.hole.y) {
                this.inHole = true;
                if(gs.hor.inHole && gs.ver.inHole) {
                    console.log("you won");
                    throw new Error("not Implemented yet");
                }
            }
        }
    }

    export class Horizontal extends Movable {
        constructor(gs: GameState, x: number, y: number) {
            super(gs, x, y);
        }
    }

    export class Vertical extends Movable {
        constructor(gs: GameState, x: number, y: number) {
            super(gs, x, y);
        }
    }

    class LevelLoader {
        loadLevel(gs : GameState, level: number) {
            gs.width = 9;
            gs.height = 9;
            gs.walls = [new Wall(1, 1), new Wall(7, 4), new Wall(6, 7)];
            gs.hole = new Hole(4, 2);
            gs.hor = new Horizontal(gs, 4, 3);
            gs.ver = new Vertical(gs, 4, 6);
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
        hor   : Horizontal = new Horizontal(this, 5, 5);
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
