import * as tf from "@tensorflow/tfjs";
import { PhysicsBody } from "./physics-body";
import { Tensor } from "@tensorflow/tfjs";

export function bodiesToTensor(bodies: PhysicsBody[]) {
  return tf.tensor(
    bodies.map(({ posX, posY, velX, velY, radius }) => [
      posX,
      posY,
      velX,
      velY,
      radius
    ])
  );
}

/**
 * Helper function for operating on immutable tensors with proper memory
 * management
 *
 * Example: data = updateTensor(data, (data) => f(data, opts))
 *
 * @param data
 * @param callback
 */
export function updateTensor(
  data: Tensor,
  callback: (data: Tensor) => tf.Tensor
) {
  const result = callback(data);
  data.dispose();
  return result;
}

export async function tensorToBodies(
  data: tf.Tensor
): Promise<Partial<PhysicsBody>[]>;
export async function tensorToBodies(
  data: tf.Tensor,
  bodies: PhysicsBody[]
): Promise<PhysicsBody[]>;
export async function tensorToBodies(
  data: tf.Tensor,
  bodies?: PhysicsBody[]
): Promise<Partial<PhysicsBody>[]> {
  const array = (await data.array()) as [
    number,
    number,
    number,
    number,
    number
  ][];

  return array.map(([posX, posY, velX, velY, radius], i) => ({
    ...(bodies ? bodies[i] : {}),
    posX,
    posY,
    velX,
    velY,
    radius
  }));
}

export function stepGravity(
  data: Tensor,
  { dt, gravConst = 1 }: { dt: number; gravConst?: number }
) {
  return tf.tidy(() => {
    const pos = data.slice([0, 0], [-1, 2]);
    const vel = data.slice([0, 2], [-1, 2]);
    const radius = data.slice([0, 4], [-1, 1]);

    const r = tf.sub(pos.expandDims(), pos.expandDims(1));
    const rNorm = tf.norm(r, 2, 2);

    const diagMask = tf.sub(1, tf.eye(pos.shape[0])).expandDims(2);
    const force = tf.mul(
      -gravConst,
      tf.mul(diagMask, tf.div(r, tf.pow(rNorm, 3).expandDims(2)))
    );

    const acc = tf.sum(force, 0);

    const newVel = tf.add(vel, tf.mul(dt, acc));
    const newPos = tf.add(pos, tf.mul(dt, newVel));

    const newData = tf.concat([newPos, newVel, radius], 1);
    return newData;
  });
}

export function stepBoundary(
  data: Tensor,
  {
    minX = 0,
    minY = 0,
    maxX,
    maxY
  }: { minX?: number; minY?: number; maxX: number; maxY: number }
) {
  return tf.tidy(() => {
    const pos = data.slice([0, 0], [-1, 2]);
    const vel = data.slice([0, 2], [-1, 2]);
    const radius = data.slice([0, 4], [-1, 1]);

    const oob = tf.logicalOr(
      tf.less(tf.sub(pos, radius), [minX, minY]),
      tf.greater(tf.add(pos, radius), [maxX, maxY])
    );

    const posX = tf.clipByValue(pos.slice([0, 0], [-1, 1]), minX, maxX);
    const posY = tf.clipByValue(pos.slice([0, 1], [-1, 1]), minY, maxY);

    const newPos = tf.concat([posX, posY], 1);
    const newVel = tf.mul(vel, tf.sub(1, tf.mul(oob, 2)));

    const newData = tf.concat([newPos, newVel, radius], 1);
    return newData;
  });
}
