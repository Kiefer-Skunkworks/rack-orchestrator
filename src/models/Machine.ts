import type { MachinePostProcessor } from './MachinePostProcessor'

export default class Machine {
  id: number
  name: string
  status: string
  type: string
  kinematics: string
  xMaxTravel: number
  yMaxTravel: number
  maxWorkPieceX: number
  maxWorkPieceY: number
  maxWorkPieceZ: number
  workHoldingSystem: string
  wireDiameter: number
  wireTension: number
  maxWireSpeed: number
  maxWireTension: number
  cutKerfRadius: number
  postProcessor: MachinePostProcessor

  constructor(
    id: number,
    name: string,
    status: string,
    type: string,
    kinematics: string,
    xMaxTravel: number,
    yMaxTravel: number,
    maxWorkPieceX: number,
    maxWorkPieceY: number,
    maxWorkPieceZ: number,
    workHoldingSystem: string,
    wireDiameter: number,
    wireTension: number,
    maxWireSpeed: number,
    maxWireTension: number,
    cutKerfRadius: number,
    postProcessor: MachinePostProcessor
  ) {
    this.id = id
    this.name = name
    this.status = status
    this.type = type
    this.kinematics = kinematics
    this.xMaxTravel = xMaxTravel
    this.yMaxTravel = yMaxTravel
    this.maxWorkPieceX = maxWorkPieceX
    this.maxWorkPieceY = maxWorkPieceY
    this.maxWorkPieceZ = maxWorkPieceZ
    this.workHoldingSystem = workHoldingSystem
    this.wireDiameter = wireDiameter
    this.wireTension = wireTension
    this.maxWireSpeed = maxWireSpeed
    this.maxWireTension = maxWireTension
    this.cutKerfRadius = cutKerfRadius
    this.postProcessor = postProcessor
  }
}
