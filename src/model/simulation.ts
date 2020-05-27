import * as tf from "@tensorflow/tfjs";
import { PhysicsBody } from "./physics-body";
import { Tensor } from "@tensorflow/tfjs";

export function bodiesToTensor(bodies: PhysicsBody[]) {
  return tf.tensor(
    bodies.map(({ posX, posY, velX, velY }) => [posX, posY, velX, velY])
  );
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
  const array = (await data.array()) as [number, number, number, number][];

  return array.map(([posX, posY, velX, velY], i) => ({
    ...(bodies ? bodies[i] : {}),
    posX,
    posY,
    velX,
    velY
  }));
}

export function stepGravity(
  data: Tensor,
  { dt, gravConst = 1 }: { dt: number; gravConst?: number }
) {
  return tf.tidy(() => {
    const pos = data.slice([0, 0], [-1, 2]);
    const vel = data.slice([0, 2], [-1, 2]);

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

    const newData = tf.concat([newPos, newVel], 1);
    return newData;
  });
}
