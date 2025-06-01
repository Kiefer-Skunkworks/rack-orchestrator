export function toScreenCoords(pt, pan, pixelsPerUnit, zoom) {
  const scale = pixelsPerUnit * zoom
  return {
    x: pan.x + pt.x * scale,
    y: pan.y + pt.y * scale
  }
}

export function toWorld(x, y, pan, pixelsPerUnit, zoom) {
  const scale = pixelsPerUnit * zoom
  return {
    x: (x - pan.x) / scale,
    y: (y - pan.y) / scale
  }
}

export function drawShape(ctx, shape, pan, pixelsPerUnit, zoom) {
  try {
    ctx.beginPath()
    ctx.strokeStyle = shape.color || 'black'

    switch (shape.type) {
      case 'line': {
        if (
          !shape.start ||
          typeof shape.start.x !== 'number' ||
          typeof shape.start.y !== 'number' ||
          !shape.end ||
          typeof shape.end.x !== 'number' ||
          typeof shape.end.y !== 'number'
        ) {
          console.warn('drawShape: invalid line shape', shape)
          return
        }
        const start = toScreenCoords(shape.start, pan, pixelsPerUnit, zoom)
        const end = toScreenCoords(shape.end, pan, pixelsPerUnit, zoom)
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(end.x, end.y)
        break
      }
      case 'polygon':
        if (shape.points && shape.points.length > 0) {
          ctx.beginPath()
          const first = shape.points[0]
          if (!first || typeof first.x !== 'number' || typeof first.y !== 'number') {
            console.warn('drawShape: first point is invalid', first, shape)
            return
          }
          const firstScreen = toScreenCoords(first, pan, pixelsPerUnit, zoom)
          ctx.moveTo(firstScreen.x, firstScreen.y)
          for (let i = 1; i < shape.points.length; i++) {
            const pt = shape.points[i]
            if (!pt || typeof pt.x !== 'number' || typeof pt.y !== 'number') {
              console.warn('drawShape: skipping invalid point', pt, shape)
              continue
            }
            const ptScreen = toScreenCoords(pt, pan, pixelsPerUnit, zoom)
            ctx.lineTo(ptScreen.x, ptScreen.y)
          }
          if (
            shape.preview &&
            typeof shape.preview.x === 'number' &&
            typeof shape.preview.y === 'number'
          ) {
            const previewScreen = toScreenCoords(shape.preview, pan, pixelsPerUnit, zoom)
            ctx.lineTo(previewScreen.x, previewScreen.y)
          }
          const last = shape.points[shape.points.length - 1]
          if (
            shape.points.length > 2 &&
            last &&
            first &&
            first.x === last.x &&
            first.y === last.y
          ) {
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
  } catch (err) {
    console.error('drawShape: error', err, { shape, pan, pixelsPerUnit, zoom })
    throw err
  }
}

export function drawLineWithHandles(ctx, a, b, pan, pixelsPerUnit, zoom, handleRadius = 7) {
  // Draw black outline
  ctx.save()
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 4
  ctx.globalAlpha = 1.0
  ctx.beginPath()
  const aScreen = toScreenCoords(a, pan, pixelsPerUnit, zoom)
  const bScreen = toScreenCoords(b, pan, pixelsPerUnit, zoom)
  ctx.moveTo(aScreen.x, aScreen.y)
  ctx.lineTo(bScreen.x, bScreen.y)
  ctx.stroke()
  ctx.restore()
  // Draw white line
  ctx.save()
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 2
  ctx.globalAlpha = 1.0
  ctx.beginPath()
  ctx.moveTo(aScreen.x, aScreen.y)
  ctx.lineTo(bScreen.x, bScreen.y)
  ctx.stroke()
  ctx.restore()
  // Draw draggable handles at endpoints
  ctx.save()
  ctx.fillStyle = '#fff'
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 2
  // Start point
  ctx.beginPath()
  ctx.arc(aScreen.x, aScreen.y, handleRadius, 0, 2 * Math.PI)
  ctx.fill()
  ctx.stroke()
  // End point
  ctx.beginPath()
  ctx.arc(bScreen.x, bScreen.y, handleRadius, 0, 2 * Math.PI)
  ctx.fill()
  ctx.stroke()
  ctx.restore()
}
