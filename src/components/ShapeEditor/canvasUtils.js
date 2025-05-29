export function drawShape(ctx, shape, pan, pixelsPerUnit) {
  ctx.beginPath()
  ctx.strokeStyle = shape.color || 'black'

  function toScreen(pt) {
    return {
      x: pan.x + pt.x * pixelsPerUnit,
      y: pan.y + pt.y * pixelsPerUnit
    }
  }

  switch (shape.type) {
    case 'line': {
      const start = toScreen(shape.start)
      const end = toScreen(shape.end)
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
      break
    }
    case 'polygon':
      if (shape.points && shape.points.length > 0) {
        ctx.beginPath()
        const first = toScreen(shape.points[0])
        ctx.moveTo(first.x, first.y)
        for (let i = 1; i < shape.points.length; i++) {
          const pt = toScreen(shape.points[i])
          ctx.lineTo(pt.x, pt.y)
        }
        if (shape.preview) {
          const preview = toScreen(shape.preview)
          ctx.lineTo(preview.x, preview.y)
        }
        const last = toScreen(shape.points[shape.points.length - 1])
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
