declare class GameObject {
    private o_id;
}
declare class OnionEngine {
    static context: CanvasRenderingContext2D;
    static init(canvas: HTMLCanvasElement): void;
    static LoadScene(scene: Scene): void;
}
declare class Scene {
    gameObjects: GameObject[];
}
