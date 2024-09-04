<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

import { useProjectStore } from '@/stores/project'

import MenuBar from '@/components/MenuBar.vue'
import OpenProjectModal from '@/components/OpenProjectModal.vue'
import NewProjectModal from '@/components/NewProjectModal.vue'

const projectStore = useProjectStore();
</script>

<!--

The overall layout of this application will be the following stacked components:
- A menu bar with the following options
  - File
    - New Project
    - Open Project
    - Save Project
    - Save Project As
  - Edit
    - Undo
    - Redo
    - Cut
    - Copy
    - Paste
    - Delete
    - Select All
  - View
    - Zoom In
    - Zoom Out
    - Reset Zoom
    - Full Screen
  - Help
    - About
    - Documentation
    - GitHub
- Navigation bar with the following options
  - Home (House Icon)
  - Design (Pencil Icon)
  - Machine (Cogs Icon)
  - Device (Tablet Icon)
  - Project notes (Notebook Icon)
  - (Entries after this point are floated to the right)
    - Ship it (Ship Icon)
- A main content area that will be populated by the router
-->

<template>
  <header>
    <MenuBar />
    <nav>
      <RouterLink class="left" to="/" exact >Home</RouterLink>
      <RouterLink class="left" to="/design">Design</RouterLink>
      <RouterLink class="left" to="/prepare">Prepare</RouterLink>
      <RouterLink class="left" to="/device">Device</RouterLink>
      <RouterLink class="left" to="/project-notes">Project notes</RouterLink>
      <RouterLink class="right" to="/ship-it">Ship it</RouterLink>
    </nav>
  </header>
  <main>
    <RouterView />
  </main>
  <OpenProjectModal :isOpen="projectStore.isOpeningProject" />
  <NewProjectModal :isOpen="projectStore.isCreatingProject" />
</template>

<script lang="ts">

</script>

<style scoped>
  header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    z-index: 10;
  }

  main {
    position: absolute;
    top: 6rem;
    left: 0;
    overflow-y: auto;
    height: calc(100vh - 6rem);
    width: 100vw;
    padding: 0 1rem;
    scrollbar-color: var(--color-border) var(--color-background);
  }

  nav {
    width: 100%;
    font-size: 16px;
    text-align: center;
  }

  nav a.router-link-exact-active:hover {
    background-color: transparent;
  }

  nav a {
    display: inline-block;
    padding: 1rem 1rem;
    border-bottom: 1px solid var(--color-border);
    border-left: 1px solid var(--color-border);
  }

  nav a:first-of-type {
    border: 0;
    border-bottom: 1px solid var(--color-border);
  }

  nav a.router-link-exact-active {
    color: var(--color-text);
    border-bottom: none;
  }

  .left {
    float: left;
  }

  .right {
    float: right;
  }
</style>
