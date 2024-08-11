export class MachinePostProcessor {
  id: number
  postProcessor: string

  constructor(id: number, postProcessor: string) {
    this.id = id
    this.postProcessor = postProcessor
  }
}
