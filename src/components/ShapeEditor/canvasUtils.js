export function drawShape(ctx, shape) {
  ctx.beginPath();
  ctx.strokeStyle = shape.color || 'black';

  switch (shape.type) {
    case 'line':
      ctx.moveTo(shape.start.x, shape.start.y);
      ctx.lineTo(shape.end.x, shape.end.y);
      break;
    default:
      break;
  }

  ctx.stroke();
}
