<template>
    <div v-if="isOpen" class="modal">
        <div class="modal-content">
            <span class="close" @click="closeModal">&times;</span>
            <h2>Create a New Project</h2>
            <form @submit.prevent="createProject">
                <div>
                    <label for="project-name">Project Name:</label>
                    <input type="text" id="project-name" v-model="projectName" required />
                </div>
                <div>
                    <label for="project-description">Project Description:</label>
                    <textarea id="project-description" v-model="projectDescription" required></textarea>
                </div>
                <button type="submit">Create Project</button>
            </form>
        </div>
    </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from '@/stores/project';
import Project from '@/models/Project';

export default defineComponent({
    name: 'NewProjectModal',
    props: {
        isOpen: {
            type: Boolean,
            required: true,
        },
    },
    setup() {
        const projectStore = useProjectStore();
        const projectName = ref('');
        const projectDescription = ref('');

        const router = useRouter();

        const createProject = async () => {
            const newProject = new Project(projectName.value, projectDescription.value);
            await projectStore.newProject(newProject);
            closeModal();
            router.push('/design');
        };

        const closeModal = () => {
            projectStore.closeNewProjectModal();
        };

        return {
            projectName,
            projectDescription,
            createProject,
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

form div {
    margin-bottom: 15px;
}

label {
    display: block;
    margin-bottom: 5px;
}

input, textarea {
    width: 100%;
    padding: 8px;
    box-sizing: border-box;
}

button {
    background-color: var(--color-background-soft);
    color: white;
    border: none;
    padding: 10px 20px;
    cursor: pointer;
    border-radius: 4px;
}
</style>