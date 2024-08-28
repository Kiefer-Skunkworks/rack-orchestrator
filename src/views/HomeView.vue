<script setup lang="ts">
  import { computed, onMounted } from 'vue';
  import { useProjectStore } from '@/stores/project';

  const projectStore = useProjectStore();

  onMounted(() => {
    projectStore.listProjects();
  });

  const allProjects = computed(() => projectStore.allProjects);
</script>

<template>
  
  <!-- This page will hold recent files and maybe links to news about Rack Robotics -->
  
  <h1>Home</h1>

  <!-- lets make some fake looking data for now -->
  <br/>

  <h2>Recent Files</h2>
  <div class="card-container">

    <!--
    
      <li v-for="project in allProjects" :key="project.id">
        {{ project.name }}
      </li>
    
    -->

    <li v-for="project in allProjects" :key="project.id">
      <div class="card card-horizontal">
        <img class="card-image" :src="project.iconPng" alt="Project Image" />
        <div class="card-body">
          <h3>{{ project.name }}</h3>
          <p>{{ project.description }}</p>
        </div>
      </div>
    </li>


    <div class="card card-horizontal">
      <img class="card-image" src="https://via.placeholder.com/100" alt="Project 1" />
      <div class="card-body">
        <h3>Project 1</h3>
        <p>Project 1 description</p>
      </div>
    </div>
    <div class="card card-horizontal">
      <img class="card-image" src="https://via.placeholder.com/100" alt="Project 1" />
      <div class="card-body">
        <h3>Project 2</h3>
        <p>Project 2 description</p>
      </div>
    </div>
    <div class="card card-horizontal">
      <img class="card-image" src="https://via.placeholder.com/100" alt="Project 1" />
      <div class="card-body">
        <h3>Project 3</h3>
        <p>Project 3 description</p>
      </div>
    </div>
  </div>

  <br/>

  <h2>News</h2>
  <div class="card-container">
    <div class="card small">
      <img class="card-image" src="https://via.placeholder.com/300" alt="News 1" />
      <h3>Fake News 1</h3>
      <p>Aliens invading Earth.</p>
    </div>
    <div class="card small">
      <img class="card-image" src="https://via.placeholder.com/300" alt="News 1" />
      <h3>Fake News 2</h3>
      <p>Scientists discover a secret formula to turn vegetables into chocolate.</p>
    </div>
    <div class="card small">
      <img class="card-image" src="https://via.placeholder.com/300" alt="News 1" />
      <h3>Fake News 3</h3>
      <p>World's largest pizza found floating in the ocean.</p>
    </div>
    <div class="card small">
      <img class="card-image" src="https://via.placeholder.com/300" alt="News 1" />
      <h3>Fake News 4</h3>
      <p>Cats take over the internet and demand more treats.</p>
    </div>
  </div>

</template>

<script lang="ts">
</script>

<style scoped>

.card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.card {
  flex: 1 1 300px;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;

  .card-image {
    width: 100%;
    height: 200px;
    background-color: var(--color-background);
    border-radius: 0.5rem;
  }
}

.card-horizontal {
  display: flex;
  align-items: center;

  .card-image {
    margin-right: 1rem;
    width: 30%;
  }

  .card-body {
    flex: 1;
  }
}

.card:hover {
  cursor: pointer;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  background-color: var(--color-background-soft);
}

.card.small {
  max-width: 25vw;
}
</style>
