import { defineStore } from 'pinia';

import Project from '@/models/Project';
import ProjectService from '@/services/ProjectService';


const projectService = new ProjectService();

export const useProjectStore = defineStore('projectStore', {
  state: () => ({
    projects: [] as Project[],
    selectedProject: null as Project | null,
  }),

  actions: {
    async listProjects() {
      this.projects = await projectService.listProjects();
    },

    async openProject(id: number) {
      this.selectedProject = await projectService.loadProject(id);
    },

    async saveProject(project: Project) {
      const savedProject = await projectService.saveProject(project);
      const index = this.projects.findIndex(p => p.id === project.id);
      if (index !== -1) {
        this.projects[index] = savedProject;
      } else {
        this.projects.push(savedProject);
      }
    },

    async saveProjectAs(project: Project) {
      const newProject = await projectService.saveProjectAs(project);
      this.projects.push(newProject);
    },

    // TODO: Delete project
  },

  getters: {
    getProjectById: (state) => (id: number) => {
      return state.projects.find(p => p.id === id) || null;
    },

    allProjects: (state) => {
      return state.projects;
    },
  },
});
