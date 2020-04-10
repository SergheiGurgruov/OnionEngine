class StateMachine {

    private _attributes: StateMachineAttribute[];
    private _states: State[] = new Array<State>();
    public currentState: State;

    public init() {
        this._states[0].Trigger();
    }

    constructor(attributes: StateMachineAttribute[]){
        this._attributes = attributes;
    }

    public SetAttribute(key: string, value: number | boolean | string) {
        for (let attribute of this._attributes) {
            if (attribute.key == key) {
                attribute.setValue(value);
                this.currentState.onAttributeChange(key, value);
                return;
            }
        }
        console.error(`could not set attribure ${key}, the key was not found`);
        return;
    }

    public GetAttribute(key: string) {
        for (let attribute of this._attributes) {
            if (attribute.key == key) {
                return attribute.value;
            }
        }
        console.error(`the requested attribute: ${key}, was not found on this StateMachine`);
    }

    public AddState(state: State) {
        state.stateMachine = this;
        this._states.push(state);
    }

    ToggleAttribute(key: string){
        this.SetAttribute(key,!this.GetAttribute(key));
    }

}

class State {
    public stateMachine: StateMachine;
    private _active: boolean;
    private _name: string;
    private _loop: boolean;
    private _transitions: Transition[] = new Array<Transition>();
    private _job: () => Promise<void>;
    get active() {
        return this._active;
    }
    get name() {
        return this._name;
    }

    constructor(name: string, loop: boolean, job: () => Promise<void>) {
        this._name = name;
        this._loop = loop
        this._job = job;
    }

    public OnEnd() {
        for (let trans of this._transitions) {
            if (trans.condition.type == "onEnd") {
                trans.Trigger(this);
            }
        }
    }

    private async Execute() {
        this._active = true;
        await this._job();
        this.OnEnd();
        if (this._active && this._loop) {
            this.Execute();
        }
    }

    public Trigger() {
        this._active = true;
        this.stateMachine.currentState = this;
        this.Execute();
    }

    public Disable() {
        this._active = false;
    }

    public AddTransition(transition: Transition) {
        this._transitions.push(transition);
        return this;
    }

    public onAttributeChange(key: string, value: number | boolean | string) {
        for (let transition of this._transitions) {
            if(transition.condition.eval(key,value)){
                return transition.Trigger(this);
            }
        }
    }
}

class Transition {
    constructor(target: State, condition: TransitionConditon) {
        this.target = target;
        this.condition = condition;
    }

    public target: State;
    public condition: TransitionConditon;

    public Trigger(from: State) {
        from.Disable()
        this.target.Trigger();
    }
}

class StateMachineAttribute {
    private _key: string;
    get key() {
        return this._key
    }
    public value: number | string | boolean;

    constructor(key: string, value: number | string | boolean) {
        this._key = key;
        this.value = value;
    }

    setValue(value: number | string | boolean) {
        this.value = value;
    }
}

class TransitionConditon {

    constructor(type:"match" | "toggle" | "morethan" | "lessthan" | "onEnd",attributeName?:string,value?:number | boolean | string){
        this.type = type;
        if(attributeName)
            this.attributeName = attributeName;
        if(value)
            this.value = value;
    }

    public attributeName: string;
    public value: number | boolean | string;
    public type: "match" | "toggle" | "morethan" | "lessthan" | "onEnd"

    public eval(key: string, value: number | boolean | string){
        if(key != this.attributeName || value == undefined || value == null)
            return false;
        
        switch (this.type) {
            case "toggle":
                return true;
            case "match":
                return value == this.value;
            case "morethan":
                return value > this.value;
            case "lessthan":
                return value < this.value;
            default:
                return false;
        }
    }
}