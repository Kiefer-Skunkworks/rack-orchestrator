<template>
  <!-- Design is a cad-like experience where we can design our projects. -->
  <div class="designer">

  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
  .designer {
    height: calc(100% - 2rem);
    width: 100%;
    border: 1px solid var(--color-border);
    margin: 1rem 0;
    position: relative;
    overflow: hidden;
  }

  /* draw a grid inside the designer */
  .designer::before {
    content: "";
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: linear-gradient(to right, var(--color-border) 1px, transparent 1px),
                      linear-gradient(to bottom, var(--color-border) 1px, transparent 1px);
    background-size: 1rem 1rem;
  }
</style>
