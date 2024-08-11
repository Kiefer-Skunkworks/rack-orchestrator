import MachineRepository from '@/repositories/MachineRepository'
import Machine from '@/models/Machine'

export class MachineServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MachineServiceError'
  }
}

export class MachineServiceValidationError extends MachineServiceError {
  public propertyName: string
  constructor(propertyName: string) {
    const message = `Invalid value for property: ${propertyName}`
    super(message)
    this.propertyName = propertyName
    this.name = 'MachineServiceValidationError'
  }
}

export default class MachineService {
  private machineRepository: MachineRepository
  constructor() {
    this.machineRepository = new MachineRepository()
  }
  async fetchAllMachines(): Promise<Machine[]> {
    try {
      const machines = await this.machineRepository.getAll()
      return machines
    } catch (error) {
      console.error('Error fetching all machines:', error)
      throw new MachineServiceError('Failed to fetch machines')
    }
  }

  async fetchMachineById(machineId: number): Promise<Machine> {
    try {
      const machine = await this.machineRepository.getById(machineId)
      return machine
    } catch (error) {
      console.error(`Error fetching machine with ID ${machineId}:`, error)
      throw new MachineServiceError(`Failed to fetch machine with ID: ${machineId}`)
    }
  }

  async addMachine(machineData: Machine): Promise<Machine> {
    if (!machineData.name) {
      throw new MachineServiceValidationError('name')
    }
    if (!machineData.type) {
      throw new MachineServiceValidationError('type')
    }
    try {
      const machine = await this.machineRepository.create(machineData)
      return machine
    } catch (error) {
      console.error('Error creating machine:', error)
      throw new MachineServiceError('Failed to create machine')
    }
  }

  async configureMachine(machineId: number, machineData: Machine): Promise<Machine> {
    try {
      const machine = await this.machineRepository.update(machineId, machineData)
      return machine
    } catch (error) {
      console.error(`Error updating machine with ID ${machineId}:`, error)
      throw new MachineServiceError(`Failed to update machine with ID: ${machineId}`)
    }
  }

  async removeMachine(machineId: number): Promise<void> {
    try {
      await this.machineRepository.delete(machineId)
    } catch (error) {
      console.error(`Error deleting machine with ID ${machineId}:`, error)
      throw new MachineServiceError(`Failed to delete machine with ID: ${machineId}`)
    }
  }
}
