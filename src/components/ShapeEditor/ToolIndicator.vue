<template>
    <div class="tool-indicator">
        <span v-if="shapeType === 'line'">🖊️ Line</span>
        <span v-else-if="shapeType === 'polygon'">🔺 Polygon</span>
        <span v-else-if="shapeType === 'select'">🖱️ Select</span>
        <!-- Add more icons for other tools as needed -->
    </div>
</template>

<script setup>
const props = defineProps({
    shapeType: String
})
</script>

<style scoped>
.tool-indicator {
    position: absolute;
    top: 8px;
    left: 8px;
    background: rgba(55, 55, 55, 0.85);
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 1rem;
    z-index: 2;
    pointer-events: none;
    user-select: none;
    color: #fff;
}
</style>
