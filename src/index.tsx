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
import { stepCollisions } from "./model/collisions";

function boxMuller() {
  let u1 = Math.random();
  let u2 = Math.random();

  let r = Math.sqrt(-2 * Math.log(u1));
  let t = 2 * Math.PI * u2;

  let z0 = r * Math.cos(t);
  let z1 = r * Math.sin(t);

  return [z0, z1] as [number, number];
}

function randomBody(maxX: number, maxY: number): PhysicsBody {
  let posX = Math.random() * maxX;
  let posY = Math.random() * maxY;

  let [velX, velY] = boxMuller();
  velX *= 50;
  velY *= 50;

  let radius = Math.random() * 20 + 10;

  return { posX, posY, velX, velY, radius };
}

let gravConst = 1e6;
// (document.getElementById("grav-slider") as HTMLInputElement).addEventListener(
//   "input",
//   function() {
//     gravConst = Math.pow(10, +this.value);
//   }
// );

console.debug(`[Global] TF Backend: ${tf.getBackend()}`);

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

let bodies: PhysicsBody[] = new Array(10)
  .fill(null)
  .map(() => randomBody(canvas.width, canvas.height));

let data = bodiesToTensor(bodies);

async function animate() {
  // step the simulation
  data = updateTensor(data, data =>
    stepGravity(data, { dt: 1 / 60, gravConst, dragCoeff: 0.1 })
  );
  data = updateTensor(data, data =>
    stepBoundary(data, { maxX: canvas.width, maxY: canvas.height })
  );

  // Retrieve data to draw
  bodies = await tensorToBodies(data, bodies);

  // apply collisions
  stepCollisions(bodies);
  data.dispose();
  data = bodiesToTensor(bodies);

  // Draw
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  renderToCanvas(ctx, bodies);

  requestAnimationFrame(animate);
}

animate();

setInterval(() => console.log(tf.memory()), 5000);
// data.dispose()
