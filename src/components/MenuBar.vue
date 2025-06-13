<template>
  <div class="menu-bar">
    <ul class="menu">
      <li v-for="menu in menus" :key="menu.name" class="menu-item">
        {{ menu.name }}
        <ul class="submenu">
          <li v-for="item in menu.items" :key="item.name" class="submenu-item" @click="item.action">
            {{ item.name }}
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useProjectStore } from '@/stores/project';

import OpenFileModal from '@/components/OpenProjectModal.vue';

export default defineComponent({
  name: 'MenuBar',
  components: {
    OpenFileModal
  },
  data() {
    return {
      showOpenFileModal: false
    };
  },
  setup() {
    const projectStore = useProjectStore();

    const menus = ref([
      {
        name: 'File',
        items: [
          { 
            name: 'New Project', 
            action: () => {
              projectStore.isCreatingProject = true;
            }
          },
          { 
            name: 'Open Project',
            action: async () => {
              projectStore.isOpeningProject = true;
            }
          },
          { 
            name: 'Save Project', 
            action: async () => {
              if (projectStore.currentProject) {
                await projectStore.saveProject(projectStore.currentProject);
                alert('Project saved');
              } else {
                alert('No project to save');
              }
            } 
          },
          { 
            name: 'Save Project As', 
            action: async () => {
              if (projectStore.currentProject) {
                await projectStore.saveProjectAs(projectStore.currentProject);
                alert('Project saved as new');
              } else {
                alert('No project to save');
              }
            } 
          }
        ]
      },
      {
        name: 'Edit',
        items: [
          { name: 'Undo', action: () => alert('Undo clicked') },
          { name: 'Redo', action: () => alert('Redo clicked') },
          { name: 'Cut', action: () => alert('Cut clicked') },
          { name: 'Copy', action: () => alert('Copy clicked') },
          { name: 'Paste', action: () => alert('Paste clicked') },
          { name: 'Delete', action: () => alert('Delete clicked') },
          { name: 'Select All', action: () => alert('Select All clicked') }
        ]
      },
      {
        name: 'View',
        items: [
          { name: 'Zoom In', action: () => alert('Zoom In clicked') },
          { name: 'Zoom Out', action: () => alert('Zoom Out clicked') },
          { name: 'Reset Zoom', action: () => alert('Reset Zoom clicked') },
          { name: 'Full Screen', action: () => alert('Full Screen clicked') }
        ]
      },
      {
        name: 'Help',
        items: [
          { name: 'About', action: () => alert('About clicked') },
          { name: 'Documentation', action: () => alert('Documentation clicked') },
          { name: 'GitHub', action: () => alert('GitHub clicked') }
        ]
      }
    ]);

    return {
      menus
    };
  }
});
</script>

<style scoped>
.menu-bar {
  background-color: #f0f0f0;
  border-bottom: 1px solid #ccc;
  padding: 0;
  margin: 0;
}

.menu {
  list-style: none;
  display: flex;
  padding: 0;
  margin: 0;
  color: black;
}

.menu-item {
  position: relative;
  padding: 4px 20px;
  cursor: pointer;
}

.menu-item:hover {
  background-color: #e0e0e0;
  .submenu {
      display: block;
  }
}

.submenu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #fff;
  border: 1px solid #ccc;
  list-style: none;
  padding: 0;
  margin: 0;
  min-width: 150px;
}

.submenu-item {
  padding: 10px 20px;
  cursor: pointer;
}

.submenu-item:hover {
  background-color: #f0f0f0;
}
</style>