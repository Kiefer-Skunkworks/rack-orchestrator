export function createOnMouseMove({
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
}) {
  return function onMouseMove(e) {
    hovering.value = true
    mousePos.value = { x: e.offsetX, y: e.offsetY }
    if (isPanning.value) {
      const dx = e.clientX - lastPan.value.x
      const dy = e.clientY - lastPan.value.y
      pan.value.x += dx
      pan.value.y += dy
      lastPan.value = { x: e.clientX, y: e.clientY }
      drawAll()
      return
    }
    let x = (e.offsetX - pan.value.x) / (pixelsPerUnit.value * zoom.value),
      y = (e.offsetY - pan.value.y) / (pixelsPerUnit.value * zoom.value)
    let snappedGrid = null
    if (snapToGrid.value) {
      const snapped = snapPointToGrid(x, y)
      x = snapped.x
      y = snapped.y
      snappedGrid = { x, y }
    }
    const snap = findSnapPoint(x, y)
    if (snap) {
      snappedPoint.value = { x: snap.x, y: snap.y }
    } else if (snappedGrid) {
      snappedPoint.value = { x: snappedGrid.x, y: snappedGrid.y }
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
      const points = currentShape.value.points
      if (points.length > 0) {
        currentShape.value.preview = { x: usePt.x, y: usePt.y }
      }
    }
    drawAll()
  }
}

export function createOnMouseDown({
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
}) {
  return function onMouseDown(e) {
    if (e.button === 2) {
      isPanning.value = true
      lastPan.value = { x: e.clientX, y: e.clientY }
      return
    }
    let x = (e.offsetX - pan.value.x) / (pixelsPerUnit.value * zoom.value),
      y = (e.offsetY - pan.value.y) / (pixelsPerUnit.value * zoom.value)
    if (snapToGrid.value) {
      const snapped = snapPointToGrid(x, y)
      x = snapped.x
      y = snapped.y
    }
    const snap = findSnapPoint(x, y)
    const usePt = snap ? { x: snap.x, y: snap.y } : { x, y }
    if (shapeType.value === 'select') {
      let found = null
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
        drawing.value = true
        currentShape.value = {
          type: 'line',
          start: { x: usePt.x, y: usePt.y },
          end: { x: usePt.x, y: usePt.y }
        }
        mouseDownPos.value = { x: usePt.x, y: usePt.y }
      } else {
        currentShape.value.end = { x: usePt.x, y: usePt.y }
        shapes.value.push(currentShape.value)
        currentShape.value = null
        drawing.value = false
        mouseDownPos.value = null
      }
    } else if (shapeType.value === 'polygon') {
      if (!drawing.value) {
        drawing.value = true
        currentShape.value = { type: 'polygon', points: [{ x: usePt.x, y: usePt.y }] }
      } else {
        const points = currentShape.value.points
        if (points.length > 2) {
          const first = points[0]
          const distToFirst = Math.hypot(usePt.x - first.x, usePt.y - first.y)
          if (distToFirst < snapRadius) {
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
        currentShape.value.points.push({ x: usePt.x, y: usePt.y })
      }
    }
    drawAll()
  }
}

export function createOnMouseUp({
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
}) {
  return function onMouseUp(e) {
    if (isPanning.value && e.button === 2) {
      isPanning.value = false
      return
    }
    if (shapeType.value === 'line' && drawing.value && mouseDownPos.value) {
      let x = (e.offsetX - pan.value.x) / (pixelsPerUnit.value * zoom.value),
        y = (e.offsetY - pan.value.y) / (pixelsPerUnit.value * zoom.value)
      const dist = Math.hypot(x - mouseDownPos.value.x, y - mouseDownPos.value.y)
      if (dist > 2) {
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
        mouseDownPos.value = null
      }
    }
    drawAll()
  }
}

export function createOnDblClick({ shapeType, drawing, currentShape, shapes, drawAll }) {
  return function onDblClick(e) {
    if (shapeType.value === 'polygon' && drawing.value && currentShape.value) {
      if (currentShape.value.points.length > 2) {
        delete currentShape.value.preview
        shapes.value.push({
          ...currentShape.value,
          points: [...currentShape.value.points, currentShape.value.points[0]]
        })
        currentShape.value = null
        drawing.value = false
        drawAll()
      }
    }
  }
}

export function createOnRightClick() {
  return function onRightClick(e) {
    // Prevent context menu, handled by Vue template
  }
}
