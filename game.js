var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var controller;
(function (controller) {
    var AbstractEvent = (function () {
        function AbstractEvent() {
        }
        AbstractEvent.prototype.handle = function (gs) {
            throw new Error("To be overwritten");
        };
        return AbstractEvent;
    })();
    controller.AbstractEvent = AbstractEvent;

    var MoveEvent = (function (_super) {
        __extends(MoveEvent, _super);
        function MoveEvent(d) {
            _super.call(this);
            this.direction = d;
        }
        MoveEvent.prototype.handle = function (gs) {
            var player = null;
            if (this.direction == 0 /* Up */ || this.direction == 1 /* Down */) {
                player = gs.ver;
            } else {
                player = gs.hor;
            }
            if (player.canMove(gs, this.direction)) {
                player.move(gs, this.direction);
            } else {
                console.log("cant move that way");
            }
        };
        return MoveEvent;
    })(AbstractEvent);
    controller.MoveEvent = MoveEvent;

    var WinEvent = (function (_super) {
        __extends(WinEvent, _super);
        function WinEvent() {
            _super.apply(this, arguments);
        }
        WinEvent.prototype.handle = function (gs) {
            gs.nextLevel();
            gs.loadLevel();
        };
        return WinEvent;
    })(AbstractEvent);
    controller.WinEvent = WinEvent;

    var RestartEvent = (function (_super) {
        __extends(RestartEvent, _super);
        function RestartEvent() {
            _super.apply(this, arguments);
        }
        RestartEvent.prototype.handle = function (gs) {
            gs.loadLevel();
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
            this.fifo = new Fifo();
        }
        EventHandler.prototype.nextEvent = function () {
            if (!this.fifo.empty()) {
                console.log("handling event");
                var e = this.fifo.next();
                e.handle(this.gameState);
            }
        };

        EventHandler.prototype.addEvent = function (e) {
            this.fifo.enqueue(e);
        };
        return EventHandler;
    })();
    controller.EventHandler = EventHandler;
})(controller || (controller = {}));

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
        function Movable(x, y) {
            _super.call(this, x, y);
            this.inHole = false;
        }
        Movable.prototype.canMove = function (gs, d) {
            var hypotheticalX = this.x;
            var hypotheticalY = this.y;

            if (d == 0 /* Up */) {
                hypotheticalY -= 1;
            } else if (d == 1 /* Down */) {
                hypotheticalY += 1;
            } else if (d == 3 /* Right */) {
                hypotheticalX += 1;
            } else if (d == 2 /* Left */) {
                hypotheticalX -= 1;
            }
            for (var i = 0; i < gs.walls.length; i++) {
                var w = gs.walls[i];
                if (w.x == hypotheticalX && w.y == hypotheticalY) {
                    return false;
                }
            }
            if (gs.ver.x == hypotheticalX && gs.ver.y == hypotheticalY) {
                return gs.ver.canMove(gs, d);
            } else if (gs.hor.x == hypotheticalX && gs.hor.y == hypotheticalY) {
                return gs.hor.canMove(gs, d);
            }
            return true;
        };

        Movable.prototype.move = function (gs, d) {
            var hypotheticalX = this.x;
            var hypotheticalY = this.y;

            if (d == 0 /* Up */) {
                hypotheticalY -= 1;
            } else if (d == 1 /* Down */) {
                hypotheticalY += 1;
            } else if (d == 3 /* Right */) {
                hypotheticalX += 1;
            } else if (d == 2 /* Left */) {
                hypotheticalX -= 1;
            }
            if (gs.ver.x == hypotheticalX && gs.ver.y == hypotheticalY) {
                gs.ver.move(gs, d);
            } else if (gs.hor.x == hypotheticalX && gs.hor.y == hypotheticalY) {
                gs.hor.move(gs, d);
            }
            this.x = hypotheticalX;
            this.y = hypotheticalY;
        };
        return Movable;
    })(Square);
    model.Movable = Movable;

    var Horizontal = (function (_super) {
        __extends(Horizontal, _super);
        function Horizontal(x, y) {
            _super.call(this, x, y);
        }
        return Horizontal;
    })(Movable);
    model.Horizontal = Horizontal;

    var Vertical = (function (_super) {
        __extends(Vertical, _super);
        function Vertical(x, y) {
            _super.call(this, x, y);
        }
        return Vertical;
    })(Movable);
    model.Vertical = Vertical;

    var LevelLoader = (function () {
        function LevelLoader() {
        }
        LevelLoader.prototype.loadLevel = function (gs, level) {
            gs.width = 9;
            gs.height = 9;
            gs.walls = [new Wall(1, 1), new Wall(7, 4), new Wall(6, 7)];
            gs.hole = new Hole(4, 2);
            gs.hor = new Horizontal(4, 3);
            gs.ver = new Vertical(4, 6);
        };
        return LevelLoader;
    })();

    var GameState = (function () {
        function GameState() {
            this.level = 0;
            this.width = 9;
            this.height = 9;
            this.hor = new Horizontal(5, 5);
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

var view;
(function (view) {
    var View = (function () {
        function View(gs, ev) {
            this.gameState = gs;
            this.eventHandler = ev;

            var up = document.createElement("button");
            up.innerText = "Up";

            up.onclick = (function () {
                /* "this" refers to the anynomus function instead of the class
                ergo the "ev" closure */
                ev.addEvent(new controller.MoveEvent(0 /* Up */));
            });
            document.body.appendChild(up);

            var down = document.createElement("button");
            down.innerText = "Down";

            down.onclick = (function () {
                /* "this" refers to the anynomus function instead of the class
                ergo the "ev" closure */
                ev.addEvent(new controller.MoveEvent(1 /* Down */));
            });
            document.body.appendChild(down);
            var left = document.createElement("button");
            left.innerText = "Left";

            left.onclick = (function () {
                /* "this" refers to the anynomus function instead of the class
                ergo the "ev" closure */
                ev.addEvent(new controller.MoveEvent(2 /* Left */));
            });
            document.body.appendChild(left);
            var right = document.createElement("button");
            right.innerText = "Right";

            right.onclick = (function () {
                /* "this" refers to the anynomus function instead of the class
                ergo the "ev" closure */
                ev.addEvent(new controller.MoveEvent(3 /* Right */));
            });
            document.body.appendChild(right);
        }
        View.prototype.render = function () {
            var disp = [];
            for (var i = 0; i < this.gameState.height; i++) {
                disp[i] = [];
                for (var j = 0; j < this.gameState.width; j++) {
                    disp[i][j] = ' ';
                }
            }

            disp[this.gameState.hor.y][this.gameState.hor.x] = '=';
            disp[this.gameState.ver.y][this.gameState.ver.x] = '|';
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
})(view || (view = {}));

function main() {
    var gameState = new model.GameState();
    gameState.loadLevel();
    var eventHandler = new controller.EventHandler(gameState);
    var cli = new view.View(gameState, eventHandler);
    cli.render();
    setInterval((function () {
        eventHandler.nextEvent();
        cli.render();
    }), 100);
}
main();
