import Machine from '@/models/Machine'
import MachinePostProcessor from '@/models/MachinePostProcessor'
import type { Repository } from '.'

// implement the repository pattern backed by local storage

export default class MachineRepository implements Repository<Machine> {
  async getAll(): Promise<Machine[]> {
    return localStorage.getItem('machines') ? JSON.parse(localStorage.getItem('machines')!) : []
  }

  async getById(id: number): Promise<Machine> {
    return (await this.getAll()).find((machine) => machine.id === id)!
  }

  async create(machine: Machine): Promise<Machine> {
    const defaultPostProcessor = new MachinePostProcessor(1, '', '', '', '');

    machine.postProcessor = defaultPostProcessor;
    
    const machines = await this.getAll()
    const newMachine = new Machine(
      machines.length + 1,
      machine.name,
      machine.status,
      machine.type,
      machine.kinematics,
      machine.xMaxTravel,
      machine.yMaxTravel,
      machine.maxWorkPieceX,
      machine.maxWorkPieceY,
      machine.maxWorkPieceZ,
      machine.workHoldingSystem,
      machine.wireDiameter,
      machine.wireTension,
      machine.maxWireSpeed,
      machine.maxWireTension,
      machine.cutKerfRadius,
      machine.postProcessor
    )
    machines.push(newMachine)
    localStorage.setItem('machines', JSON.stringify(machines))
    return newMachine
  }

  async update(id: number, machine: Partial<Machine>): Promise<Machine> {
    const machines = await this.getAll()
    const index = machines.findIndex((machine) => machine.id === id)
    machines[index] = { ...machines[index], ...machine }
    localStorage.setItem('machines', JSON.stringify(machines))
    return machines[index]
  }

  async delete(id: number): Promise<void> {
    const machines = await this.getAll()
    const index = machines.findIndex((machine) => machine.id === id)
    machines.splice(index, 1)
    localStorage.setItem('machines', JSON.stringify(machines))
  }
}
