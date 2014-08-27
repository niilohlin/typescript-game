module model {
    export enum Dir {Up, Down, Left, Right};

    export class Square {
        x : number;
        y : number;
        constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
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
        hor   : Movable;
        ver   : Movable;
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

    export interface Level {
        level:  number;
        hole:   number[];
        ver:    number[];
        hor:    number[];
        walls:  number[][];
        width:  number;
        height: number;
    }
    class LevelLoader {
        loadLevel(gs : GameState, level: number):void {
            if(level >= this.levels.length) {
                throw Error("oops, no levels left");
            }
            this.loadGameState(gs, this.levels[level]);
        }

        loadGameState(gs: GameState, json:Level) {
            gs.width = json.width;
            gs.height = json.height;
            gs.walls = [];
            for(var i :number = 0; i < json.walls.length; i++) {
                gs.walls.push(new Wall(json.walls[i][0], json.walls[i][1]));
            }
            gs.hole = new Hole(json.hole[0], json.hole[1]);
            gs.hor = new Movable(gs, json.hor[0], json.hor[1]);
            gs.ver = new Movable(gs, json.ver[0], json.ver[1]);
        }


        private levels:Level[] = [
             {"level":0, "width": 5, "height": 5, "walls": [], "ver": [3, 3], "hor": [1, 1], "hole": [3, 1]}
            ,{"level":1, "width": 5, "height": 5, "walls": [], "ver": [3, 2], "hor": [1, 2], "hole": [4, 2]}
            ,{"level":2, "width": 6, "height": 5, "walls": [[3, 3]], "ver":[1, 3], "hor": [2, 3], "hole": [4, 3]}
            ,{"level":3, "width": 9, "height": 7, "walls": [[3, 3], [5, 1], [2, 3]], "ver":[1, 3], "hor": [3, 2], "hole": [4, 3]}
                                ];
    }
}
