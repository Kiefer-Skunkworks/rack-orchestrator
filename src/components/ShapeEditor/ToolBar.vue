<template>
    <div :class="['tool-bar', { vertical }]">
        <button :class="{ active: shapeType === 'select' }" @click="setTool('select')" title="Select (V)">
            🖱️
        </button>
        <button :class="{ active: shapeType === 'line' }" @click="setTool('line')" title="Line (L)">
            🖊️
        </button>
        <button :class="{ active: shapeType === 'polygon' }" @click="setTool('polygon')" title="Polygon (P)">
            🔺
        </button>
    </div>
</template>

<script setup>
const props = defineProps({
    shapeType: String,
    setTool: Function,
    vertical: Boolean
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
    padding: 4px 8px;
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
</style>
