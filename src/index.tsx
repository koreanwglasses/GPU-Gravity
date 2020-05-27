import * as tf from "@tensorflow/tfjs";
import { TFSimulator } from "./simulation";

(async () => {
  console.debug(`[Global] TF Backend: ${tf.getBackend()}`);
  console.debug(`[Global] TF Memory:`, tf.memory());

  const sim = new TFSimulator();

  sim.addBody({ posX: 1, posY: 2, velX: 0, velY: 1 });
  sim.addBody({ posX: 4, posY: 8, velX: 0, velY: -1 });
  sim.addBody({ posX: 16, posY: 32, velX: 0, velY: 0 });

  console.debug(`[Global] TF Memory:`, tf.memory());
  sim.debug({ prefix: "[TFSimulator] ", printData: true });

  sim.step(1 / 60);
  console.debug(`[Global] TF Memory:`, tf.memory());
  sim.debug({ prefix: "[TFSimulator] ", printData: true });

  console.log(await sim.getBodies());

  sim.dispose();

  console.debug(`[Global] TF Memory:`, tf.memory());
})();
