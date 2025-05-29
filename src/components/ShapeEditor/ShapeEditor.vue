<template>
  <div class="shape-editor" @contextmenu.prevent="onRightClick">
    <div class="tool-indicator">
      <span v-if="shapeType === 'line'">🖊️ Line</span>
      <span v-else-if="shapeType === 'polygon'">🔺 Polygon</span>
      <!-- Add more icons for other tools as needed -->
    </div>
    <canvas
      ref="canvas"
      @mousedown="onMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="onMouseUp"
      @dblclick="onDblClick"
      @mouseleave="handleMouseLeave"
    ></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useShapeEditor } from './useShapeEditor'

const canvas = ref(null)
const mousePos = ref({ x: 0, y: 0 })
const hovering = ref(false)

const {
  initCanvas,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onRightClick,
  drawAll,
  onDblClick,
  cancelDrawing,
  shapeType
} = useShapeEditor(canvas, mousePos, hovering)

function handleResize() {
  initCanvas()
  drawAll()
}

function handleMouseMove(e) {
  hovering.value = true
  mousePos.value = { x: e.offsetX, y: e.offsetY }
  onMouseMove(e)
}

function handleMouseLeave() {
  hovering.value = false
}

function handleKeydown(e) {
  if (e.key === 'Escape') {
    cancelDrawing && cancelDrawing()
  }
}

onMounted(() => {
  initCanvas()
  drawAll()
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.shape-editor {
  height: 100%;
  width: 100%;
  position: relative;
}
.shape-editor canvas {
  border: 1px solid #ccc;
  background-color: #fff;
  width: 100%;
  height: 100%;
}
.tool-indicator {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 1rem;
  z-index: 2;
  pointer-events: none;
  user-select: none;
}
</style>
