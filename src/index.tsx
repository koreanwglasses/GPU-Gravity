import * as tf from "@tensorflow/tfjs";
import { PhysicsBody } from "./model/physics-body";
import {
  bodiesToTensor,
  stepGravity,
  tensorToBodies,
  updateTensor,
  stepBoundary
} from "./model/simulation";
import { renderToCanvas } from "./view/canvas-renderer";
import { tensor, Tensor } from "@tensorflow/tfjs";

(async () => {
  console.debug(`[Global] TF Backend: ${tf.getBackend()}`);

  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");

  let bodies: PhysicsBody[] = [
    { posX: 200, posY: 400, velX: 0, velY: 300, radius: 10 },
    { posX: 600, posY: 400, velX: 0, velY: -300, radius: 10 }
  ];

  let data = bodiesToTensor(bodies);

  async function animate() {
    // step the simulation
    data = updateTensor(data, data =>
      stepGravity(data, { dt: 1 / 60, gravConst: 1e7 })
    );
    data = updateTensor(data, data =>
      stepBoundary(data, { maxX: canvas.width, maxY: canvas.height })
    );

    // Retrieve data to draw
    bodies = await tensorToBodies(data, bodies);

    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    renderToCanvas(ctx, bodies);

    requestAnimationFrame(animate);
  }

  animate();

  setInterval(() => console.log(tf.memory()), 5000);
  // data.dispose()
})();
