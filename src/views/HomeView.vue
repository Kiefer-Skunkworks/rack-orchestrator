<template>
  <div class="controls">
    <button @click="toggleSidebar">Toggle Sidebar 1</button>
    <button @click="toggleSidebar">Toggle Sidebar 2</button>
    <button @click="toggleSidebar">Toggle Sidebar 3</button>
    <button @click="toggleSidebar">Toggle Sidebar 4</button>
    <button @click="toggleSidebar">Toggle Sidebar 5</button>
    <button @click="toggleSidebar">Toggle Sidebar 6</button>
    <button @click="toggleSidebar">Toggle Sidebar 7</button>
    <button @click="toggleSidebar">Toggle Sidebar 8</button>
  </div>
  <MachinesForm />
</template>

<script setup lang="ts">
import MachinesForm from '../components/MachinesForm.vue'
import { ref } from 'vue'

const isSidebarOpen = ref(false)

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
  console.log('Sidebar toggled:', isSidebarOpen.value)
}
</script>

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
