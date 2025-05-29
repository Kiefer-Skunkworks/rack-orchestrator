export function drawShape(ctx, shape) {
  ctx.beginPath()
  ctx.strokeStyle = shape.color || 'black'

  switch (shape.type) {
    case 'line':
      ctx.moveTo(shape.start.x, shape.start.y)
      ctx.lineTo(shape.end.x, shape.end.y)
      break
    case 'polygon':
      if (shape.points && shape.points.length > 0) {
        ctx.beginPath()
        ctx.moveTo(shape.points[0].x, shape.points[0].y)
        for (let i = 1; i < shape.points.length; i++) {
          ctx.lineTo(shape.points[i].x, shape.points[i].y)
        }
        if (shape.preview) {
          ctx.lineTo(shape.preview.x, shape.preview.y)
        }
        const first = shape.points[0]
        const last = shape.points[shape.points.length - 1]
        if (shape.points.length > 2 && first.x === last.x && first.y === last.y) {
          ctx.closePath()
        }
        ctx.stroke()
        return
      }
      break
    default:
      break
  }

  ctx.stroke()
}
