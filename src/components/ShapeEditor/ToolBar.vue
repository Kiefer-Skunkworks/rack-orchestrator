<template>
  <div :class="['tool-bar', { vertical }]">
    <button
      :class="{ active: shapeType === 'select' }"
      @click="setTool('select')"
      title="Select (V)"
    >
      <SelectIcon />
    </button>
    <div v-if="showDivider && vertical" class="tool-divider"></div>
    <button :class="{ active: shapeType === 'line' }" @click="setTool('line')" title="Line (L)">
      <LineIcon />
    </button>
    <button
      :class="{ active: shapeType === 'polygon' }"
      @click="setTool('polygon')"
      title="Polygon (P)"
    >
      <PolygonIcon />
    </button>
  </div>
</template>

<script setup>
import SelectIcon from './icons/SelectIcon.vue'
import LineIcon from './icons/LineIcon.vue'
import PolygonIcon from './icons/PolygonIcon.vue'
const props = defineProps({
  shapeType: String,
  setTool: Function,
  vertical: Boolean,
  showDivider: Boolean
})
</script>

<style scoped>
.tool-bar {
  display: flex;
  gap: 8px;
}

.tool-bar.vertical {
  flex-direction: column;
  align-items: flex-start;
}

.tool-bar button {
  background: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 2px;
  font-size: 1.2rem;
  cursor: pointer;
  outline: none;
  transition:
    background 0.2s,
    border 0.2s;
}

.tool-bar button.active {
  background: #007bff;
  color: #fff;
  border-color: #007bff;
}

.tool-divider {
  width: 80%;
  height: 1px;
  background: #ccc;
  margin: 8px 0;
  align-self: center;
}
</style>
