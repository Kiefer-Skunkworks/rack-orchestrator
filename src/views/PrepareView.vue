<template>
  <div class="controls">
    <button>Toggle Sidebar</button>
    <button>Toggle Sidebar</button>
    <button>Toggle Sidebar</button>
    <button>Toggle Sidebar</button>
    <button>Toggle Sidebar</button>
    <button>Toggle Sidebar</button>
    <button>Toggle Sidebar</button>
    <button>Toggle Sidebar</button>
  </div>
  <h1>Prepare</h1>
</template>

<script setup lang="ts"></script>

<style scoped>
.controls {
  position: fixed;
  top: 32px;
  left: 0;
  width: 100vw;
  display: flex;
  flex-direction: row;
  align-content: center;
  justify-content: center;
  margin-top: 2rem;
}
.controls button {
  padding: 0.5rem 1rem;
  font-size: 16px;
  border: 1px solid var(--color-border);
  background-color: var(--color-background);
}
.controls button:hover {
  background-color: var(--color-background-hover);
}
.controls button:active {
  background-color: var(--color-background-active);
}
</style>
