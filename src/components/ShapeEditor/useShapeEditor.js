import { ref } from 'vue'
import { drawShape } from './canvasUtils'

const gridSpacing = 32 // grid spacing in px

export function useShapeEditor(canvas, mousePos = ref({ x: 0, y: 0 }), hovering = ref(false)) {
  let ctx
  let el // for canvas element
  const shapes = ref([])
  const currentShape = ref(null)
  const drawing = ref(false)
  const shapeType = ref('line')
  const snapRadius = 10
  const snappedPoint = ref(null)

  // Pan state: offset origin by gridSpacing from top-left
  const pan = ref({ x: gridSpacing, y: gridSpacing })
  let isPanning = false
  let lastPan = { x: 0, y: 0 }
  let mouseDownPos = null

  function initCanvas() {
    el = canvas.value
    const parent = el.parentElement
    el.width = parent.offsetWidth
    el.height = parent.offsetHeight
    ctx = el.getContext('2d')
  }

  function drawGrid(ctx, width, height, pan, spacing = gridSpacing) {
    ctx.save()
    ctx.strokeStyle = '#eee'
    ctx.lineWidth = 1
    ctx.beginPath()
    // Vertical lines
    for (let x = pan.x % spacing; x < width; x += spacing) {
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
    }
    // Horizontal lines
    for (let y = pan.y % spacing; y < height; y += spacing) {
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
    }
    ctx.stroke()
    ctx.restore()
  }

  function drawAxes(ctx, width, height, pan) {
    ctx.save()
    ctx.strokeStyle = '#aaa'
    ctx.lineWidth = 2
    // X axis
    ctx.beginPath()
    ctx.moveTo(0, pan.y)
    ctx.lineTo(width, pan.y)
    ctx.stroke()
    // Y axis
    ctx.beginPath()
    ctx.moveTo(pan.x, 0)
    ctx.lineTo(pan.x, height)
    ctx.stroke()
    // Draw origin
    ctx.fillStyle = '#888'
    ctx.beginPath()
    ctx.arc(pan.x, pan.y, 4, 0, 2 * Math.PI)
    ctx.fill()
    ctx.restore()
  }

  function findSnapPoint(x, y) {
    // Check all points in shapes and currentShape (if polygon)
    let closest = null
    let minDist = snapRadius
    // Check shapes
    for (const shape of shapes.value) {
      if (shape.type === 'line') {
        for (const pt of [shape.start, shape.end]) {
          const dist = Math.hypot(pt.x - x, pt.y - y)
          if (dist < minDist) {
            minDist = dist
            closest = pt
          }
        }
      } else if (shape.type === 'polygon') {
        for (const pt of shape.points) {
          const dist = Math.hypot(pt.x - x, pt.y - y)
          if (dist < minDist) {
            minDist = dist
            closest = pt
          }
        }
      }
    }
    // Optionally snap to current polygon points
    if (currentShape.value && currentShape.value.type === 'polygon') {
      for (const pt of currentShape.value.points) {
        const dist = Math.hypot(pt.x - x, pt.y - y)
        if (dist < minDist) {
          minDist = dist
          closest = pt
        }
      }
    }
    return closest
  }

  function drawAll() {
    ctx.clearRect(0, 0, el.width, el.height)
    drawGrid(ctx, el.width, el.height, pan.value)
    drawAxes(ctx, el.width, el.height, pan.value)
    ctx.save()
    ctx.translate(pan.value.x, pan.value.y)
    for (let shape of shapes.value) {
      drawShape(ctx, shape)
    }
    if (currentShape.value) {
      drawShape(ctx, currentShape.value)
    }
    ctx.restore()
    // Draw cursor overlay
    if (hovering.value && !isPanning && mousePos.value) {
      ctx.save()
      ctx.beginPath()
      if (snappedPoint.value) {
        ctx.arc(
          snappedPoint.value.x + pan.value.x,
          snappedPoint.value.y + pan.value.y,
          6,
          0,
          2 * Math.PI
        )
        ctx.strokeStyle = '#1ec41e'
      } else {
        ctx.arc(mousePos.value.x, mousePos.value.y, 6, 0, 2 * Math.PI)
        ctx.strokeStyle = '#007bff'
      }
      ctx.lineWidth = 2
      ctx.globalAlpha = 0.7
      ctx.stroke()
      ctx.restore()
    }
  }

  function onMouseDown(e) {
    if (e.button === 2) {
      // right mouse button for panning
      isPanning = true
      lastPan = { x: e.clientX, y: e.clientY }
      return
    }
    const x = e.offsetX - pan.value.x,
      y = e.offsetY - pan.value.y
    const usePt = snappedPoint.value ? snappedPoint.value : { x, y }

    if (shapeType.value === 'line') {
      if (!drawing.value) {
        // First click or drag start: start line
        drawing.value = true
        currentShape.value = {
          type: 'line',
          start: { x: usePt.x, y: usePt.y },
          end: { x: usePt.x, y: usePt.y }
        }
        mouseDownPos = { x: usePt.x, y: usePt.y }
      } else {
        // Second click: end line
        currentShape.value.end = { x: usePt.x, y: usePt.y }
        shapes.value.push(currentShape.value)
        currentShape.value = null
        drawing.value = false
        mouseDownPos = null
      }
    } else if (shapeType.value === 'polygon') {
      if (!drawing.value) {
        // Start new polygon
        drawing.value = true
        currentShape.value = { type: 'polygon', points: [{ x: usePt.x, y: usePt.y }] }
      } else {
        // Add point to polygon
        currentShape.value.points.push({ x: usePt.x, y: usePt.y })
      }
    }
    drawAll()
  }

  function onMouseMove(e) {
    if (isPanning) {
      const dx = e.clientX - lastPan.x
      const dy = e.clientY - lastPan.y
      pan.value.x += dx
      pan.value.y += dy
      lastPan = { x: e.clientX, y: e.clientY }
      drawAll()
      return
    }
    if (!drawing.value && !hovering.value) return
    const x = e.offsetX - pan.value.x,
      y = e.offsetY - pan.value.y
    // Snapping logic
    const snap = findSnapPoint(x, y)
    if (snap) {
      snappedPoint.value = { x: snap.x, y: snap.y }
    } else {
      snappedPoint.value = null
    }
    if (!drawing.value || !currentShape.value) {
      drawAll()
      return
    }
    const usePt = snappedPoint.value ? snappedPoint.value : { x, y }
    if (shapeType.value === 'line') {
      currentShape.value.end = { x: usePt.x, y: usePt.y }
    } else if (shapeType.value === 'polygon') {
      // Show preview of next segment
      const points = currentShape.value.points
      if (points.length > 0) {
        currentShape.value.preview = { x: usePt.x, y: usePt.y }
      }
    }
    drawAll()
  }

  function onMouseUp(e) {
    if (isPanning && e.button === 2) {
      isPanning = false
      return
    }
    if (shapeType.value === 'line' && drawing.value && mouseDownPos) {
      // If mouse has moved, treat as drag-to-draw
      const x = e.offsetX - pan.value.x,
        y = e.offsetY - pan.value.y
      const dist = Math.hypot(x - mouseDownPos.x, y - mouseDownPos.y)
      if (dist > 2) {
        // threshold to distinguish click vs drag
        currentShape.value.end = { x, y }
        shapes.value.push(currentShape.value)
        currentShape.value = null
        drawing.value = false
        mouseDownPos = null
      }
    }
    // For polygon, mouse up does not finalize the shape
    drawAll()
  }

  function onRightClick(e) {
    // Prevent context menu, handled by Vue template
  }

  function onDblClick(e) {
    if (shapeType.value === 'polygon' && drawing.value && currentShape.value) {
      // Close polygon
      if (currentShape.value.points.length > 2) {
        // Remove preview if exists
        delete currentShape.value.preview
        shapes.value.push(currentShape.value)
        currentShape.value = null
        drawing.value = false
        drawAll()
      }
    }
  }

  function cancelDrawing() {
    drawing.value = false
    currentShape.value = null
    mouseDownPos = null
    snappedPoint.value = null
    drawAll()
  }

  return {
    initCanvas,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onRightClick,
    drawAll,
    onDblClick,
    cancelDrawing,
    shapeType,
    snappedPoint
  }
}
