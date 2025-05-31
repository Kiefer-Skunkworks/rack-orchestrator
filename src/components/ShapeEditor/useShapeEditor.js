import { ref, computed } from 'vue'
import { drawShape } from './canvasUtils'
import {
  shapes,
  currentShape,
  drawing,
  selectedShape,
  snapRadius,
  findSnapPoint,
  hitTestShape,
  addDefaultCube
} from './shapeLogic'
import {
  createOnMouseMove,
  createOnMouseDown,
  createOnMouseUp,
  createOnDblClick,
  createOnRightClick
} from './shapeEditorHandlers'

const gridSpacing = 32 // grid spacing in px

export function useShapeEditor(
  canvas,
  mousePos = ref({ x: 0, y: 0 }),
  hovering = ref(false),
  zoom = ref(1.0)
) {
  let ctx
  let el // for canvas element

  // Tool/mode selector
  const shapeType = ref('line')

  // Snapped point for cursor overlay and snapping logic
  const snappedPoint = ref(null)

  // Pan state: offset origin by a fixed value (to get out from under UI elements)
  const INITIAL_PAN_OFFSET_Y = 64 // px
  const INITIAL_PAN_OFFSET_X = 72 // px
  const pan = ref({ x: INITIAL_PAN_OFFSET_X, y: INITIAL_PAN_OFFSET_Y })
  const isPanning = ref(false)
  const lastPan = ref({ x: 0, y: 0 })
  const mouseDownPos = ref(null)

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

    const scale = pxPerUnit * zoom.value
    // 1. Real-world coordinate at left/top edge
    const x0 = -pan.x / scale
    const y0 = -pan.y / scale

    // 2. First grid intersection ≤ x0/y0
    const firstGridX = Math.floor(x0 / spacingUnits) * spacingUnits
    const firstGridY = Math.floor(y0 / spacingUnits) * spacingUnits

    // 3. Draw vertical grid lines
    for (let gx = firstGridX; gx * scale + pan.x < width; gx += spacingUnits) {
      const x = gx * scale + pan.x
      if (x >= 0) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
      }
    }

    // 4. Draw horizontal grid lines
    for (let gy = firstGridY; gy * scale + pan.y < height; gy += spacingUnits) {
      const y = gy * scale + pan.y
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
      for (let gx = firstGridX; gx * scale + pan.x < width; gx += spacingUnits) {
        const x = gx * scale + pan.x
        if (x >= 0) {
          for (let gy = firstGridY; gy * scale + pan.y < height; gy += spacingUnits) {
            const y = gy * scale + pan.y
            if (y >= 0) {
              ctx.beginPath()
              ctx.arc(x, y, 1, 0, 2 * Math.PI)
              ctx.fill()
            }
          }
        }
      }
      ctx.restore()
    }
    ctx.restore()
  }

  function drawAxes(ctx, width, height, pan, pxPerUnit = pixelsPerUnit.value) {
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

  function drawAll() {
    ctx.clearRect(0, 0, el.width, el.height)
    drawGrid(ctx, el.width, el.height, pan.value, gridSpacingUnits.value, pixelsPerUnit.value)
    drawAxes(ctx, el.width, el.height, pan.value, pixelsPerUnit.value)
    ctx.save()
    for (let shape of shapes.value) {
      // Highlight selected shape
      try {
        if (selectedShape.value === shape) {
          ctx.save()
          ctx.shadowColor = '#1ec41e'
          ctx.shadowBlur = 8
          ctx.lineWidth = 4
          ctx.globalAlpha = 0.7
          drawShape(ctx, shape, pan.value, pixelsPerUnit.value, zoom.value)
          ctx.restore()
        } else {
          drawShape(ctx, shape, pan.value, pixelsPerUnit.value, zoom.value)
        }
      } catch (err) {
        console.error('drawAll: error drawing shape', err, shape)
      }
    }
    if (currentShape.value) {
      try {
        drawShape(ctx, currentShape.value, pan.value, pixelsPerUnit.value, zoom.value)
      } catch (err) {
        console.error('drawAll: error drawing currentShape', err, currentShape.value)
      }
    }
    ctx.restore()
    // Draw cursor overlay
    if (hovering.value && !isPanning.value && mousePos.value) {
      ctx.save()
      ctx.beginPath()
      if (snappedPoint.value) {
        ctx.arc(
          snappedPoint.value.x * pixelsPerUnit.value * zoom.value + pan.value.x,
          snappedPoint.value.y * pixelsPerUnit.value * zoom.value + pan.value.y,
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

  // Use the extracted onMouseDown handler
  const onMouseDown = createOnMouseDown({
    isPanning,
    lastPan,
    pan,
    pixelsPerUnit,
    zoom,
    snapToGrid,
    snapPointToGrid,
    findSnapPoint,
    shapeType,
    shapes,
    selectedShape,
    drawing,
    currentShape,
    mouseDownPos,
    snapRadius,
    drawAll,
    hitTestShape
  })

  // Use the extracted onMouseMove handler
  const onMouseMove = createOnMouseMove({
    hovering,
    mousePos,
    snappedPoint,
    isPanning,
    lastPan,
    pan,
    drawAll,
    drawing,
    pixelsPerUnit,
    zoom,
    snapToGrid,
    snapPointToGrid,
    findSnapPoint,
    currentShape,
    shapeType
  })

  // Use the extracted onMouseUp handler
  const onMouseUp = createOnMouseUp({
    isPanning,
    pan,
    pixelsPerUnit,
    zoom,
    shapeType,
    drawing,
    mouseDownPos,
    snapToGrid,
    snapPointToGrid,
    findSnapPoint,
    currentShape,
    shapes,
    drawAll
  })

  // Use the extracted onDblClick handler
  const onDblClick = createOnDblClick({
    shapeType,
    drawing,
    currentShape,
    shapes,
    drawAll
  })

  // Use the extracted onRightClick handler
  const onRightClick = createOnRightClick()

  function cancelDrawing() {
    drawing.value = false
    currentShape.value = null
    mouseDownPos.value = null
    snappedPoint.value = null
    selectedShape.value = null
    drawAll()
  }

  function cancelPan() {
    isPanning.value = false
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
    let x = (e.offsetX - pan.value.x) / (pixelsPerUnit.value * zoom.value),
      y = (e.offsetY - pan.value.y) / (pixelsPerUnit.value * zoom.value)
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
    drawAll()
  }

  function setShowGrid(val) {
    showGrid.value = !!val
    if (!showGrid.value) snapToGrid.value = false
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
