var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var model;
(function (model) {
    (function (Dir) {
        Dir[Dir["Up"] = 0] = "Up";
        Dir[Dir["Down"] = 1] = "Down";
        Dir[Dir["Left"] = 2] = "Left";
        Dir[Dir["Right"] = 3] = "Right";
    })(model.Dir || (model.Dir = {}));
    var Dir = model.Dir;
    ;

    var Square = (function () {
        function Square(x, y, dim) {
            if (typeof dim === "undefined") { dim = 10; }
            this.x = x;
            this.y = y;
            this.dim = dim;
        }
        return Square;
    })();
    model.Square = Square;

    var Hole = (function (_super) {
        __extends(Hole, _super);
        function Hole(x, y) {
            _super.call(this, x, y);
        }
        return Hole;
    })(Square);
    model.Hole = Hole;

    var Wall = (function (_super) {
        __extends(Wall, _super);
        function Wall(x, y) {
            _super.call(this, x, y);
        }
        return Wall;
    })(Square);
    model.Wall = Wall;

    var Movable = (function (_super) {
        __extends(Movable, _super);
        function Movable(gameState, x, y) {
            _super.call(this, x, y);
            this.gameState = gameState;
            this.inHole = false;
        }
        return Movable;
    })(Square);
    model.Movable = Movable;

    var LevelLoader = (function () {
        function LevelLoader() {
        }
        LevelLoader.prototype.loadLevel = function (gs, level) {
            gs.width = 9;
            gs.height = 9;
            gs.walls = [new Wall(1, 1), new Wall(7, 4), new Wall(6, 7), new Wall(0, 4), new Wall(8, 3)];
            gs.hole = new Hole(4, 2);
            gs.hor = new Movable(gs, 4, 3);
            gs.ver = new Movable(gs, 5, 6);
        };
        return LevelLoader;
    })();

    var GameState = (function () {
        function GameState() {
            this.level = 0;
            this.width = 9;
            this.height = 9;
            this.levelLoader = new LevelLoader();
        }
        GameState.prototype.loadLevel = function () {
            this.levelLoader.loadLevel(this, this.level);
            this.hor.inHole = false;
            this.ver.inHole = false;
        };

        GameState.prototype.nextLevel = function () {
            this.level += 1;
        };

        GameState.prototype.hasWon = function () {
            return this.hor.inHole && this.ver.inHole;
        };
        return GameState;
    })();
    model.GameState = GameState;
})(model || (model = {}));
/// <reference path="model.ts" />
var controller;
(function (controller) {
    var AbstractEvent = (function () {
        function AbstractEvent(gameState) {
            this.gameState = gameState;
        }
        AbstractEvent.prototype.handle = function () {
            throw new Error("Abstact method");
        };
        return AbstractEvent;
    })();
    controller.AbstractEvent = AbstractEvent;

    var MoveEvent = (function (_super) {
        __extends(MoveEvent, _super);
        function MoveEvent(gs, eventHandler, d) {
            _super.call(this, gs);
            this.eventHandler = eventHandler;
            this.direction = d;
        }
        MoveEvent.prototype.inBounds = function (x, y) {
            return x >= 0 && x < this.gameState.width && y >= 0 && y < this.gameState.height;
        };
        MoveEvent.prototype.canMove = function (movable, d) {
            var hypotheticalX = movable.x;
            var hypotheticalY = movable.y;

            if (d == 0 /* Up */) {
                hypotheticalY -= 1;
            } else if (d == 1 /* Down */) {
                hypotheticalY += 1;
            } else if (d == 3 /* Right */) {
                hypotheticalX += 1;
            } else if (d == 2 /* Left */) {
                hypotheticalX -= 1;
            }
            if (!this.inBounds(hypotheticalX, hypotheticalY)) {
                return;
            }
            for (var i = 0; i < this.gameState.walls.length; i++) {
                var w = this.gameState.walls[i];
                if (w.x == hypotheticalX && w.y == hypotheticalY) {
                    return false;
                }
            }
            if (this.gameState.ver.x == hypotheticalX && this.gameState.ver.y == hypotheticalY) {
                return this.canMove(this.gameState.ver, d);
            } else if (this.gameState.hor.x == hypotheticalX && this.gameState.hor.y == hypotheticalY) {
                return this.canMove(this.gameState.hor, d);
            }
            return true;
        };

        MoveEvent.prototype.move = function (movable, d) {
            if (movable.inHole) {
                return;
            }
            var hypotheticalX = movable.x;
            var hypotheticalY = movable.y;

            if (d == 0 /* Up */) {
                hypotheticalY -= 1;
            } else if (d == 1 /* Down */) {
                hypotheticalY += 1;
            } else if (d == 3 /* Right */) {
                hypotheticalX += 1;
            } else if (d == 2 /* Left */) {
                hypotheticalX -= 1;
            }
            if (!this.inBounds(hypotheticalX, hypotheticalY)) {
                return;
            }

            if (this.gameState.ver.x == hypotheticalX && this.gameState.ver.y == hypotheticalY) {
                this.move(this.gameState.ver, d); // Change to event.
            } else if (this.gameState.hor.x == hypotheticalX && this.gameState.hor.y == hypotheticalY) {
                this.move(this.gameState.hor, d); // Change to event.
            }
            movable.x = hypotheticalX;
            movable.y = hypotheticalY;

            if (movable.x == this.gameState.hole.x && movable.y == this.gameState.hole.y) {
                movable.inHole = true;
                if (this.gameState.hor.inHole && this.gameState.ver.inHole) {
                    console.log("you won");
                }
            }
        };

        MoveEvent.prototype.handle = function () {
            var player = null;
            if (this.direction == 0 /* Up */ || this.direction == 1 /* Down */) {
                player = this.gameState.ver;
            } else {
                player = this.gameState.hor;
            }
            if (this.canMove(player, this.direction)) {
                this.move(player, this.direction);
            } else {
                console.log("cant move that way");
            }
        };
        return MoveEvent;
    })(AbstractEvent);
    controller.MoveEvent = MoveEvent;

    var WinEvent = (function (_super) {
        __extends(WinEvent, _super);
        function WinEvent(gs) {
            _super.call(this, gs);
        }
        WinEvent.prototype.handle = function () {
            this.gameState.nextLevel();
            this.gameState.loadLevel();
        };
        return WinEvent;
    })(AbstractEvent);
    controller.WinEvent = WinEvent;

    var RestartEvent = (function (_super) {
        __extends(RestartEvent, _super);
        function RestartEvent(gs) {
            _super.call(this, gs);
        }
        RestartEvent.prototype.handle = function () {
            this.gameState.loadLevel();
        };
        return RestartEvent;
    })(AbstractEvent);
    controller.RestartEvent = RestartEvent;

    var Fifo = (function () {
        function Fifo() {
            this.queue = [];
        }
        Fifo.prototype.next = function () {
            return this.queue.shift();
        };

        Fifo.prototype.enqueue = function (obj) {
            this.queue.push(obj);
        };

        Fifo.prototype.empty = function () {
            return this.queue.length == 0;
        };
        return Fifo;
    })();
    controller.Fifo = Fifo;

    var EventHandler = (function () {
        function EventHandler(gameState) {
            this.gameState = gameState;
            // Acts as a factory.
            this.fifo = new Fifo();
        }
        EventHandler.prototype.nextEvent = function () {
            if (!this.fifo.empty()) {
                var e = this.fifo.next();
                e.handle();
            }
        };

        // addEvent(e : AbstractEvent) : void {
        //     this.fifo.enqueue(e);
        // }
        EventHandler.prototype.moveEvent = function (d) {
            this.fifo.enqueue(new MoveEvent(this.gameState, this, d));
        };

        EventHandler.prototype.winEvent = function () {
            this.fifo.enqueue(new WinEvent(this.gameState));
        };

        EventHandler.prototype.restartEvent = function () {
            this.fifo.enqueue(new RestartEvent(this.gameState));
        };
        return EventHandler;
    })();
    controller.EventHandler = EventHandler;
})(controller || (controller = {}));
/// <reference path="model.ts" />
/// <reference path="controller.ts" />
var view;
(function (view) {
    var View = (function () {
        function View(gs, ev) {
            this.gameState = gs;

            var up = document.createElement("button");
            up.innerText = "Up";

            up.onclick = (function () {
                /* "this" refers to the anynomus function instead of the class
                ergo the "ev" closure */
                ev.moveEvent(0 /* Up */);
            });
            document.body.appendChild(up);

            var down = document.createElement("button");
            down.innerText = "Down";

            down.onclick = (function () {
                /* "this" refers to the anynomus function instead of the class
                ergo the "ev" closure */
                ev.moveEvent(1 /* Down */);
            });
            document.body.appendChild(down);
            var left = document.createElement("button");
            left.innerText = "Left";

            left.onclick = (function () {
                /* "this" refers to the anynomus function instead of the class
                ergo the "ev" closure */
                ev.moveEvent(2 /* Left */);
            });
            document.body.appendChild(left);
            var right = document.createElement("button");
            right.innerText = "Right";

            right.onclick = (function () {
                /* "this" refers to the anynomus function instead of the class
                ergo the "ev" closure */
                ev.moveEvent(3 /* Right */);
            });
            document.body.appendChild(right);

            var restart = document.createElement("button");
            restart.innerText = "restart";

            restart.onclick = (function () {
                /* "this" refers to the anynomus function instead of the class
                ergo the "ev" closure */
                ev.restartEvent();
            });
            document.body.appendChild(restart);
        }
        View.prototype.render = function () {
            var disp = [];
            for (var i = 0; i < this.gameState.height; i++) {
                disp[i] = [];
                for (var j = 0; j < this.gameState.width; j++) {
                    disp[i][j] = ' ';
                }
            }

            if (!this.gameState.hor.inHole) {
                disp[this.gameState.hor.y][this.gameState.hor.x] = '=';
            }
            if (!this.gameState.ver.inHole) {
                disp[this.gameState.ver.y][this.gameState.ver.x] = '|';
            }
            disp[this.gameState.hole.y][this.gameState.hole.x] = 'O';
            for (var i = 0; i < this.gameState.walls.length; i++) {
                disp[this.gameState.walls[i].y][this.gameState.walls[i].x] = '#';
            }

            var rows = [];
            for (var i = 0; i < disp.length; i < i++) {
                rows[i] = disp[i].join("");
            }
            console.log(rows.join("\n"));
        };
        return View;
    })();
    view.View = View;

    var GUI = (function (_super) {
        __extends(GUI, _super);
        function GUI(gs, ev) {
            _super.call(this, gs, ev);
            var canvas = document.getElementById("canvas");
            this.width = canvas.width;
            this.height = canvas.height;
            this.ctx = canvas.getContext("2d");
            this.clearScreen();
            this.squareWidth = this.width / gs.width;
            this.squareHeight = this.height / gs.height;
            canvas.onkeypress = (function (evt) {
                var charCode = evt.which;
                var charStr = String.fromCharCode(charCode);
                if (charStr == 'w') {
                    ev.moveEvent(0 /* Up */);
                } else if (charStr == 's') {
                    ev.moveEvent(1 /* Down */);
                } else if (charStr == 'a') {
                    ev.moveEvent(2 /* Left */);
                } else if (charStr == 'd') {
                    ev.moveEvent(3 /* Right */);
                } else if (charStr == ' ') {
                    ev.restartEvent();
                }
            });
        }
        GUI.prototype.drawSquare = function (square, color) {
            this.ctx.fillStyle = color; // Blue.
            this.ctx.fillRect(square.x * this.squareWidth, square.y * this.squareHeight, this.squareWidth, this.squareHeight);
        };
        GUI.prototype.clearScreen = function () {
            this.ctx.fillStyle = "#FFFFFF";
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.strokeStyle = "#000000";
            this.ctx.rect(0, 0, this.width, this.height);
            this.ctx.stroke();
        };
        GUI.prototype.render = function () {
            this.clearScreen();

            var blue = "#0000FF";
            var red = "#FF0000";
            var black = "#000000";

            this.drawSquare(this.gameState.hor, blue);
            this.drawSquare(this.gameState.ver, blue);

            for (var i = 0; i < this.gameState.walls.length; i++) {
                this.drawSquare(this.gameState.walls[i], red);
            }
            this.drawSquare(this.gameState.hole, black);
        };
        return GUI;
    })(View);
    view.GUI = GUI;
})(view || (view = {}));
/// <reference path="controller.ts" />
/// <reference path="model.ts" />
/// <reference path="view.ts" />
function main() {
    var gameState = new model.GameState();
    gameState.loadLevel();
    var eventHandler = new controller.EventHandler(gameState);
    var GUI = new view.GUI(gameState, eventHandler);
    GUI.render();
    setInterval((function () {
        eventHandler.nextEvent();
        GUI.render();
    }), 100);
}
main();
