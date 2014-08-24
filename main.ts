/// <reference path="controller.ts" />
/// <reference path="model.ts" />
/// <reference path="view.ts" />

function main() {
    var gameState : model.GameState = new model.GameState();
    gameState.loadLevel();
    var eventHandler : controller.EventHandler = new controller.EventHandler(gameState);
    var cli : view.View = new view.View(gameState, eventHandler);
    cli.render();
    setInterval((function() {
        eventHandler.nextEvent();
        cli.render();
    }), 100);
}
main();
