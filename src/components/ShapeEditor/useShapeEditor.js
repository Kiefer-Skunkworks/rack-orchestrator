import { ref, computed } from 'vue'
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
  const selectedShape = ref(null)

  // Pan state: offset origin by gridSpacing from top-left
  const pan = ref({ x: gridSpacing, y: gridSpacing })
  let isPanning = false
  let lastPan = { x: 0, y: 0 }
  let mouseDownPos = null

  // --- UNIT & SCALE STATE ---
  const DPI = 96 // web standard, can be made user-configurable
  const unit = ref('mm') // 'mm' or 'in'
  const pixelsPerUnit = ref(DPI / 25.4) // default for mm
  const gridSpacingUnits = ref(5) // 5mm or 0.25in
  const snapToGrid = ref(true)

  // Grid size options for each unit
  const gridSizeOptions = {
    mm: [1, 2, 5, 10, 20, 50], // mm
    in: [0.125, 0.25, 0.5, 1, 2] // inches
  }

  const currentGridSizeOptions = computed(() => gridSizeOptions[unit.value])

  const showGridDots = ref(true)
  const showGrid = ref(true)

  function initCanvas() {
    el = canvas.value
    const parent = el.parentElement
    el.width = parent.offsetWidth
    el.height = parent.offsetHeight
    ctx = el.getContext('2d')
    // Add default cube on new document
    shapes.value = []
    addDefaultCube()
  }

  function drawGrid(
    ctx,
    width,
    height,
    pan,
    spacingUnits = gridSpacingUnits.value,
    pxPerUnit = pixelsPerUnit.value
  ) {
    if (!showGrid.value) return
    ctx.save()
    ctx.strokeStyle = showGridDots.value ? 'rgba(0,0,0,0)' : '#eee'
    ctx.lineWidth = 1
    ctx.beginPath()

    // 1. Real-world coordinate at left/top edge
    const x0 = -pan.x / pxPerUnit
    const y0 = -pan.y / pxPerUnit

    // 2. First grid intersection ≤ x0/y0
    const firstGridX = Math.floor(x0 / spacingUnits) * spacingUnits
    const firstGridY = Math.floor(y0 / spacingUnits) * spacingUnits

    // 3. Draw vertical grid lines
    for (let gx = firstGridX; gx * pxPerUnit + pan.x < width; gx += spacingUnits) {
      const x = gx * pxPerUnit + pan.x
      if (x >= 0) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
      }
    }

    // 4. Draw horizontal grid lines
    for (let gy = firstGridY; gy * pxPerUnit + pan.y < height; gy += spacingUnits) {
      const y = gy * pxPerUnit + pan.y
      if (y >= 0) {
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
      }
    }

    ctx.stroke()

    // --- DEBUG: draw lighter dots at grid intersections if enabled ---
    if (showGridDots.value) {
      ctx.save()
      ctx.fillStyle = '#aad'
      for (let gx = firstGridX; gx * pxPerUnit + pan.x < width; gx += spacingUnits) {
        const x = gx * pxPerUnit + pan.x
        if (x >= 0) {
          for (let gy = firstGridY; gy * pxPerUnit + pan.y < height; gy += spacingUnits) {
            const y = gy * pxPerUnit + pan.y
            if (y >= 0) {
              ctx.beginPath()
              ctx.arc(x, y, 2, 0, 2 * Math.PI)
              ctx.fill()
            }
          }
        }
      }
      ctx.restore()
    }
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

  function hitTestShape(shape, x, y, tolerance = 8) {
    if (shape.type === 'line') {
      // Distance from point to line segment
      const { start, end } = shape
      const dx = end.x - start.x
      const dy = end.y - start.y
      const lengthSq = dx * dx + dy * dy
      if (lengthSq === 0) return Math.hypot(x - start.x, y - start.y) < tolerance
      let t = ((x - start.x) * dx + (y - start.y) * dy) / lengthSq
      t = Math.max(0, Math.min(1, t))
      const projX = start.x + t * dx
      const projY = start.y + t * dy
      return Math.hypot(x - projX, y - projY) < tolerance
    } else if (shape.type === 'polygon') {
      // Check if point is near any segment
      const pts = shape.points
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i],
          b = pts[i + 1]
        const dx = b.x - a.x
        const dy = b.y - a.y
        const lengthSq = dx * dx + dy * dy
        if (lengthSq === 0) continue
        let t = ((x - a.x) * dx + (y - a.y) * dy) / lengthSq
        t = Math.max(0, Math.min(1, t))
        const projX = a.x + t * dx
        const projY = a.y + t * dy
        if (Math.hypot(x - projX, y - projY) < tolerance) return true
      }
      return false
    }
    return false
  }

  function drawAll() {
    ctx.clearRect(0, 0, el.width, el.height)
    drawGrid(ctx, el.width, el.height, pan.value)
    drawAxes(ctx, el.width, el.height, pan.value)
    ctx.save()
    for (let shape of shapes.value) {
      // Highlight selected shape
      if (selectedShape.value === shape) {
        ctx.save()
        ctx.shadowColor = '#1ec41e'
        ctx.shadowBlur = 8
        ctx.lineWidth = 4
        ctx.globalAlpha = 0.7
        drawShape(ctx, shape, pan.value, pixelsPerUnit.value)
        ctx.restore()
      } else {
        drawShape(ctx, shape, pan.value, pixelsPerUnit.value)
      }
    }
    if (currentShape.value) {
      drawShape(ctx, currentShape.value, pan.value, pixelsPerUnit.value)
    }
    ctx.restore()
    // Draw cursor overlay
    if (hovering.value && !isPanning && mousePos.value) {
      ctx.save()
      ctx.beginPath()
      if (snappedPoint.value) {
        ctx.arc(
          snappedPoint.value.x * pixelsPerUnit.value + pan.value.x,
          snappedPoint.value.y * pixelsPerUnit.value + pan.value.y,
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
    // Convert mouse to real-world units
    let x = (e.offsetX - pan.value.x) / pixelsPerUnit.value,
      y = (e.offsetY - pan.value.y) / pixelsPerUnit.value
    if (snapToGrid.value) {
      const snapped = snapPointToGrid(x, y)
      x = snapped.x
      y = snapped.y
    }
    // Always check for snap at click time
    const snap = findSnapPoint(x, y)
    const usePt = snap ? { x: snap.x, y: snap.y } : { x, y }
    if (shapeType.value === 'select') {
      // Selection logic
      let found = null
      // Check from topmost shape to bottom
      for (let i = shapes.value.length - 1; i >= 0; i--) {
        if (hitTestShape(shapes.value[i], usePt.x, usePt.y)) {
          found = shapes.value[i]
          break
        }
      }
      selectedShape.value = found
      drawAll()
      return
    }
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
        // If click is near the first point and at least 3 points, close polygon
        const points = currentShape.value.points
        if (points.length > 2) {
          const first = points[0]
          const distToFirst = Math.hypot(usePt.x - first.x, usePt.y - first.y)
          if (distToFirst < snapRadius) {
            // Close polygon
            delete currentShape.value.preview
            shapes.value.push({
              ...currentShape.value,
              points: [...points, first]
            })
            currentShape.value = null
            drawing.value = false
            drawAll()
            return
          }
        }
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
    // Convert mouse to real-world units
    let x = (e.offsetX - pan.value.x) / pixelsPerUnit.value,
      y = (e.offsetY - pan.value.y) / pixelsPerUnit.value
    let snappedGrid = null
    if (snapToGrid.value) {
      const snapped = snapPointToGrid(x, y)
      x = snapped.x
      y = snapped.y
      snappedGrid = { x, y }
    }
    // Snapping logic
    const snap = findSnapPoint(x, y)
    if (snap) {
      snappedPoint.value = { x: snap.x, y: snap.y }
    } else if (snappedGrid) {
      snappedPoint.value = { x: snappedGrid.x, y: snappedGrid.y }
    } else {
      snappedPoint.value = null
    }
    // --- DEBUG: log mouse and snapped point ---
    if (snappedPoint.value) {
      console.log(
        'Mouse:',
        ((e.offsetX - pan.value.x) / pixelsPerUnit.value).toFixed(2),
        ((e.offsetY - pan.value.y) / pixelsPerUnit.value).toFixed(2),
        'Snapped:',
        snappedPoint.value.x.toFixed(2),
        snappedPoint.value.y.toFixed(2)
      )
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
      let x = (e.offsetX - pan.value.x) / pixelsPerUnit.value,
        y = (e.offsetY - pan.value.y) / pixelsPerUnit.value
      const dist = Math.hypot(x - mouseDownPos.x, y - mouseDownPos.y)
      if (dist > 2) {
        // threshold to distinguish click vs drag
        if (snapToGrid.value) {
          const snapped = snapPointToGrid(x, y)
          x = snapped.x
          y = snapped.y
        }
        const snap = findSnapPoint(x, y)
        const usePt = snap ? { x: snap.x, y: snap.y } : { x, y }
        currentShape.value.end = { x: usePt.x, y: usePt.y }
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
      // Close polygon if at least 3 points
      if (currentShape.value.points.length > 2) {
        // Remove preview if exists
        delete currentShape.value.preview
        shapes.value.push({
          ...currentShape.value,
          // Ensure the polygon is closed by repeating the first point if needed
          points: [...currentShape.value.points, currentShape.value.points[0]]
        })
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
    selectedShape.value = null
    drawAll()
  }

  function cancelPan() {
    isPanning = false
  }

  function setUnit(newUnit) {
    unit.value = newUnit
    if (newUnit === 'mm') {
      pixelsPerUnit.value = DPI / 25.4
      // If current grid spacing is not valid for mm, reset to default
      if (!gridSizeOptions.mm.includes(gridSpacingUnits.value)) {
        gridSpacingUnits.value = 5
      }
    } else {
      pixelsPerUnit.value = DPI
      if (!gridSizeOptions.in.includes(gridSpacingUnits.value)) {
        gridSpacingUnits.value = 0.25
      }
    }
    drawAll()
  }

  function setGridSpacingUnits(newSpacing) {
    gridSpacingUnits.value = newSpacing
    drawAll()
  }

  function addDefaultCube() {
    // Always add a 100mm x 100mm square at the origin, regardless of unit
    const size = 100 // 100mm
    shapes.value.push({
      type: 'polygon',
      points: [
        { x: 0, y: 0 },
        { x: size, y: 0 },
        { x: size, y: size },
        { x: 0, y: size },
        { x: 0, y: 0 }
      ]
    })
    drawAll()
  }

  function exportShapesToSVG({ unit: exportUnit = unit.value, width = 256, height = 256 } = {}) {
    // If unit is 'in', convert all coordinates and bounds
    const unitStr = exportUnit === 'mm' ? 'mm' : 'in'
    const conv = exportUnit === 'mm' ? 1 : 1 / 25.4 // mm to in

    const svgWidth = width * conv
    const svgHeight = height * conv

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}${unitStr}" height="${svgHeight}${unitStr}" viewBox="0 0 ${svgWidth} ${svgHeight}">\n`

    for (const shape of shapes.value) {
      if (shape.type === 'line') {
        svg += `  <line x1="${shape.start.x * conv}" y1="${shape.start.y * conv}" x2="${shape.end.x * conv}" y2="${shape.end.y * conv}" stroke="black" stroke-width="0.2"/>\n`
      } else if (shape.type === 'polygon') {
        const pts = shape.points.map((pt) => `${pt.x * conv},${pt.y * conv}`).join(' ')
        svg += `  <polyline points="${pts}" fill="none" stroke="black" stroke-width="0.2"/>\n`
      }
    }

    svg += `</svg>`
    return svg
  }

  function setSnapToGrid(val) {
    snapToGrid.value = !!val
  }

  function snapPointToGrid(x, y) {
    const spacing = gridSpacingUnits.value
    return {
      x: Math.round(x / spacing) * spacing,
      y: Math.round(y / spacing) * spacing
    }
  }

  // --- Snap mouse position to grid for initial tool placement ---
  function onMouseMoveInitial(e) {
    if (drawing.value) return // handled by main onMouseMove
    // Convert mouse to real-world units
    let x = (e.offsetX - pan.value.x) / pixelsPerUnit.value,
      y = (e.offsetY - pan.value.y) / pixelsPerUnit.value
    if (snapToGrid.value) {
      const snapped = snapPointToGrid(x, y)
      x = snapped.x
      y = snapped.y
    }
    snappedPoint.value = { x, y }
    drawAll()
  }

  function setShowGridDots(val) {
    showGridDots.value = !!val
  }

  function setShowGrid(val) {
    showGrid.value = !!val
    if (!showGrid.value) snapToGrid.value = false
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
    snappedPoint,
    selectedShape,
    drawing,
    cancelPan,
    shapes,
    // --- UNIT/GRID API ---
    unit,
    setUnit,
    pixelsPerUnit,
    gridSpacingUnits,
    setGridSpacingUnits,
    addDefaultCube,
    gridSizeOptions,
    currentGridSizeOptions,
    exportShapesToSVG,
    snapToGrid,
    setSnapToGrid,
    onMouseMoveInitial,
    showGridDots,
    setShowGridDots,
    showGrid,
    setShowGrid
  }
}
