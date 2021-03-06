/// <reference path="model.ts" />
/// <reference path="controller.ts" />
/// <reference path="util.ts" />

module view {

    export class View {
        gameState : model.GameState;
        eventHandler : controller.EventHandler;
        constructor(gs: model.GameState, ev: controller.EventHandler) {
            GUARD(gs, ev);
            this.gameState = gs;
            this.eventHandler = ev;

            var up = document.createElement("button");
            up.innerText = "Up";

            up.onclick = (function() {
                this.eventHandler.moveEvent(model.Dir.Up);
            }.bind(this));
            document.body.appendChild(up);

            var down = document.createElement("button");
            down.innerText = "Down";

            down.onclick = (function() {
                /* "this" refers to the anynomus function instead of the class
                   ergo the "ev" closure */
                ev.moveEvent(model.Dir.Down);
            });
            document.body.appendChild(down);
            var left = document.createElement("button");
            left.innerText = "Left";

            left.onclick = (function() {
                /* "this" refers to the anynomus function instead of the class
                   ergo the "ev" closure */
                ev.moveEvent(model.Dir.Left);
            });
            document.body.appendChild(left);
            var right = document.createElement("button");
            right.innerText = "Right";

            right.onclick = (function() {
                /* "this" refers to the anynomus function instead of the class
                   ergo the "ev" closure */
                ev.moveEvent(model.Dir.Right);
            });
            document.body.appendChild(right);

            var restart = document.createElement("button");
            restart.innerText = "restart";

            restart.onclick = (function() {
                /* "this" refers to the anynomus function instead of the class
                   ergo the "ev" closure */
                ev.restartEvent();
            });
            document.body.appendChild(restart);
        }

        render () : void {
            var disp: string[][] = [];
            for(var i:number = 0; i < this.gameState.height; i++) {
                disp[i] = [];
                for(var j: number = 0; j < this.gameState.width; j++) {
                    disp[i][j] = ' ';
                }
            }

            if(!this.gameState.hor.inHole) {
                disp[this.gameState.hor.y][this.gameState.hor.x] = '=';
            }
            if(!this.gameState.ver.inHole) {
                disp[this.gameState.ver.y][this.gameState.ver.x] = '|';
            }
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

    export class GUI extends View {
        canvas : HTMLCanvasElement;
        ctx;
        width : number;
        height : number;
        squareWidth : number;
        squareHeight : number;
        constructor(gs: model.GameState, ev: controller.EventHandler) {
            super(gs, ev);
            this.canvas = <HTMLCanvasElement> document.getElementById("canvas");
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.ctx = this.canvas.getContext("2d");
            this.clearScreen();
            this.squareWidth = this.width / gs.width;
            this.squareHeight = this.height / gs.height;
            this.canvas.onkeypress = (function(evt) {
                var charCode: number = evt.which;
                var charStr : string = String.fromCharCode(charCode);
                if(charStr == 'w' || charCode == 38) {
                    ev.moveEvent(model.Dir.Up);
                } else if(charStr == 's' || charCode == 40) {
                    ev.moveEvent(model.Dir.Down);
                } else if(charStr == 'a' || charCode == 37) {
                    ev.moveEvent(model.Dir.Left);
                } else if(charStr == 'd' || charCode == 39) {
                    ev.moveEvent(model.Dir.Right);
                } else if(charStr == ' ') {
                    ev.restartEvent();
                }
            });
        }

        drawSquare(square : model.Square, color : string) {
            // Nullcheck because things might be null when editing levels.
            if(square == null) {
                return;
            }
            this.ctx.fillStyle = color;
            this.ctx.fillRect(square.x * this.squareWidth , square.y * this.squareHeight, this.squareWidth, this.squareHeight);
        }
        clearScreen() {
            this.squareWidth = this.width / this.gameState.width;
            this.squareHeight = this.height / this.gameState.height;
            this.ctx.fillStyle = "#FFFFFF";
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.strokeStyle = "#000000";
            this.ctx.rect(0, 0, this.width, this.height);
            this.ctx.stroke();
        }
        drawLinesOnSquares() {
            this.ctx.fillStyle = "#000000";
            var hor: model.Movable = this.gameState.hor;
            var ver: model.Movable = this.gameState.ver;
            var lineWidth : number = 10;

            if(hor != null) {
                this.ctx.fillRect(hor.x * this.squareWidth, hor.y * this.squareHeight + this.squareHeight / 2 - lineWidth / 2,
                                  this.squareWidth, lineWidth);
            }
            if(ver != null) {
                this.ctx.fillRect(ver.x * this.squareWidth + this.squareWidth / 2 - lineWidth / 2, ver.y * this.squareHeight,
                                  lineWidth, this.squareHeight);
            }
        }
        render() {
            this.clearScreen();

            var blue : string = "#0000FF";
            var red  : string = "#FF0000";
            var black: string = "#000000";

            this.drawSquare(this.gameState.hor, blue);
            this.drawSquare(this.gameState.ver, blue);
            this.drawLinesOnSquares();

            for(var i : number = 0; i < this.gameState.walls.length; i++) {
                this.drawSquare(this.gameState.walls[i], red);

            }
            this.drawSquare(this.gameState.hole, black);
        }
    }

    export class EditorGUI extends GUI {
        currentSquare: model.Square;
        constructor(gs: model.GameState, ev: controller.EventHandler) {
            super(gs, ev);
            this.canvas.onclick = (function(e) {
                GUARD(this.currentSquare);
                var v = this.getSquare(e);
                LOG("this.squareHeight = " + this.squareHeight);
                LOG("x = " + e.clientX + ", y = " + e.clientY);
                LOG("clicking on x = " + v.x + ", y = " + v.y);
                if(this.currentSquare == model.Wall) {
                    this.gameState.walls.push(new model.Wall(v.x, v.y));
                }
            }.bind(this));

            var wall = document.createElement("button");
            wall.innerText = "wall";

            wall.onclick = (function() {
                this.currentSquare = model.Wall;
                LOG("setting current square to wall");
            }.bind(this));
            document.body.appendChild(wall);
        }

        getSquare(e : any): model.Vector {
            return {
                x: Math.floor(e.clientX / this.squareWidth),
                y: Math.floor(e.clientY / this.squareHeight)
            };
        }
    }
}
