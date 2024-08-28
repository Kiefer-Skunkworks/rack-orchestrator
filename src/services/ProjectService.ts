import Project from "@/models/Project";
import ProjectRepository from "@/repositories/ProjectRepository";

export default class ProjectService {
  private projectRepository: ProjectRepository;

  constructor() {
    this.projectRepository = new ProjectRepository();
  }

  async listProjects(): Promise<Project[]> {
    return await this.projectRepository.getAll();
  }

  async loadProject(projectId: number): Promise<Project> {
    return await this.projectRepository.getById(projectId);
  }

  async saveProject(project: Project): Promise<Project> {
    return await this.projectRepository.update(project.id, project);
  }

  async saveProjectAs(project: Project): Promise<Project> {
    return await this.projectRepository.create(project);
  }

  async newProject(): Promise<Project> {
    return await this.projectRepository.create(new Project(0, "New Project", "", "todo: fix images", ""));
  }
}
