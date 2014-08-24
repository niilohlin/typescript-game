/// <reference path="controller.ts" />
/// <reference path="model.ts" />
/// <reference path="view.ts" />

function main() {
    var gameState : model.GameState = new model.GameState();
    gameState.loadLevel();
    var eventHandler : controller.EventHandler = new controller.EventHandler(gameState);
    var GUI : view.GUI = new view.GUI(gameState, eventHandler);
    GUI.render();
    setInterval((function() {
        eventHandler.nextEvent();
        GUI.render();
    }), 100);
}
main();
