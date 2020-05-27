import * as tf from "@tensorflow/tfjs";

interface Body {
  x: number;
  y: number;
}

export class TFSimulator {
  /**
   * Body data stored as a (n x 2) tensor
   */
  private data: tf.Tensor2D = tf.zeros([0, 2]);

  addBody(...bodies: Body[]) {
    const result = tf.concat([this.data, bodies.map(({ x, y }) => [x, y])], 0);
    this.data.dispose();
    this.data = result;
  }

  dispose() {
    this.data.dispose();
  }

  debug(prefix = "") {
    console.debug(`${prefix}data shape: ${this.data.shape}`);
  }
}
