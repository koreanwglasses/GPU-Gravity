import { PhysicsBody } from "../model/physics-body";
export function renderToCanvas(
  ctx: CanvasRenderingContext2D,
  bodies: PhysicsBody[]
) {
  bodies.forEach(({ posX, posY, radius }) => {
    ctx.beginPath();
    ctx.arc(posX, posY, radius, 0, 2 * Math.PI);
    ctx.fill();
  });
}
