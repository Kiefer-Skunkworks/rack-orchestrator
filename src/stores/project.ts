import { defineStore } from 'pinia';

import Project from '@/models/Project';
import ProjectService from '@/services/ProjectService';


const projectService = new ProjectService();

export const useProjectStore = defineStore('projectStore', {
  state: () => ({
    projects: [] as Project[],
    currentProject: null as Project | null,
    isOpeningProject: false,
    isCreatingProject: false,
  }),

  actions: {
    async listProjects() {
      this.projects = await projectService.listProjects();
    },

    async openProject(id: number) {
      this.currentProject = await projectService.loadProject(id);
    },

    async newProject(project: Project) {
      this.currentProject = project;
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
    currentProject: (state) => {
      return state.currentProject;
    },

    allProjects: (state) => {
      return state.projects;
    },
  },
});
