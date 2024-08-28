export default class Project {
  id: number | false;
  name: string;
  description: string;
  iconPng: string;
  data: unknown; // TODO: Geometry Model ?
  
  constructor(id: number, name: string, description: string, _iconPng: string, data: unknown) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.iconPng = 'https://via.placeholder.com/100';
    this.data = data;
  }

  isSaved(): boolean {
    return this.id !== false;
  }

  static fromJSON(d: Object): Project {
    Object.setPrototypeOf(d, Project.prototype);
    return d as Project;
  }
}
