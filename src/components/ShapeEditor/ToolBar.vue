<template>
  <div :class="['tool-bar', { vertical }]">
    <div class="tool-group">
      <button
        :class="{ active: shapeType === 'select' || shapeType === 'direct-select' }"
        @mouseenter="openSelectDropdown"
        @mouseleave="closeSelectDropdown"
        @click="handleMainSelectButtonClick"
        title="Select Tools (V/A)"
        ref="selectButton"
      >
        <component :is="activeSelectIcon" />
      </button>
      <div
        v-if="showSelectDropdown"
        class="tool-dropdown"
        @mousedown.prevent
        @mouseenter="openSelectDropdown"
        @mouseleave="closeSelectDropdown"
      >
        <button
          :class="{ active: shapeType === 'select' }"
          @mousedown.prevent="handleSelectClick"
          title="Select (V)"
        >
          <SelectIcon /> Select
        </button>
        <button
          :class="{ active: shapeType === 'direct-select' }"
          @mousedown.prevent="handleDirectSelectClick"
          title="Direct Select (A)"
        >
          <DirectSelectIcon /> Direct Select
        </button>
      </div>
    </div>
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
import { ref, computed, watch } from 'vue'
import SelectIcon from './icons/SelectIcon.vue'
import DirectSelectIcon from './icons/DirectSelectIcon.vue'
import LineIcon from './icons/LineIcon.vue'
import PolygonIcon from './icons/PolygonIcon.vue'
const props = defineProps({
  shapeType: String,
  setTool: Function,
  vertical: Boolean,
  showDivider: Boolean
})

const showSelectDropdown = ref(false)
const selectButton = ref(null)

// Tool group options (reusable for any tool group)
const selectOptions = [
  {
    type: 'select',
    icon: SelectIcon,
    label: 'Select',
    shortcut: 'V'
  },
  {
    type: 'direct-select',
    icon: DirectSelectIcon,
    label: 'Direct Select',
    shortcut: 'A'
  }
]

function openSelectDropdown() {
  showSelectDropdown.value = true
}
function closeSelectDropdown() {
  showSelectDropdown.value = false
}

function handleSelectClick() {
  props.setTool('select')
  closeSelectDropdown()
}
function handleDirectSelectClick() {
  props.setTool('direct-select')
  closeSelectDropdown()
}

// Cycle through tool options for a group
function cycleToolOption(options, currentType) {
  const idx = options.findIndex((opt) => opt.type === currentType)
  const nextIdx = (idx + 1) % options.length
  return options[nextIdx].type
}

function handleMainSelectButtonClick() {
  const nextType = cycleToolOption(selectOptions, props.shapeType)
  props.setTool(nextType)
  closeSelectDropdown()
}

const activeSelectIcon = computed(() => {
  const found = selectOptions.find((opt) => opt.type === props.shapeType)
  return found ? found.icon : SelectIcon
})

// Keyboard shortcuts for V (select) and A (direct-select)
function handleKeydown(e) {
  if (e.key.toLowerCase() === 'v') {
    props.setTool('select')
    closeSelectDropdown()
  } else if (e.key.toLowerCase() === 'a') {
    props.setTool('direct-select')
    closeSelectDropdown()
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeydown)
}
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

.tool-group {
  position: relative;
  display: inline-block;
}

.dropdown-arrow {
  font-size: 0.8em;
  margin-left: 4px;
}

.tool-dropdown {
  position: absolute;
  left: 0;
  top: 100%;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  z-index: 10;
  min-width: 130px;
  padding: 4px 0;
  display: flex;
  flex-direction: column;
  /* TODO: Dynamically set min-width based on the longest dropdown item */
}

.tool-dropdown button {
  background: none;
  border: none;
  color: #222;
  text-align: left;
  padding: 6px 10px;
  font-size: 0.95rem;
  cursor: pointer;
  border-radius: 0;
  transition:
    background 0.2s,
    color 0.2s;
  white-space: nowrap;
}

.tool-dropdown button.active,
.tool-dropdown button:hover {
  background: #007bff;
  color: #fff;
}
</style>
