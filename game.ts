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
        function Square(x, y) {
            this.x = x;
            this.y = y;
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

    var LevelLoader = (function () {
        function LevelLoader() {
            this.levels = [
                { "level": 0, "width": 5, "height": 5, "walls": [], "ver": [3, 3], "hor": [1, 1], "hole": [3, 1] },
                { "level": 1, "width": 5, "height": 5, "walls": [], "ver": [3, 2], "hor": [1, 2], "hole": [4, 2] },
                { "level": 2, "width": 6, "height": 5, "walls": [[3, 3]], "ver": [1, 3], "hor": [2, 3], "hole": [4, 3] },
                { "level": 3, "width": 9, "height": 7, "walls": [[3, 3], [5, 1], [2, 3]], "ver": [1, 3], "hor": [3, 2], "hole": [4, 3] }
            ];
        }
        LevelLoader.prototype.loadLevel = function (gs, level) {
            if (level >= this.levels.length) {
                throw Error("oops, no levels left");
            }
            this.loadGameState(gs, this.levels[level]);
        };

        LevelLoader.prototype.loadGameState = function (gs, json) {
            gs.width = json.width;
            gs.height = json.height;
            gs.walls = [];
            for (var i = 0; i < json.walls.length; i++) {
                gs.walls.push(new Wall(json.walls[i][0], json.walls[i][1]));
            }
            gs.hole = new Hole(json.hole[0], json.hole[1]);
            gs.hor = new Movable(gs, json.hor[0], json.hor[1]);
            gs.ver = new Movable(gs, json.ver[0], json.ver[1]);
        };
        return LevelLoader;
    })();
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
            if (movable.inHole) {
                return true;
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
                    this.eventHandler.winEvent();
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
            this.canvas = document.getElementById("canvas");
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.ctx = this.canvas.getContext("2d");
            this.clearScreen();
            this.squareWidth = this.width / gs.width;
            this.squareHeight = this.height / gs.height;
            this.canvas.onkeypress = (function (evt) {
                var charCode = evt.which;
                var charStr = String.fromCharCode(charCode);
                if (charStr == 'w' || charCode == 38) {
                    ev.moveEvent(0 /* Up */);
                } else if (charStr == 's' || charCode == 40) {
                    ev.moveEvent(1 /* Down */);
                } else if (charStr == 'a' || charCode == 37) {
                    ev.moveEvent(2 /* Left */);
                } else if (charStr == 'd' || charCode == 39) {
                    ev.moveEvent(3 /* Right */);
                } else if (charStr == ' ') {
                    ev.restartEvent();
                }
            });
        }
        GUI.prototype.drawSquare = function (square, color) {
            this.ctx.fillStyle = color;
            this.ctx.fillRect(square.x * this.squareWidth, square.y * this.squareHeight, this.squareWidth, this.squareHeight);
        };
        GUI.prototype.clearScreen = function () {
            this.squareWidth = this.width / this.gameState.width;
            this.squareHeight = this.height / this.gameState.height;
            this.ctx.fillStyle = "#FFFFFF";
            this.ctx.fillRect(0, 0, this.width, this.height);
            this.ctx.strokeStyle = "#000000";
            this.ctx.rect(0, 0, this.width, this.height);
            this.ctx.stroke();
        };
        GUI.prototype.drawLinesOnSquares = function () {
            this.ctx.fillStyle = "#000000";
            var hor = this.gameState.hor;
            var ver = this.gameState.ver;
            var lineWidth = 10;

            this.ctx.fillRect(hor.x * this.squareWidth, hor.y * this.squareHeight + this.squareHeight / 2 - lineWidth / 2, this.squareWidth, lineWidth);
            this.ctx.fillRect(ver.x * this.squareWidth + this.squareWidth / 2 - lineWidth / 2, ver.y * this.squareHeight, lineWidth, this.squareHeight);
        };
        GUI.prototype.render = function () {
            this.clearScreen();

            var blue = "#0000FF";
            var red = "#FF0000";
            var black = "#000000";

            this.drawSquare(this.gameState.hor, blue);
            this.drawSquare(this.gameState.ver, blue);
            this.drawLinesOnSquares();

            for (var i = 0; i < this.gameState.walls.length; i++) {
                this.drawSquare(this.gameState.walls[i], red);
            }
            this.drawSquare(this.gameState.hole, black);
        };
        return GUI;
    })(View);
    view.GUI = GUI;

    var EditorGUI = (function (_super) {
        __extends(EditorGUI, _super);
        function EditorGUI(gs, ev) {
            console.log("kalas");
            _super.call(this, gs, ev);

            // function doMouseDown(e) {
            //     console.log("x = " + e.pagex);
            //     console.log("y = " + e.pagey);
            // }
            // this.canvas.addEventListener("click", doMouseDown, false);
            this.canvas.onclick = (function (e) {
                console.log(e);
            });

            console.log("kalas");
        }
        return EditorGUI;
    })(GUI);
    view.EditorGUI = EditorGUI;
})(view || (view = {}));
/// <reference path="controller.ts" />
/// <reference path="model.ts" />
/// <reference path="view.ts" />
var Marker = (function (_super) {
    __extends(Marker, _super);
    function Marker() {
        _super.apply(this, arguments);
    }
    Marker.prototype.canMove = function (d) {
        return true;
    };

    Marker.prototype.move = function (d) {
        if (d == 0 /* Up */) {
            this.y -= 1;
        }
        if (d == 1 /* Down */) {
            this.y += 1;
        }
        if (d == 2 /* Left */) {
            this.x -= 1;
        }
        if (d == 3 /* Right */) {
            this.x += 1;
        }
    };
    return Marker;
})(model.Movable);
function main() {
    var gameState = new model.GameState();
    gameState.loadLevel();
    var eventHandler = new controller.EventHandler(gameState);
    var GUI = new view.EditorGUI(gameState, eventHandler);
    GUI.render();
    setInterval((function () {
        eventHandler.nextEvent();
        GUI.render();
    }), 100);
}
main();
