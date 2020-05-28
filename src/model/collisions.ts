import { PhysicsBody } from "./physics-body";

/**
 * Select the kth smallest element in xs
 * O(n)
 */
function kSelect(k: number, xs: number[]): number {
  let pivot = xs[Math.floor(Math.random() * xs.length)];
  let low = xs.filter(x => x < pivot);

  if (low.length + 1 == k) {
    return pivot;
  }

  if (low.length >= k) {
    return kSelect(k, low);
  } else {
    let high = xs.filter(x => x >= pivot);
    return kSelect(k - low.length, high);
  }
}

/**
 * Computes the mean of xs
 * O(n)
 */
function median(xs: number[]) {
  let k = Math.floor(xs.length / 2);
  if (xs.length % 2) {
    return kSelect(k, xs);
  } else {
    return (kSelect(k - 1, xs) + kSelect(k, xs)) / 2;
  }
}

class KDTree {
  private isLeaf: boolean;
  private bodies: PhysicsBody[];
  private splitByX: boolean;
  private splitPoint: number;
  private low: KDTree;
  private high: KDTree;

  constructor(bodies: PhysicsBody[], splitThreshold: number, maxDepth: number) {
    /** @member {boolean} */
    this.isLeaf = maxDepth == 0 || bodies.length <= splitThreshold;
    if (this.isLeaf) {
      this.bodies = bodies;
      return;
    }

    let xs = bodies.map(c => c.posX);
    let ys = bodies.map(c => c.posY);

    let rangeX = Math.max(...xs) - Math.min(...xs);
    let rangeY = Math.max(...ys) - Math.min(...ys);

    /** @member {boolean} */
    this.splitByX = rangeX > rangeY;

    if (this.splitByX) {
      this.splitPoint = median(xs);
      this.low = new KDTree(
        bodies.filter(c => c.posX < this.splitPoint),
        splitThreshold,
        maxDepth - 1
      );
      this.high = new KDTree(
        bodies.filter(c => c.posX >= this.splitPoint),
        splitThreshold,
        maxDepth - 1
      );
    } else {
      this.splitPoint = median(ys);
      this.low = new KDTree(
        bodies.filter(c => c.posY < this.splitPoint),
        splitThreshold,
        maxDepth - 1
      );
      this.high = new KDTree(
        bodies.filter(c => c.posY >= this.splitPoint),
        splitThreshold,
        maxDepth - 1
      );
    }
  }

  query(x: number, y: number, radius: number) {
    if (this.isLeaf) {
      return this.bodies.filter(
        c =>
          Math.pow(c.posX - x, 2) + Math.pow(c.posY - y, 2) <=
          Math.pow(radius, 2)
      );
    }

    let results: PhysicsBody[] = [];
    if (this.splitByX) {
      if (x - radius < this.splitPoint) {
        results.push(...this.low.query(x, y, radius));
      }
      if (x + radius >= this.splitPoint) {
        results.push(...this.high.query(x, y, radius));
      }
    } else {
      if (y - radius < this.splitPoint) {
        results.push(...this.low.query(x, y, radius));
      }
      if (y + radius >= this.splitPoint) {
        results.push(...this.high.query(x, y, radius));
      }
    }

    return results;
  }
}

function dist(body1: PhysicsBody, body2: PhysicsBody) {
  return Math.sqrt(
    Math.pow(body1.posX - body2.posX, 2) + Math.pow(body1.posY - body2.posY, 2)
  );
}

function* computeCollisions(kdtree: KDTree, bodies: PhysicsBody[]) {
  const maxRadius = Math.max(...bodies.map(({ radius }) => radius));
  for (let body of bodies) {
    const candidates = kdtree.query(
      body.posX,
      body.posY,
      body.radius + maxRadius
    );
    const colliders = candidates.filter(
      candidate =>
        dist(body, candidate) < body.radius + candidate.radius &&
        body.posX < candidate.posX
    );

    for (let collider of colliders) {
      yield [body, collider] as [PhysicsBody, PhysicsBody];
    }
  }
}

function computeElasticCollision(
  x1: number,
  y1: number,
  dx1: number,
  dy1: number,
  x2: number,
  y2: number,
  dx2: number,
  dy2: number
) {
  // recompute velocities

  let dx1f =
    (dx2 * Math.pow(x1 - x2, 2) +
      (-((dy1 - dy2) * (x1 - x2)) + dx1 * (y1 - y2)) * (y1 - y2)) /
    (Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  let dy1f =
    (dy1 * Math.pow(x1 - x2, 2) +
      (-((dx1 - dx2) * (x1 - x2)) + dy2 * (y1 - y2)) * (y1 - y2)) /
    (Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  let dx2f =
    (dx1 * Math.pow(x1 - x2, 2) +
      ((dy1 - dy2) * (x1 - x2) + dx2 * (y1 - y2)) * (y1 - y2)) /
    (Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
  let dy2f =
    (dy2 * Math.pow(x1 - x2, 2) +
      ((dx1 - dx2) * (x1 - x2) + dy1 * (y1 - y2)) * (y1 - y2)) /
    (Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));

  return [dx1f, dy1f, dx2f, dy2f];
}

function separate(body1: PhysicsBody, body2: PhysicsBody) {
  const l = dist(body1, body2);

  const ux =
    (((body1.posX - body2.posX) / l) * (body1.radius + body2.radius - l)) / 2;
  const uy =
    (((body1.posY - body2.posY) / l) * (body1.radius + body2.radius - l)) / 2;

  body1.posX += ux;
  body1.posY += uy;

  body2.posX -= ux;
  body2.posY -= uy;
}

export function stepCollisions(bodies: PhysicsBody[]) {
  const kdtree = new KDTree(bodies, 3, 15);

  let itr = computeCollisions(kdtree, bodies);
  for (let { value, done } = itr.next(); !done; { value, done } = itr.next()) {
    const [circle1, circle2] = value || null;
    [
      circle1.velX,
      circle1.velY,
      circle2.velX,
      circle2.velY
    ] = computeElasticCollision(
      circle1.posX,
      circle1.posY,
      circle1.velX,
      circle1.velY,
      circle2.posX,
      circle2.posY,
      circle2.velX,
      circle2.velY
    );
    separate(circle1, circle2);
  }
}
