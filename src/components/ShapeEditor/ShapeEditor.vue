<template>
  <div class="shape-editor">
    <!-- Top bar: left (tool indicator), center (unit & grid), right (export, zoom) -->
    <div class="editor-top-bar">
      <div class="editor-top-center">
        <div class="unit-grid-controls-wrapper">
          <div class="unit-grid-controls">
            <label style="display: flex; align-items: center; gap: 4px">
              <input type="checkbox" v-model="showGridProxy" />
              Show grid
            </label>
            <label style="display: flex; align-items: center; gap: 4px; margin-left: 16px">
              Units:
              <select v-model="unitProxy">
                <option value="mm">Millimeters (mm)</option>
                <option value="in">Inches (in)</option>
              </select>
            </label>
            <label style="display: flex; align-items: center; gap: 4px; margin-left: 16px">
              Grid:
              <select v-model="gridSizeProxy" :disabled="!showGridProxy">
                <option v-for="size in currentGridSizeOptions" :key="size" :value="size">
                  {{ size }} {{ unit }}
                </option>
              </select>
            </label>
            <label style="display: flex; align-items: center; gap: 4px; margin-left: 16px">
              <input type="checkbox" v-model="snapToGridProxy" :disabled="!showGridProxy" />
              Snap to grid
            </label>
            <label style="display: flex; align-items: center; gap: 4px; margin-left: 16px">
              <input type="checkbox" v-model="showGridDotsProxy" :disabled="!showGridProxy" />
              Show grid dots
            </label>
          </div>
        </div>
      </div>
      <div class="editor-top-right">
        <div class="top-bar-group">
          <button class="export-svg-btn" @click="exportSVG">Export SVG</button>
          <span v-if="showCopied" class="copied-msg">Copied!</span>
          <div
            class="zoom-controls"
            style="display: inline-flex; align-items: center; gap: 4px; margin-left: 16px"
          >
            <button @click="zoomOut" title="Zoom out" style="width: 28px">-</button>
            <span class="zoom-text" style="min-width: 48px; text-align: center"
              >{{ Math.round(zoom * 100) }}%</span
            >
            <button @click="zoomIn" title="Zoom in" style="width: 28px">+</button>
            <button @click="resetZoom" title="Reset zoom" style="width: 28px">⟳</button>
          </div>
        </div>
      </div>
    </div>
    <!-- Full-height left toolbar -->
    <div class="left-toolbar">
      <ToolBar :shapeType="shapeType" :setTool="setTool" vertical showDivider />
    </div>
    <canvas
      ref="canvas"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @dblclick="handleDblClick"
      @mouseleave="handleMouseLeave"
      @contextmenu.prevent="handleContextMenu"
    ></canvas>
    <ToolIndicator :shapeType="shapeType" />
    <ContextMenu
      :show="showContextMenu"
      :position="contextMenuPos"
      :activeTool="shapeType"
      :onSelect="handleMenuSelect"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useShapeEditor } from './useShapeEditor'
import ToolBar from './ToolBar.vue'
import ToolIndicator from './ToolIndicator.vue'
import ContextMenu from './ContextMenu.vue'

const canvas = ref(null)
const mousePos = ref({ x: 0, y: 0 })
const hovering = ref(false)
const showContextMenu = ref(false)
const contextMenuPos = ref({ x: 0, y: 0 })
const rightMouseDown = ref(false)
const rightMouseDownPos = ref({ x: 0, y: 0 })
const rightMouseDownTime = ref(0)
const PAN_THRESHOLD = 5
const CONTEXT_MENU_TIME = 400 // ms
const showCopied = ref(false)
const zoom = ref(1.0)

const {
  initCanvas,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onRightClick,
  drawAll,
  onDblClick,
  cancelDrawing,
  shapeType,
  drawing,
  cancelPan,
  shapes,
  unit,
  setUnit,
  gridSpacingUnits,
  setGridSpacingUnits,
  currentGridSizeOptions,
  snapToGrid,
  setSnapToGrid,
  showGridDots,
  setShowGridDots,
  showGrid,
  setShowGrid
} = useShapeEditor(canvas, mousePos, hovering, zoom)

// Proxy for v-model to call setUnit
const unitProxy = computed({
  get: () => unit.value,
  set: (val) => setUnit(val)
})
// Proxy for v-model to call setGridSpacingUnits
const gridSizeProxy = computed({
  get: () => gridSpacingUnits.value,
  set: (val) => setGridSpacingUnits(Number(val))
})
// Proxy for v-model to call setSnapToGrid
const snapToGridProxy = computed({
  get: () => snapToGrid.value,
  set: (val) => setSnapToGrid(val)
})
// Proxy for v-model to call setShowGridDots
const showGridDotsProxy = computed({
  get: () => showGridDots.value,
  set: (val) => setShowGridDots(val)
})
const showGridProxy = computed({
  get: () => showGrid.value,
  set: (val) => setShowGrid(val)
})

function setTool(tool) {
  shapeType.value = tool
}

function handleResize() {
  initCanvas()
  drawAll(zoom.value)
}

function handleMouseMove(e) {
  if (showContextMenu.value) return
  hovering.value = true
  mousePos.value = { x: e.offsetX, y: e.offsetY }
  onMouseMove(e)
}

function handleMouseLeave() {
  hovering.value = false
  rightMouseDown.value = false
}

function handleMouseDown(e) {
  if (showContextMenu.value) return
  if (e.button === 2) {
    e.preventDefault()
    rightMouseDown.value = true
    rightMouseDownPos.value = { x: e.clientX, y: e.clientY }
    rightMouseDownTime.value = Date.now()
    // Start pan logic
    onMouseDown(e)
    return
  }
  onMouseDown(e)
}

function handleMouseUp(e) {
  if (showContextMenu.value) return
  if (e.button === 2 && rightMouseDown.value) {
    e.preventDefault()
    const dx = e.clientX - rightMouseDownPos.value.x
    const dy = e.clientY - rightMouseDownPos.value.y
    const dist = Math.hypot(dx, dy)
    const dt = Date.now() - rightMouseDownTime.value
    rightMouseDown.value = false
    cancelPan()
    onMouseUp(e)
    if (dist < PAN_THRESHOLD && dt < CONTEXT_MENU_TIME) {
      // Show context menu
      showContextMenu.value = true
      contextMenuPos.value = { x: e.clientX, y: e.clientY }
      return
    }
    // Otherwise, treat as pan (already handled in composable)
    return
  }
  onMouseUp(e)
}

function handleContextMenu(e) {
  e.preventDefault()
}

function handleClickOutsideMenu(e) {
  if (showContextMenu.value) {
    showContextMenu.value = false
    // Do not trigger any canvas events
  }
}

function handleKeydown(e) {
  if (showContextMenu.value) {
    if (e.key.toLowerCase() === 'v') {
      handleMenuSelect('select')
      return
    } else if (e.key.toLowerCase() === 'l') {
      handleMenuSelect('line')
      return
    } else if (e.key.toLowerCase() === 'p') {
      handleMenuSelect('polygon')
      return
    } else if (e.key === 'Escape') {
      showContextMenu.value = false
      return
    }
  } else {
    if (e.key.toLowerCase() === 'v') {
      setTool('select')
      return
    } else if (e.key.toLowerCase() === 'l') {
      setTool('line')
      return
    } else if (e.key.toLowerCase() === 'p') {
      setTool('polygon')
      return
    } else if (e.key === 'Escape') {
      if (drawing.value) {
        cancelDrawing()
      } else if (shapeType.value !== 'select') {
        shapeType.value = 'select'
      }
    }
  }
}

function handleMenuSelect(tool) {
  setTool(tool)
  showContextMenu.value = false
}

function handleDblClick(e) {
  if (showContextMenu.value) return
  onDblClick(e)
}

function exportSVG() {
  // Support lines and polygons
  let svgLines = shapes.value
    .filter((s) => s.type === 'line')
    .map(
      (s) =>
        `<line x1="${s.start.x}" y1="${s.start.y}" x2="${s.end.x}" y2="${s.end.y}" stroke="#222" stroke-width="2" />`
    )
    .join('\n  ')
  let svgPolygons = shapes.value
    .filter((s) => s.type === 'polygon' && s.points && s.points.length > 2)
    .map((s) => {
      // Remove duplicate last point if present
      let pts = s.points
      if (pts.length > 3) {
        const first = pts[0],
          last = pts[pts.length - 1]
        if (first.x === last.x && first.y === last.y) {
          pts = pts.slice(0, -1)
        }
      }
      const pointsAttr = pts.map((pt) => `${pt.x},${pt.y}`).join(' ')
      return `<polygon points="${pointsAttr}" fill="none" stroke="#c22" stroke-width="2" />`
    })
    .join('\n  ')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  ${svgLines}
  ${svgPolygons}
</svg>`
  navigator.clipboard.writeText(svg)
  showCopied.value = true
  setTimeout(() => (showCopied.value = false), 1200)
}

function zoomIn() {
  zoom.value = Math.min(zoom.value * 1.25, 10)
  drawAll(zoom.value)
}
function zoomOut() {
  zoom.value = Math.max(zoom.value / 1.25, 0.1)
  drawAll(zoom.value)
}
function resetZoom() {
  zoom.value = 1.0
  drawAll(zoom.value)
}

onMounted(async () => {
  await nextTick()
  initCanvas()
  drawAll(zoom.value)
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('mousedown', handleClickOutsideMenu)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('mousedown', handleClickOutsideMenu)
})
</script>

<style scoped>
.shape-editor {
  height: 100%;
  width: 100%;
  position: relative;
}

.editor-top-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 56px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 10;
  pointer-events: none;
}

.editor-top-center {
  flex: 1 1 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: auto;
  padding: 8px;
}

.editor-top-right {
  flex: 0 0 auto;
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  pointer-events: auto;
}

.left-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 56px;
  background: #f5f7fa;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  z-index: 100;
  padding-top: 16px;
  padding-bottom: 0;
  padding-left: 0;
  padding-right: 0;
  gap: 8px;
  pointer-events: auto;
}

.shape-editor canvas {
  border: 1px solid #ccc;
  background-color: #fff;
  width: 100%;
  height: 100%;
}

.export-svg-btn {
  background: #fff;
  border: 1px solid #007bff;
  color: #007bff;
  border-radius: 4px;
  padding: 4px 12px;
  font-size: 1rem;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s;
}

.export-svg-btn:hover {
  background: #007bff;
  color: #fff;
}

.copied-msg {
  background: #222;
  color: #fff;
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 1rem;
  pointer-events: none;
  opacity: 0.95;
}

.unit-grid-controls-wrapper {
  background: #f5f7fa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #ddd;
  padding: 8px 18px;
  display: inline-block;
}

.unit-grid-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.unit-grid-controls-wrapper label {
  color: #222;
}

.top-bar-group {
  background: #f5f7fa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #ddd;
  padding: 8px 18px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.zoom-text {
  color: #222;
}
</style>
