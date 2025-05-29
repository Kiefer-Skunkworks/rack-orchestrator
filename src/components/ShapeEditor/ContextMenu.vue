<template>
    <div v-if="show" class="context-menu" :style="{ left: position.x + 'px', top: position.y + 'px' }" @mousedown.stop>
        <div class="context-menu-item" :class="{ active: activeTool === 'select' }" @click="onSelect('select')">
            <span v-if="activeTool === 'select'">✔ </span>🖱️ Select <span class="shortcut">(V)</span>
        </div>
        <div class="context-menu-item" :class="{ active: activeTool === 'line' }" @click="onSelect('line')">
            <span v-if="activeTool === 'line'">✔ </span>🖊️ Line <span class="shortcut">(L)</span>
        </div>
        <div class="context-menu-item" :class="{ active: activeTool === 'polygon' }" @click="onSelect('polygon')">
            <span v-if="activeTool === 'polygon'">✔ </span>🔺 Polygon <span class="shortcut">(P)</span>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    show: Boolean,
    position: Object,
    activeTool: String,
    onSelect: Function
})
</script>

<style scoped>
.context-menu {
    position: fixed;
    z-index: 1000;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    min-width: 120px;
    padding: 4px 0;
    user-select: none;
}

.context-menu-item {
    padding: 6px 16px;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.2s;
}

.context-menu-item:hover {
    background: #007bff;
    color: #fff;
}

.context-menu-item.active {
    background: #007bff;
    color: #fff;
    font-weight: bold;
}

.shortcut {
    color: #aaa;
    margin-left: 4px;
    font-size: 0.95em;
}
</style>
