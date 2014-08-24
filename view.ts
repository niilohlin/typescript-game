/// <reference path="model.ts" />
/// <reference path="controller.ts" />

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
            });
            document.body.appendChild(up);

            var down = document.createElement("button");
            down.innerText = "Down";

            down.onclick = (function() {
                /* "this" refers to the anynomus function instead of the class
                   ergo the "ev" closure */
                ev.addEvent(new controller.MoveEvent(model.Dir.Down));
            });
            document.body.appendChild(down);
            var left = document.createElement("button");
            left.innerText = "Left";

            left.onclick = (function() {
                /* "this" refers to the anynomus function instead of the class
                   ergo the "ev" closure */
                ev.addEvent(new controller.MoveEvent(model.Dir.Left));
            });
            document.body.appendChild(left);
            var right = document.createElement("button");
            right.innerText = "Right";

            right.onclick = (function() {
                /* "this" refers to the anynomus function instead of the class
                   ergo the "ev" closure */
                ev.addEvent(new controller.MoveEvent(model.Dir.Right));
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
