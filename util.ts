
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


