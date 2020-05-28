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

console.debug(`[Global] TF Backend: ${tf.getBackend()}`);

const hash = window.location.hash.substr(1);
const params: { n?: string } = hash
  .split("&")
  .reduce(function(result: any, item) {
    var parts = item.split("=");
    result[parts[0]] = parts[1];
    return result;
  }, {});

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");

let bodies: PhysicsBody[] = new Array(params.n ? +params.n : 10)
  .fill(null)
  .map(() => randomBody(canvas.width, canvas.height));

let data = bodiesToTensor(bodies);

let lastT = 0;
async function animate(t: number) {
  let dt = lastT ? (t - lastT) / 1000 : 1 / 60;
  lastT = t;
  dt = Math.min(dt, 1);

  // step the simulation
  data = updateTensor(data, data =>
    stepGravity(data, { dt, gravConst: 1e5, dragCoeff: 0.01 })
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

requestAnimationFrame(animate);

setInterval(() => console.log(tf.memory()), 5000);
// data.dispose()
