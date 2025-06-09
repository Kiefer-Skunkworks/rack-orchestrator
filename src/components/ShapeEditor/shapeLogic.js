import { ref } from 'vue'

// Shape-related state
export const shapes = ref([])
export const currentShape = ref(null)
export const drawing = ref(false)
export const selectedShape = ref(null)

// Snap radius for snapping logic
export const snapRadius = 10

// Find the closest snap point among all shapes and currentShape (if polygon)
export function findSnapPoint(x, y) {
  let closest = null
  let minDist = snapRadius
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

// Hit test a shape for proximity to a point
export function hitTestShape(shape, x, y, tolerance = 8) {
  if (shape.type === 'line') {
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

// Returns the index of the edge (segment) of a polygon closest to (x, y), or -1 if none are within tolerance
export function hitTestPolygonEdge(polygon, x, y, tolerance = 8) {
  if (!polygon || polygon.type !== 'polygon' || !polygon.points) return -1
  const pts = polygon.points
  let closestIdx = -1
  let minDist = tolerance
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
    const dist = Math.hypot(x - projX, y - projY)
    if (dist < minDist) {
      minDist = dist
      closestIdx = i
    }
  }
  return closestIdx
}

// Add a default 100mm x 100mm square at the origin
export function addDefaultCube() {
  const size = 100
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
}
