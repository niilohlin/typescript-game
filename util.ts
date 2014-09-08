/// <reference path="model.ts" />

var DEBUG : boolean = true;
class Optional<T> {
    constructor(private obj: T) {
        if(obj == null) {

        }
    }

    set(obj : T): void {
        this.obj = obj;
    }

    getOr(other : T) : T {
        return this.obj ? this.obj : other;
    }

    fmap<S>(fn : (o : T) => S) : Optional<S> {
        return this.obj ? new Optional<S>(fn(this.obj)) : new Optional<S>(null);
    }
}

function LOG(str: string) {
    if(DEBUG) {
        console.log(str);
    }
}

function ASSERT(exp: boolean) {
    if(DEBUG) {
        if(!exp) {
            throw new Error("Assertion exception");
        }
    }
}

function GUARD(...objs: any[]) {
    if(DEBUG) {
        for(var i : number = 0; i < objs.length; i++) {
            if((objs[i] == null) || (objs[i] == undefined)) {
                throw new Error("Null pointer exeption");
            }
        }
    }
}

function randomNat():number {
    return Math.floor(Math.random()*20 + 1);
}

function generatelevels() : model.Level {
    var level: model.Level = {'level':-1, 'hole': [], 'ver':[], 'hor':[], 'walls':[], 'width':-1, "height": -1};
    level.width  = randomNat();
    level.height = randomNat();
    var getRandomCoordinate = function() {
        return [randomNat() % level.width, randomNat() % level.height];
    }
    level.hole = getRandomCoordinate();
    level.hor = getRandomCoordinate();
    level.ver = getRandomCoordinate();
    var number_of_walls:number = randomNat();
    for(var i:number = 0; i < number_of_walls; i++) {
        level.walls.push(getRandomCoordinate());
    }
    return level;
}

