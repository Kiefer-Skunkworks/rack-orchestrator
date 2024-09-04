<template>
    <div v-if="isOpen" class="modal">
        <div class="modal-content">
            <span class="close" @click="closeModal">&times;</span>
            <h2>Select a Project to Open</h2>
            <ul v-if="projects.length > 0">
                <li v-for="project in projects" :key="project.id" @click="selectProject(project.id)">
                    {{ project.name }}
                </li>
            </ul>
            <div v-else>
                <p>No projects available.</p>
            </div>
        </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue';
import { useProjectStore } from '@/stores/project';

export default defineComponent({
    name: 'OpenProjectModal',
    props: {
        isOpen: {
            type: Boolean,
            required: true,
        },
    },
    setup() {
        const projectStore = useProjectStore();

        const selectProject = async (projectId) => {
            await projectStore.openProject(projectId);
            closeModal();
        };

        const closeModal = () => {
            projectStore.isOpeningProject = false;
        };

        return {
            projects: projectStore.projects,
            selectProject,
            closeModal,
        };
    },
});
</script>

<style scoped>
.modal {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
    background-color: var(--color-background);
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    width: 500px;
    max-width: 100%;
}

.close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--color-text);
    float: right;
}
</style>