import * as tf from "@tensorflow/tfjs";
import { TFSimulator } from "./simulation";

console.debug(`[Global] TF Backend: ${tf.getBackend()}`);
console.debug(`[Global] TF Memory:`, tf.memory());

const sim = new TFSimulator();

console.debug(`[Global] TF Memory:`, tf.memory());
sim.debug("[TFSimulator] ");

sim.addBody({ x: 1, y: 2 });

console.debug(`[Global] TF Memory:`, tf.memory());
sim.debug("[TFSimulator] ");

sim.addBody({ x: 1, y: 2 }, { x: 1, y: 2 });

console.debug(`[Global] TF Memory:`, tf.memory());
sim.debug("[TFSimulator] ");
