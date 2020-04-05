class OnionEngine {
    static context:CanvasRenderingContext2D;

    static init(canvas:HTMLCanvasElement):void{
        console.info("Engine Started")
        this.context = canvas.getContext("2d");


    }

    public static LoadScene(scene :Scene){
        
    }
}

OnionEngine.init(document.getElementById('viewport') as HTMLCanvasElement);