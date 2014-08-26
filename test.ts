/// <reference path="tsUnit.ts" />
/// <reference path="model.ts" />
/// <reference path="controller.ts" />

function intGen():number {
    return Math.floor(Math.random()*100 - 50);
}

function natGen(): number {
    return Math.floor(Math.random()*20);
}

function generateRandomDir():model.Dir[] {
    var len: number = natGen();
    var res: model.Dir[] = [];
    for(var i: number = 0; i < len; i++) {
        res.push([model.Dir.Up, model.Dir.Down, model.Dir.Left, model.Dir.Right][natGen() % 4]);
    }
    return res;
}

class MyTest extends tsUnit.TestClass {

}
