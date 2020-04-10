class GameObject {
}
class StateMachine {
    constructor(attributes) {
        this._states = new Array();
        this._attributes = attributes;
    }
    init() {
        this._states[0].Trigger();
    }
    SetAttribute(key, value) {
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
    GetAttribute(key) {
        for (let attribute of this._attributes) {
            if (attribute.key == key) {
                return attribute.value;
            }
        }
        console.error(`the requested attribute: ${key}, was not found on this StateMachine`);
    }
    AddState(state) {
        state.stateMachine = this;
        this._states.push(state);
    }
    ToggleAttribute(key) {
        this.SetAttribute(key, !this.GetAttribute(key));
    }
}
class State {
    constructor(name, loop, job) {
        this._transitions = new Array();
        this._name = name;
        this._loop = loop;
        this._job = job;
    }
    get active() {
        return this._active;
    }
    get name() {
        return this._name;
    }
    OnEnd() {
        for (let trans of this._transitions) {
            if (trans.condition.type == "onEnd") {
                trans.Trigger(this);
            }
        }
    }
    async Execute() {
        this._active = true;
        await this._job();
        this.OnEnd();
        if (this._active && this._loop) {
            this.Execute();
        }
    }
    Trigger() {
        this._active = true;
        this.stateMachine.currentState = this;
        this.Execute();
    }
    Disable() {
        this._active = false;
    }
    AddTransition(transition) {
        this._transitions.push(transition);
        return this;
    }
    onAttributeChange(key, value) {
        for (let transition of this._transitions) {
            if (transition.condition.eval(key, value)) {
                return transition.Trigger(this);
            }
        }
    }
}
class Transition {
    constructor(target, condition) {
        this.target = target;
        this.condition = condition;
    }
    Trigger(from) {
        from.Disable();
        this.target.Trigger();
    }
}
class StateMachineAttribute {
    constructor(key, value) {
        this._key = key;
        this.value = value;
    }
    get key() {
        return this._key;
    }
    setValue(value) {
        this.value = value;
    }
}
class TransitionConditon {
    constructor(type, attributeName, value) {
        this.type = type;
        if (attributeName)
            this.attributeName = attributeName;
        if (value)
            this.value = value;
    }
    eval(key, value) {
        if (key != this.attributeName || value == undefined || value == null)
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
class Scene {
    Awake() {
    }
    Start() {
    }
    Update() {
    }
}
class OnionEngine {
    static init(canvas) {
        console.info("Engine Started");
        this.context = canvas.getContext("2d");
        this.gameLoop = new StateMachine([new StateMachineAttribute("loadScene", false), new StateMachineAttribute("end", false)]);
        var awake = new State("awake", false, async () => {
            console.log("awake");
            return;
        });
        var start = new State("start", false, async () => {
            console.log("start");
            return;
        });
        var update = new State("update", true, async () => {
            return new Promise((resolve, reject) => {
                console.log("update");
                setTimeout(() => {
                    resolve();
                }, 5);
            });
        });
        var end = new State("end", false, async () => {
            end.Disable();
            this.gameLoop.currentState = undefined;
        });
        awake.AddTransition(new Transition(start, new TransitionConditon("onEnd")));
        start.AddTransition(new Transition(update, new TransitionConditon("onEnd")));
        update.AddTransition(new Transition(awake, new TransitionConditon("toggle", "loadScene")));
        update.AddTransition(new Transition(end, new TransitionConditon("toggle", "end")));
        this.gameLoop.AddState(awake);
        this.gameLoop.AddState(start);
        this.gameLoop.AddState(update);
        this.gameLoop.AddState(end);
        document.addEventListener("keydown", (ev) => {
            if (ev.key == "i") {
                this.gameLoop.init();
            }
            else if (ev.key == "r") {
                this.gameLoop.ToggleAttribute("loadScene");
            }
            else if (ev.key == "e") {
                this.gameLoop.ToggleAttribute("end");
            }
        });
    }
    static LoadScene(scene) {
        this.gameLoop.ToggleAttribute("loadScene");
    }
}
OnionEngine.init(document.getElementById('viewport'));
//# sourceMappingURL=OnionEngine.js.map