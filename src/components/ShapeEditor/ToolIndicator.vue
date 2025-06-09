<template>
  <div class="tool-indicator">
    <span v-if="shapeType === 'line'"><LineIcon /> Line</span>
    <span v-else-if="shapeType === 'polygon'"><PolygonIcon /> Polygon</span>
    <span v-else-if="shapeType === 'select'"><SelectIcon /> Select</span>
    <span v-else-if="shapeType === 'direct-select'"><DirectSelectIcon /> Direct Select</span>
    <!-- Add more icons for other tools as needed -->
  </div>
</template>

<script setup>
import SelectIcon from './icons/SelectIcon.vue'
import DirectSelectIcon from './icons/DirectSelectIcon.vue'
import LineIcon from './icons/LineIcon.vue'
import PolygonIcon from './icons/PolygonIcon.vue'
const props = defineProps({
  shapeType: String
})
</script>

<style scoped>
.tool-indicator {
  position: absolute;
  right: 16px;
  bottom: 16px;
  left: auto;
  top: auto;
  background: rgba(55, 55, 55, 0.85);
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 1rem;
  z-index: 10;
  pointer-events: none;
  user-select: none;
  color: #fff;
}
</style>
