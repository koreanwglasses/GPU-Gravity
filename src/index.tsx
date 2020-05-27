import * as tf from "@tensorflow/tfjs";
import { PhysicsBody } from "./model/physics-body";
import { TFSimulator } from "./model/simulation";
import { renderToCanvas } from "./view/canvas-renderer";

(async () => {
  console.debug(`[Global] TF Backend: ${tf.getBackend()}`);

  const bodies: PhysicsBody[] = [
    { posX: 200, posY: 400, velX: 0, velY: 100, radius: 10 },
    { posX: 600, posY: 400, velX: 0, velY: -100, radius: 10 }
  ];

  const sim = new TFSimulator(1e7);

  sim.addBody(...bodies);

  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");

  async function animate() {
    sim.step(1 / 60);
    const bodies = await sim.getBodies();

    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    renderToCanvas(ctx, bodies);

    requestAnimationFrame(animate);
  }

  animate();
  // sim.dispose();
})();
