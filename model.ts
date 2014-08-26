
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
            gs.walls = [new Wall(1, 1), new Wall(7, 4), new Wall(6, 7), new Wall(0, 4), new Wall(8, 3)];
            gs.hole = new Hole(4, 2);
            gs.hor = new Horizontal(gs, 4, 3);
            gs.ver = new Vertical(gs, 5, 6);
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
        hor   : Horizontal;
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
