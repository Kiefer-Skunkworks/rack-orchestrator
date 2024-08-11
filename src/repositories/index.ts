export interface Repository<T> {
  getAll(): Promise<T[]>
  getById(id: number): Promise<T>
  create(record: T): Promise<T>
  update(id: number, record: Partial<T>): Promise<T>
  delete(id: number): Promise<void>
}
