<template>
  <div class="layer-panel">
    <div class="layer-panel-header">
      <h3>Layers</h3>
      <div class="layer-panel-controls">
        <button @click="addLayer" title="Add new layer" class="btn-icon">
          <span>+</span>
        </button>
        <button
          @click="deleteSelectedLayer"
          title="Delete selected layer"
          class="btn-icon"
          :disabled="!selectedShape"
        >
          <span>🗑</span>
        </button>
      </div>
    </div>

    <div class="layer-list">
      <div
        v-for="(shape, index) in shapes"
        :key="index"
        class="layer-item"
        :class="{
          selected: selectedShape === shape,
          visible: shape.visible !== false,
          hidden: shape.visible === false
        }"
        @click="selectShape(shape)"
        @dblclick="editShapeName(shape)"
      >
        <div class="layer-item-content">
          <div class="layer-visibility" @click.stop="toggleVisibility(shape)">
            <span v-if="shape.visible !== false">👁</span>
            <span v-else>👁‍🗨</span>
          </div>
          <div class="layer-info">
            <div class="layer-name">
              {{ shape.name || getDefaultShapeName(shape, index) }}
            </div>
            <div class="layer-type">{{ shape.type }} ({{ getShapePointCount(shape) }} pts)</div>
          </div>
          <div class="layer-actions">
            <button @click.stop="duplicateShape(shape)" title="Duplicate" class="btn-icon-small">
              📋
            </button>
          </div>
        </div>
      </div>

      <div v-if="shapes.length === 0" class="no-layers">
        No shapes yet. Draw something to see it here!
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  shapes: {
    type: Array,
    required: true
  },
  selectedShape: {
    type: Object,
    default: null
  }
})

const emit = defineEmits([
  'select-shape',
  'delete-shape',
  'duplicate-shape',
  'toggle-visibility',
  'update-shape-name'
])

function selectShape(shape) {
  emit('select-shape', shape)
}

function deleteSelectedLayer() {
  if (props.selectedShape) {
    emit('delete-shape', props.selectedShape)
  }
}

function duplicateShape(shape) {
  emit('duplicate-shape', shape)
}

function toggleVisibility(shape) {
  emit('toggle-visibility', shape)
}

function editShapeName(shape) {
  const newName = prompt(
    'Enter shape name:',
    shape.name || getDefaultShapeName(shape, props.shapes.indexOf(shape))
  )
  if (newName !== null && newName !== shape.name) {
    emit('update-shape-name', shape, newName)
  }
}

function addLayer() {
  // This could create a new empty layer or prompt for shape type
  console.log('Add layer functionality - to be implemented')
}

function getDefaultShapeName(shape, index) {
  if (shape.type === 'polygon') {
    return `Polygon ${index + 1}`
  } else if (shape.type === 'line') {
    return `Line ${index + 1}`
  }
  return `Shape ${index + 1}`
}

function getShapePointCount(shape) {
  if (shape.type === 'polygon') {
    return shape.points ? shape.points.length : 0
  } else if (shape.type === 'line') {
    return 2
  }
  return 0
}
</script>

<style scoped>
.layer-panel {
  position: absolute;
  top: 0;
  right: 0;
  width: 250px;
  background: #f5f5f5;
  border-left: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  height: 100%;
  z-index: 50;
}

.layer-panel-header {
  padding: 12px;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
}

.layer-panel-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.layer-panel-controls {
  display: flex;
  gap: 4px;
}

.btn-icon {
  width: 24px;
  height: 24px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.btn-icon:hover {
  background: #f0f0f0;
}

.btn-icon:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.layer-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.layer-item {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.layer-item:hover {
  border-color: #007bff;
  box-shadow: 0 1px 3px rgba(0, 123, 255, 0.2);
}

.layer-item.selected {
  border-color: #007bff;
  background: #e7f3ff;
  box-shadow: 0 1px 3px rgba(0, 123, 255, 0.3);
}

.layer-item.hidden {
  opacity: 0.6;
}

.layer-item-content {
  display: flex;
  align-items: center;
  padding: 8px;
  gap: 8px;
}

.layer-visibility {
  cursor: pointer;
  font-size: 14px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.layer-visibility:hover {
  opacity: 1;
}

.layer-info {
  flex: 1;
  min-width: 0;
}

.layer-name {
  font-size: 12px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.layer-type {
  font-size: 10px;
  color: #666;
  margin-top: 2px;
}

.layer-actions {
  display: flex;
  gap: 2px;
}

.btn-icon-small {
  width: 20px;
  height: 20px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.btn-icon-small:hover {
  background: #f0f0f0;
}

.no-layers {
  text-align: center;
  color: #666;
  font-size: 12px;
  padding: 20px;
  font-style: italic;
}
</style>
