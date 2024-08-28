import Project from "@/models/Project";
import type { Repository } from ".";

/**
 * ProjectRepository
 */
export default class ProjectRepository implements Repository<Project> {
  async getAll(): Promise<Project[]> {
    const serializedProjects = JSON.parse(localStorage.getItem("projects") || '[]');
    return serializedProjects.map((data: Object) => Project.fromJSON(data));
  }

  async getById(id: number): Promise<Project> {
    const projects = await this.getAll();
    const project = projects.find(project => project.id === id);
    if (!project) {
      throw new Error(`Project with ID ${id} not found.`);
    }
    return project;
  }

  async create(record: Project): Promise<Project> {
    const projects = await this.getAll();
    const newId = projects.length ? Math.max(...projects.map(p => p.id as number)) + 1 : 1;
    record.id = newId;
    projects.push(record);
    this.saveProjects(projects);
    return record;
  }

  async update(id: number, record: Partial<Project>): Promise<Project> {
    const projects = await this.getAll();
    const index = projects.findIndex(project => project.id === id);
    if (index === -1) {
      throw new Error(`Project with ID ${id} not found.`);
    }

    const updatedProject = { ...projects[index], ...record };
    projects[index] = Project.fromJSON(updatedProject);
    this.saveProjects(projects);
    return projects[index];
  }

  async delete(id: number): Promise<void> {
    const projects = await this.getAll();
    const filteredProjects = projects.filter(project => project.id !== id);
    this.saveProjects(filteredProjects);
  }

  private saveProjects(projects: Project[]): void {
    localStorage.setItem("projects", JSON.stringify(projects));
  }
}