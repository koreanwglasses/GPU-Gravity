import * as tf from "@tensorflow/tfjs";
import { Body } from "./body";

export class TFSimulator {
  /**
   * Body data stored as a (n x 2) tensor
   */
  private data: tf.Tensor = tf.zeros([0, 4]);

  constructor(public gravConst = 1) {}

  addBody(...bodies: Body[]) {
    const result = tf.concat(
      [
        this.data,
        bodies.map(({ posX, posY, velX, velY }) => [posX, posY, velX, velY])
      ],
      0
    );
    this.data.dispose();
    this.data = result;
  }

  async getBodies() {
    const array = (await this.data.array()) as [
      number,
      number,
      number,
      number
    ][];
    return array.map(([posX, posY, velX, velY]) => ({
      posX,
      posY,
      velX,
      velY
    }));
  }

  step(dt: number) {
    const result = tf.tidy(() => {
      const pos = this.data.slice([0, 0], [-1, 2]);
      const vel = this.data.slice([0, 2], [-1, 2]);

      const r = tf.sub(pos.expandDims(), pos.expandDims(1));
      const rNorm = tf.norm(r, 2, 2);

      const diagMask = tf.sub(1, tf.eye(pos.shape[0])).expandDims(2);
      const force = tf.mul(
        -this.gravConst,
        tf.mul(diagMask, tf.div(r, tf.pow(rNorm, 3).expandDims(2)))
      );

      const acc = tf.sum(force, 0);

      const newVel = tf.add(vel, tf.mul(dt, acc));
      const newPos = tf.add(pos, tf.mul(dt, newVel));

      const newData = tf.concat([newPos, newVel], 1);
      return newData;
    });

    this.data.dispose();
    this.data = result;
  }

  dispose() {
    this.data.dispose();
    this.data = null;
  }

  debug({ prefix = "", printData = false }) {
    if (this.data == null) {
      console.debug(`${prefix} no data`);
    }

    console.debug(`${prefix}data shape: ${this.data.shape}`);
    if (printData) {
      console.debug(`${prefix}data:`);
      this.data.print();
    }
  }
}
