/// <reference path="StateMachine.ts" />
/// <reference path="Scene.ts" />
/// <reference path="GameObject.ts" />

class OnionEngine {
    static context: CanvasRenderingContext2D;
    static gameLoop: StateMachine;
    static init(canvas: HTMLCanvasElement): void {



        console.info("Engine Started")
        this.context = canvas.getContext("2d");
        this.gameLoop = new StateMachine([new StateMachineAttribute("loadScene", false),new StateMachineAttribute("end", false)]);

        var awake = new State("awake", false, async () => {
            console.log("awake");
            return;
        })

        var start = new State("start", false, async () => {
            console.log("start");
            return;
        })

        var update = new State("update", true, async () => {
            return new Promise<void>((resolve, reject) => {
                console.log("update");
                setTimeout(() => {
                    resolve();
                }, 5);
            })
        })

        var end = new State("end",false,async ()=>{
            end.Disable();
            this.gameLoop.currentState = undefined;
        });

        awake.AddTransition(new Transition(start, new TransitionConditon("onEnd")));
        start.AddTransition(new Transition(update, new TransitionConditon("onEnd")));
        update.AddTransition(new Transition(awake, new TransitionConditon("toggle", "loadScene")));
        update.AddTransition(new Transition(end,new TransitionConditon("toggle","end")))

        this.gameLoop.AddState(awake);
        this.gameLoop.AddState(start);
        this.gameLoop.AddState(update);
        this.gameLoop.AddState(end);

        document.addEventListener("keydown", (ev) => {
            if (ev.key == "i"){
                this.gameLoop.init();
            }else if (ev.key == "r"){
                this.gameLoop.ToggleAttribute("loadScene");
            }else if (ev.key == "e"){
                this.gameLoop.ToggleAttribute("end");
            }
        })
    }

    public static LoadScene(scene: Scene) {
        this.gameLoop.ToggleAttribute("loadScene");
    }
}



OnionEngine.init(document.getElementById('viewport') as HTMLCanvasElement);