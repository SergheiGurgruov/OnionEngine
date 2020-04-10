declare class GameObject {
    private o_id;
}
declare class StateMachine {
    private _attributes;
    private _states;
    currentState: State;
    init(): void;
    constructor(attributes: StateMachineAttribute[]);
    SetAttribute(key: string, value: number | boolean | string): void;
    GetAttribute(key: string): string | number | boolean;
    AddState(state: State): void;
    ToggleAttribute(key: string): void;
}
declare class State {
    stateMachine: StateMachine;
    private _active;
    private _name;
    private _loop;
    private _transitions;
    private _job;
    get active(): boolean;
    get name(): string;
    constructor(name: string, loop: boolean, job: () => Promise<void>);
    OnEnd(): void;
    private Execute;
    Trigger(): void;
    Disable(): void;
    AddTransition(transition: Transition): this;
    onAttributeChange(key: string, value: number | boolean | string): void;
}
declare class Transition {
    constructor(target: State, condition: TransitionConditon);
    target: State;
    condition: TransitionConditon;
    Trigger(from: State): void;
}
declare class StateMachineAttribute {
    private _key;
    get key(): string;
    value: number | string | boolean;
    constructor(key: string, value: number | string | boolean);
    setValue(value: number | string | boolean): void;
}
declare class TransitionConditon {
    constructor(type: "match" | "toggle" | "morethan" | "lessthan" | "onEnd", attributeName?: string, value?: number | boolean | string);
    attributeName: string;
    value: number | boolean | string;
    type: "match" | "toggle" | "morethan" | "lessthan" | "onEnd";
    eval(key: string, value: number | boolean | string): boolean;
}
declare class Scene {
    gameObjects: GameObject[];
    Awake(): void;
    Start(): void;
    Update(): void;
}
declare class OnionEngine {
    static context: CanvasRenderingContext2D;
    static gameLoop: StateMachine;
    static init(canvas: HTMLCanvasElement): void;
    static LoadScene(scene: Scene): void;
}
