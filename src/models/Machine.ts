// Base types and enums
import MachinePostProcessor from './MachinePostProcessor'
export type MachineType = 'EDM' | 'CNC_MILL' | 'CNC_LATHE' | '3D_PRINTER' | 'LASER_CUTTER' | 'WATERJET' | 'PLASMA_CUTTER'
export type MachineStatus = 'idle' | 'running' | 'maintenance' | 'error' | 'offline'
export type IconType = 'modern' | 'industrial' | 'minimal'
export type KinematicsType = 'cartesian' | 'delta' | 'corexy' | 'scara' | 'polar'

// Workspace specification
export interface WorkspaceSpec {
  // Travel limits (machine envelope)
  xMaxTravel: number
  yMaxTravel: number
  zMaxTravel?: number

  // Usable workspace (considering fixtures, tooling, etc.)
  maxWorkPieceX: number
  maxWorkPieceY: number
  maxWorkPieceZ: number

  // Origin and coordinate system
  origin: { x: number, y: number, z: number }
  coordinateSystem: 'machine' | 'workpiece' | 'fixture'

  // Units
  units: 'mm' | 'inches'
}

// Machine-specific cutting/processing parameters
export interface CuttingSpec {
  // EDM specific
  wireDiameter?: number
  wireTension?: number
  maxWireSpeed?: number
  maxWireTension?: number
  cutKerfRadius?: number

  // CNC specific
  spindleSpeedRange?: { min: number, max: number }
  feedRateRange?: { min: number, max: number }
  toolChanger?: {
    capacity: number
    autoChange: boolean
    toolTypes: string[]
  }

  // 3D Printer specific
  nozzleDiameter?: number
  buildVolumeHeated?: boolean
  bedLevelingType?: 'manual' | 'auto' | 'mesh'
  extruders?: number
  maxHotendTemp?: number
  maxBedTemp?: number

  // Laser specific
  laserPower?: number
  wavelength?: number
  beamDiameter?: number

  // Common cutting parameters
  maxAcceleration?: { x: number, y: number, z: number }
  maxVelocity?: { x: number, y: number, z: number }
  precision?: number // positioning accuracy in units
}

// Visual identity and theming
export interface VisualIdentity {
  displayName: string
  photoUrl?: string
  themeColor: string // hex color for UI theming
  iconType: IconType
  description?: string
}

// Usage statistics and analytics
export interface UsageStats {
  totalRuntime: number // hours
  jobCount: number
  lastUsed?: Date
  averageJobTime?: number // hours
  utilizationRate?: number // 0-1
  maintenanceSchedule?: {
    lastMaintenance?: Date
    nextMaintenance?: Date
    maintenanceInterval: number // hours
  }
}

// Machine capabilities and features
export interface MachineCapabilities {
  hasToolChanger: boolean
  hasProbing: boolean
  hasRotaryAxis: boolean
  hasFloodCoolant: boolean
  hasMistCoolant: boolean
  hasEnclosure: boolean
  hasCamera: boolean
  supportedMaterials: string[]
  supportedFileFormats: string[]
}

// Physical machine properties
export interface PhysicalProperties {
  weight?: number // kg
  powerRequirement?: string // "220V 3-phase" etc
  dimensions?: {
    width: number
    height: number
    depth: number
    units: 'mm' | 'inches'
  }
  workHoldingSystem?: string
  kinematics: KinematicsType
}

// Enhanced Machine class
export default class Machine {
  // Core identification
  id: string
  name: string
  status: MachineStatus
  type: MachineType

  // Visual and user experience
  visual: VisualIdentity

  // Technical specifications
  workspace: WorkspaceSpec
  cutting: CuttingSpec
  physical: PhysicalProperties
  capabilities: MachineCapabilities

  // Post-processing and code generation
  postProcessor: MachinePostProcessor

  // Metadata and organization
  tags: string[]
  location?: string
  department?: string

  // Analytics and tracking
  usage: UsageStats

  // Timestamps
  createdAt: Date
  lastModified: Date

  // Configuration versioning
  version: number

  constructor(params: {
    id?: string
    name: string
    type: MachineType
    visual: Partial<VisualIdentity>
    workspace: WorkspaceSpec
    cutting?: Partial<CuttingSpec>
    physical: Partial<PhysicalProperties> & { kinematics: KinematicsType }
    capabilities?: Partial<MachineCapabilities>
    postProcessor: MachinePostProcessor
    tags?: string[]
    location?: string
    department?: string
  }) {
    this.id = params.id || this.generateId()
    this.name = params.name
    this.status = 'offline' // Default status
    this.type = params.type

    // Visual identity with sensible defaults
    this.visual = {
      displayName: params.visual.displayName || params.name,
      themeColor: params.visual.themeColor || this.getDefaultThemeColor(params.type),
      iconType: params.visual.iconType || 'modern',
      photoUrl: params.visual.photoUrl,
      description: params.visual.description
    }

    this.workspace = params.workspace
    this.cutting = params.cutting || {}
    // Avoid overwriting kinematics property
    const { kinematics, ...restPhysical } = params.physical
    this.physical = {
      kinematics,
      ...restPhysical
    }

    // Capabilities with defaults
    this.capabilities = {
      hasToolChanger: false,
      hasProbing: false,
      hasRotaryAxis: false,
      hasFloodCoolant: false,
      hasMistCoolant: false,
      hasEnclosure: false,
      hasCamera: false,
      supportedMaterials: [],
      supportedFileFormats: [],
      ...params.capabilities
    }

    this.postProcessor = params.postProcessor
    this.tags = params.tags || []
    this.location = params.location
    this.department = params.department

    // Initialize usage stats
    this.usage = {
      totalRuntime: 0,
      jobCount: 0,
      utilizationRate: 0
    }

    // Timestamps
    const now = new Date()
    this.createdAt = now
    this.lastModified = now
    this.version = 1
  }

  // Helper methods
  private generateId(): string {
    return `machine_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getDefaultThemeColor(type: MachineType): string {
    const colorMap: Record<MachineType, string> = {
      EDM: '#3B82F6', // Blue
      CNC_MILL: '#10B981', // Emerald
      CNC_LATHE: '#F59E0B', // Amber
      '3D_PRINTER': '#8B5CF6', // Violet
      LASER_CUTTER: '#EF4444', // Red
      WATERJET: '#06B6D4', // Cyan
      PLASMA_CUTTER: '#F97316' // Orange
    }
    return colorMap[type] || '#6B7280'
  }

  // Business logic methods
  updateStatus(status: MachineStatus): void {
    this.status = status
    this.lastModified = new Date()
  }

  updateUsageStats(stats: Partial<UsageStats>): void {
    this.usage = { ...this.usage, ...stats }
    this.lastModified = new Date()
  }

  addTag(tag: string): void {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag)
      this.lastModified = new Date()
    }
  }

  removeTag(tag: string): void {
    this.tags = this.tags.filter(t => t !== tag)
    this.lastModified = new Date()
  }

  // Validation methods
  isConfigurationValid(): boolean {
    // Basic validation - can be extended
    return !!(
      this.name &&
      this.type &&
      this.workspace.maxWorkPieceX > 0 &&
      this.workspace.maxWorkPieceY > 0 &&
      this.postProcessor
    )
  }

  // Workspace calculations
  getWorkspaceVolume(): number {
    return this.workspace.maxWorkPieceX *
      this.workspace.maxWorkPieceY *
      this.workspace.maxWorkPieceZ
  }

  getWorkspaceArea(): number {
    return this.workspace.maxWorkPieceX * this.workspace.maxWorkPieceY
  }

  // Serialization
  toJSON(): any {
    return {
      id: this.id,
      name: this.name,
      status: this.status,
      type: this.type,
      visual: this.visual,
      workspace: this.workspace,
      cutting: this.cutting,
      physical: this.physical,
      capabilities: this.capabilities,
      postProcessor: this.postProcessor,
      tags: this.tags,
      location: this.location,
      department: this.department,
      usage: this.usage,
      createdAt: this.createdAt,
      lastModified: this.lastModified,
      version: this.version
    }
  }

  static fromJSON(data: any): Machine {
    const machine = new Machine({
      id: data.id,
      name: data.name,
      type: data.type,
      visual: data.visual,
      workspace: data.workspace,
      cutting: data.cutting,
      physical: data.physical,
      capabilities: data.capabilities,
      postProcessor: data.postProcessor,
      tags: data.tags,
      location: data.location,
      department: data.department
    })

    // Restore additional properties
    machine.status = data.status
    machine.usage = data.usage
    machine.createdAt = new Date(data.createdAt)
    machine.lastModified = new Date(data.lastModified)
    machine.version = data.version

    return machine
  }

  // Create a copy/template of this machine
  clone(newName?: string): Machine {
    const cloneData = this.toJSON()
    return new Machine({
      name: newName || `${this.name} (Copy)`,
      type: cloneData.type,
      visual: { ...cloneData.visual, displayName: newName || `${this.name} (Copy)` },
      workspace: cloneData.workspace,
      cutting: cloneData.cutting,
      physical: cloneData.physical,
      capabilities: cloneData.capabilities,
      postProcessor: cloneData.postProcessor,
      tags: [...cloneData.tags],
      location: cloneData.location,
      department: cloneData.department
    })
  }
}

// Factory functions for creating specific machine types
export class MachineFactory {
  static createEDM(params: {
    name: string
    workspace: WorkspaceSpec
    wireDiameter: number
    cutKerfRadius: number
    postProcessor: MachinePostProcessor
    visual?: Partial<VisualIdentity>
  }): Machine {
    return new Machine({
      name: params.name,
      type: 'EDM',
      visual: params.visual || {},
      workspace: params.workspace,
      cutting: {
        wireDiameter: params.wireDiameter,
        cutKerfRadius: params.cutKerfRadius,
        wireTension: 10, // Default values
        maxWireSpeed: 100,
        maxWireTension: 50
      },
      physical: {
        kinematics: 'cartesian',
        workHoldingSystem: 'vise'
      },
      capabilities: {
        supportedMaterials: ['steel', 'aluminum', 'titanium', 'carbide'],
        supportedFileFormats: ['dxf', 'dwg', 'step']
      },
      postProcessor: params.postProcessor
    })
  }

  static createCNCMill(params: {
    name: string
    workspace: WorkspaceSpec
    spindleSpeedRange: { min: number, max: number }
    postProcessor: MachinePostProcessor
    visual?: Partial<VisualIdentity>
  }): Machine {
    return new Machine({
      name: params.name,
      type: 'CNC_MILL',
      visual: params.visual || {},
      workspace: params.workspace,
      cutting: {
        spindleSpeedRange: params.spindleSpeedRange,
        feedRateRange: { min: 10, max: 5000 },
        toolChanger: {
          capacity: 20,
          autoChange: true,
          toolTypes: ['end_mill', 'drill', 'tap', 'face_mill']
        }
      },
      physical: {
        kinematics: 'cartesian',
        workHoldingSystem: 'vise'
      },
      capabilities: {
        hasToolChanger: true,
        hasProbing: true,
        hasFloodCoolant: true,
        supportedMaterials: ['aluminum', 'steel', 'plastic', 'wood'],
        supportedFileFormats: ['gcode', 'nc', 'tap']
      },
      postProcessor: params.postProcessor
    })
  }

  static create3DPrinter(params: {
    name: string
    workspace: WorkspaceSpec
    nozzleDiameter: number
    postProcessor: MachinePostProcessor
    visual?: Partial<VisualIdentity>
  }): Machine {
    return new Machine({
      name: params.name,
      type: '3D_PRINTER',
      visual: params.visual || {},
      workspace: params.workspace,
      cutting: {
        nozzleDiameter: params.nozzleDiameter,
        extruders: 1,
        maxHotendTemp: 300,
        maxBedTemp: 120,
        bedLevelingType: 'auto',
        buildVolumeHeated: false
      },
      physical: {
        kinematics: 'cartesian'
      },
      capabilities: {
        hasEnclosure: false,
        supportedMaterials: ['PLA', 'ABS', 'PETG', 'TPU'],
        supportedFileFormats: ['gcode', 'stl', '3mf']
      },
      postProcessor: params.postProcessor
    })
  }
}