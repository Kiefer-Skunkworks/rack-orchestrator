<template>
  <div class="machines-view">
    <!-- Header Section -->
    <div class="machines-header">
      <div class="header-content">
        <h1 class="page-title">Rack Machine Command Center</h1>
        <p class="page-subtitle">Manage and monitor your industrial equipment fleet</p>
      </div>

      <div class="header-actions">
        <button class="btn btn-secondary" @click="showComparison = !showComparison">
          <span class="icon">⚖️</span>
          Compare
        </button>
        <button class="btn btn-primary" @click="showWizard = true">
          <span class="icon">➕</span>
          Add Machine
        </button>
      </div>
    </div>

    <!-- Quick Stats Dashboard -->
    <div class="stats-dashboard">
      <div class="stat-card">
        <div class="stat-icon running">🟢</div>
        <div class="stat-content">
          <div class="stat-number">{{ runningMachines }}</div>
          <div class="stat-label">Running</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon idle">🟡</div>
        <div class="stat-content">
          <div class="stat-number">{{ idleMachines }}</div>
          <div class="stat-label">Idle</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon maintenance">🔧</div>
        <div class="stat-content">
          <div class="stat-number">{{ maintenanceMachines }}</div>
          <div class="stat-label">Maintenance</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon total">📊</div>
        <div class="stat-content">
          <div class="stat-number">{{ totalMachines }}</div>
          <div class="stat-label">Total Machines</div>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="controls-section">
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search machines by name, type, or tags..."
          class="search-input"
        />
      </div>

      <div class="filters">
        <select v-model="selectedType" class="filter-select">
          <option value="">All Types</option>
          <option value="EDM">EDM</option>
          <option value="CNC_MILL">CNC Mill</option>
          <option value="CNC_LATHE">CNC Lathe</option>
          <option value="3D_PRINTER">3D Printer</option>
          <option value="LASER_CUTTER">Laser Cutter</option>
          <option value="WATERJET">Waterjet</option>
          <option value="PLASMA_CUTTER">Plasma Cutter</option>
        </select>

        <select v-model="selectedStatus" class="filter-select">
          <option value="">All Status</option>
          <option value="running">Running</option>
          <option value="idle">Idle</option>
          <option value="maintenance">Maintenance</option>
          <option value="error">Error</option>
          <option value="offline">Offline</option>
        </select>
      </div>
    </div>

    <!-- Machine Gallery -->
    <div class="machine-gallery">
      <div
        v-for="machine in filteredMachines"
        :key="machine.id"
        class="machine-card"
        :style="{ '--theme-color': machine.visual.themeColor }"
        @click="selectMachine(machine)"
      >
        <!-- Hero Section -->
        <div class="card-hero">
          <div class="machine-photo">
            <img
              v-if="machine.visual.photoUrl"
              :src="machine.visual.photoUrl"
              :alt="machine.visual.displayName"
              class="photo-image"
            />
            <div v-else class="photo-placeholder" :class="machine.visual.iconType">
              {{ getMachineIcon(machine.type) }}
            </div>
          </div>

          <div class="status-overlay">
            <div class="status-indicator" :class="machine.status">
              <span class="status-dot"></span>
              {{ formatStatus(machine.status) }}
            </div>
          </div>

          <div class="card-actions">
            <button class="action-btn" @click.stop="editMachine(machine)" title="Edit">✏️</button>
            <button class="action-btn" @click.stop="duplicateMachine(machine)" title="Duplicate">
              📋
            </button>
            <button class="action-btn" @click.stop="exportMachine(machine)" title="Export">
              📤
            </button>
          </div>
        </div>

        <!-- Identity Section -->
        <div class="card-identity">
          <h3 class="machine-name">{{ machine.visual.displayName }}</h3>
          <div class="machine-meta">
            <span class="type-badge" :class="machine.type.toLowerCase()">
              {{ formatMachineType(machine.type) }}
            </span>
            <span v-if="machine.location" class="location-tag"> 📍 {{ machine.location }} </span>
          </div>
          <div v-if="machine.tags.length" class="machine-tags">
            <span v-for="tag in machine.tags.slice(0, 3)" :key="tag" class="tag">
              {{ tag }}
            </span>
            <span v-if="machine.tags.length > 3" class="tag-more">
              +{{ machine.tags.length - 3 }}
            </span>
          </div>
        </div>

        <!-- Performance Dashboard -->
        <div class="card-performance">
          <div class="key-specs">
            <div class="spec-item">
              <span class="spec-label">▢ Travel</span>
              <span class="spec-value">
                {{ machine.workspace.xMaxTravel }}×{{ machine.workspace.yMaxTravel }}
              </span>
            </div>

            <div v-if="machine.cutting.cutKerfRadius" class="spec-item">
              <span class="spec-label">✂️ Kerf</span>
              <span class="spec-value"
                >{{ machine.cutting.cutKerfRadius }}{{ machine.workspace.units }}</span
              >
            </div>

            <div v-if="machine.cutting.wireDiameter" class="spec-item">
              <span class="spec-label">🧵 Wire</span>
              <span class="spec-value">Ø{{ machine.cutting.wireDiameter }}mm</span>
            </div>

            <div v-if="machine.cutting.nozzleDiameter" class="spec-item">
              <span class="spec-label">🔩 Nozzle</span>
              <span class="spec-value">Ø{{ machine.cutting.nozzleDiameter }}mm</span>
            </div>
          </div>
        </div>

        <!-- Hover Details -->
        <div class="card-hover-details">
          <div class="detail-item">
            <span class="detail-label">Jobs Completed:</span>
            <span class="detail-value">{{ machine.usage.jobCount || 0 }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Runtime:</span>
            <span class="detail-value">{{ formatRuntime(machine.usage.totalRuntime || 0) }}</span>
          </div>
          <div v-if="machine.usage.lastUsed" class="detail-item">
            <span class="detail-label">Last Used:</span>
            <span class="detail-value">{{ formatDate(machine.usage.lastUsed) }}</span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredMachines.length === 0" class="empty-state">
        <div class="empty-icon">🏭</div>
        <h3>No Machines Found</h3>
        <p v-if="searchQuery || selectedType || selectedStatus">
          Try adjusting your filters or search terms.
        </p>
        <p v-else>Get started by adding your first machine to the fleet.</p>
        <button class="btn btn-primary" @click="showWizard = true">Add First Machine</button>
      </div>
    </div>

    <!-- Machine Setup Wizard -->
    <MachineWizard
      v-if="showWizard"
      :visible="showWizard"
      @close="showWizard = false"
      @created="handleMachineCreated"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import MachineWizard from '../components/MachineWizard.vue'

// Mock machine data based on the data model
const machines = ref([
  {
    id: 'edm_001',
    name: 'BettaWire',
    status: 'running',
    type: 'EDM',
    visual: {
      displayName: 'Rack BettaWire',
      themeColor: '#3B82F6',
      iconType: 'modern',
      photoUrl: 'https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=400&h=300&fit=crop'
    },
    workspace: {
      xMaxTravel: 350,
      yMaxTravel: 250,
      maxWorkPieceX: 300,
      maxWorkPieceY: 200,
      maxWorkPieceZ: 150,
      units: 'mm'
    },
    cutting: {
      wireDiameter: 0.25,
      cutKerfRadius: 0.15,
      wireTension: 12,
      maxWireSpeed: 120
    },
    tags: ['precision', 'production', 'automotive'],
    location: 'Rack 6 - Slot 3',
    usage: {
      totalRuntime: 2847,
      jobCount: 156,
      utilizationRate: 0.78,
      lastUsed: new Date('2025-07-18')
    }
  },
  {
    id: 'mill_001',
    name: 'Haas VF-2',
    status: 'idle',
    type: 'CNC_MILL',
    visual: {
      displayName: 'Haas VF-2 Vertical Mill',
      themeColor: '#10B981',
      iconType: 'industrial',
      photoUrl: 'https://images.unsplash.com/photo-1710065867529-ec214b999a8f?w=400&h=300&fit=crop'
    },
    workspace: {
      xMaxTravel: 508,
      yMaxTravel: 406,
      maxWorkPieceX: 450,
      maxWorkPieceY: 350,
      maxWorkPieceZ: 200,
      units: 'mm'
    },
    cutting: {
      spindleSpeedRange: { min: 100, max: 8000 },
      feedRateRange: { min: 25, max: 3048 }
    },
    tags: ['versatile', 'prototype', 'aluminum'],
    location: 'Rack 2 - Slot 1',
    usage: {
      totalRuntime: 1234,
      jobCount: 89,
      utilizationRate: 0.65,
      lastUsed: new Date('2025-07-17')
    }
  },
  {
    id: 'printer_001',
    name: 'Prusa MK4',
    status: 'maintenance',
    type: '3D_PRINTER',
    visual: {
      displayName: 'Prusa i3 MK4',
      themeColor: '#8B5CF6',
      iconType: 'modern'
    },
    workspace: {
      xMaxTravel: 250,
      yMaxTravel: 210,
      maxWorkPieceX: 250,
      maxWorkPieceY: 210,
      maxWorkPieceZ: 220,
      units: 'mm'
    },
    cutting: {
      nozzleDiameter: 0.4,
      extruders: 1,
      maxHotendTemp: 300,
      maxBedTemp: 120
    },
    tags: ['rapid-prototype', 'design', 'small-parts'],
    location: 'Rack 2 - Slot 2',
    usage: {
      totalRuntime: 456,
      jobCount: 234,
      utilizationRate: 0.42,
      lastUsed: new Date('2025-07-15')
    }
  },
  {
    id: 'laser_001',
    name: 'Epilog Fusion',
    status: 'offline',
    type: 'LASER_CUTTER',
    visual: {
      displayName: 'Epilog Fusion Pro 48',
      themeColor: '#EF4444',
      iconType: 'modern'
    },
    workspace: {
      xMaxTravel: 1219,
      yMaxTravel: 914,
      maxWorkPieceX: 1200,
      maxWorkPieceY: 900,
      maxWorkPieceZ: 25,
      units: 'mm'
    },
    cutting: {
      laserPower: 120,
      wavelength: 10600
    },
    tags: ['sheet-metal', 'engraving', 'signage'],
    location: 'Rack 3 - Slot 1',
    usage: {
      totalRuntime: 789,
      jobCount: 67,
      utilizationRate: 0.23,
      lastUsed: new Date('2025-07-12')
    }
  }
])

// Reactive state
const searchQuery = ref('')
const selectedType = ref('')
const selectedStatus = ref('')
const showWizard = ref(false)
const showComparison = ref(false)

// Computed properties
const filteredMachines = computed(() => {
  return machines.value.filter((machine) => {
    const matchesSearch =
      !searchQuery.value ||
      machine.visual.displayName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      machine.type.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      machine.tags.some((tag) => tag.toLowerCase().includes(searchQuery.value.toLowerCase()))

    const matchesType = !selectedType.value || machine.type === selectedType.value
    const matchesStatus = !selectedStatus.value || machine.status === selectedStatus.value

    return matchesSearch && matchesType && matchesStatus
  })
})

const totalMachines = computed(() => machines.value.length)
const runningMachines = computed(() => machines.value.filter((m) => m.status === 'running').length)
const idleMachines = computed(() => machines.value.filter((m) => m.status === 'idle').length)
const maintenanceMachines = computed(
  () => machines.value.filter((m) => m.status === 'maintenance').length
)

// Helper functions
const getMachineIcon = (type: string): string => {
  const icons: Record<string, string> = {
    EDM: '⚡',
    CNC_MILL: '🔧',
    CNC_LATHE: '🔄',
    '3D_PRINTER': '🖨️',
    LASER_CUTTER: '🔥',
    WATERJET: '💧',
    PLASMA_CUTTER: '⚡'
  }
  return icons[type] || '🏭'
}

const formatMachineType = (type: string): string => {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

const formatStatus = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const formatRuntime = (hours: number): string => {
  if (hours < 24) return `${Math.round(hours)}h`
  const days = Math.floor(hours / 24)
  const remainingHours = Math.round(hours % 24)
  return `${days}d ${remainingHours}h`
}

const formatDate = (date: Date): string => {
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
    Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    'day'
  )
}

// Actions
const selectMachine = (machine: any) => {
  console.log('Selected machine:', machine.visual.displayName)
  // Navigate to machine details
}

const editMachine = (machine: any) => {
  console.log('Edit machine:', machine.visual.displayName)
  // Open edit wizard
}

const duplicateMachine = (machine: any) => {
  console.log('Duplicate machine:', machine.visual.displayName)
  // Create copy
}

const exportMachine = (machine: any) => {
  console.log('Export machine:', machine.visual.displayName)
  // Export configuration
}

onMounted(() => {
  // Load machines from store
  console.log('Machines view mounted')
})
</script>

<style scoped>
.machines-view {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.machines-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--color-border);
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  background-color: var(--color-accent);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-subtitle {
  color: var(--color-text);
  opacity: 0.7;
  margin: 0.5rem 0 0 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  color: var(--color-accent);
  border: 1px solid var(--color-accent);
  background: var(--color-background-soft);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px color-mix(in srgb, var(--color-accent) 50%, black);
}

.btn-secondary {
  background: var(--color-background-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background: var(--color-background-mute);
}

/* Stats Dashboard */
.stats-dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--color-background-soft);
  border-radius: 1rem;
  border: 1px solid var(--color-border);
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2rem;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.stat-icon.running {
  background: rgba(34, 197, 94, 0.1);
}
.stat-icon.idle {
  background: rgba(245, 158, 11, 0.1);
}
.stat-icon.maintenance {
  background: rgba(239, 68, 68, 0.1);
}
.stat-icon.total {
  background: rgba(99, 102, 241, 0.1);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.stat-label {
  color: var(--color-text);
  opacity: 0.7;
  font-size: 0.9rem;
}

/* Controls */
.controls-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-bar {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.5;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 10%, transparent);
}

.filters {
  display: flex;
  gap: 1rem;
}

.filter-select {
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 1rem;
}

/* Machine Gallery */
.machine-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2rem;
}

.machine-card {
  position: relative;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.machine-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-color: var(--theme-color);
}

.machine-card:hover .card-hover-details {
  opacity: 1;
  transform: translateY(0);
}

/* Card Hero */
.card-hero {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.machine-photo {
  width: 100%;
  height: 100%;
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    var(--theme-color),
    color-mix(in srgb, var(--theme-color) 70%, white)
  );
  font-size: 4rem;
  color: white;
}

.status-overlay {
  position: absolute;
  top: 1rem;
  left: 1rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.9);
  color: var(--color-background);
  backdrop-filter: blur(10px);
  border-radius: 2rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-indicator.running .status-dot {
  background: #22c55e;
}
.status-indicator.idle .status-dot {
  background: #f59e0b;
}
.status-indicator.maintenance .status-dot {
  background: #ef4444;
}
.status-indicator.error .status-dot {
  background: #dc2626;
}
.status-indicator.offline .status-dot {
  background: #6b7280;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.card-actions {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.machine-card:hover .card-actions {
  opacity: 1;
}

.action-btn {
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: white;
  transform: scale(1.1);
}

/* Card Identity */
.card-identity {
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.machine-name {
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--theme-color);
}

.machine-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.type-badge {
  padding: 0.25rem 0.75rem;
  background: var(--theme-color);
  color: white;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.location-tag {
  font-size: 0.8rem;
  color: var(--color-text);
  opacity: 0.7;
}

.machine-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  padding: 0.25rem 0.5rem;
  background: var(--color-background-soft);
  border-radius: 0.5rem;
  font-size: 0.7rem;
  color: var(--color-text);
  opacity: 0.8;
}

.tag-more {
  padding: 0.25rem 0.5rem;
  background: var(--color-border);
  border-radius: 0.5rem;
  font-size: 0.7rem;
  color: var(--color-text);
  opacity: 0.6;
}

/* Card Performance */
.card-performance {
  padding: 1.5rem;
}

.workspace-preview h4 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  font-weight: 600;
  opacity: 0.8;
}

.workspace-viz {
  margin-bottom: 1rem;
  background-color: var(--color-background-soft);
}

.workspace-3d {
  height: 60px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.workspace-3d::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 40%, rgba(0, 0, 0, 0.05) 50%, transparent 60%),
    linear-gradient(-45deg, transparent 40%, rgba(0, 0, 0, 0.05) 50%, transparent 60%);
}

.dimension-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text);
  z-index: 1;
  position: relative;
}

.key-specs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.spec-item {
  text-align: center;
}

.spec-label {
  display: block;
  font-size: 0.7rem;
  opacity: 0.6;
  margin-bottom: 0.25rem;
}

.spec-value {
  display: block;
  font-weight: 600;
  font-size: 0.8rem;
  color: var(--theme-color);
}

.utilization-metrics {
  display: flex;
  justify-content: center;
}

.metric {
  text-align: center;
}

.metric-label {
  font-size: 0.8rem;
  opacity: 0.7;
  margin-bottom: 0.5rem;
}

.progress-ring {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: conic-gradient(
    var(--theme-color) var(--progress, 0%),
    var(--color-background-mute) var(--progress, 0%)
  );
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-ring::before {
  content: '';
  position: absolute;
  width: 70%;
  height: 70%;
  background: var(--color-background);
  border-radius: 50%;
}

.progress-text {
  position: relative;
  z-index: 1;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--theme-color);
}

/* Hover Details */
.card-hover-details {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-top: 1px solid var(--color-border);
  opacity: 0;
  transform: translateY(100%);
  transition: all 0.3s ease;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-size: 0.8rem;
  opacity: 0.7;
}

.detail-value {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--theme-color);
}

/* Empty State */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  color: var(--color-text);
  opacity: 0.6;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
}

.empty-state p {
  margin: 0 0 2rem 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--color-background);
  border-radius: 1rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  background: none;
  font-size: 1.2rem;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
  transition: all 0.2s ease;
}

.close-btn:hover {
  opacity: 1;
  background: var(--color-background-soft);
}

.modal-body {
  padding: 2rem;
}

.wizard-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .machines-view {
    padding: 1rem;
  }

  .machines-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .header-actions {
    justify-content: center;
  }

  .page-title {
    font-size: 2rem;
    text-align: center;
  }

  .stats-dashboard {
    grid-template-columns: repeat(2, 1fr);
  }

  .controls-section {
    flex-direction: column;
  }

  .search-bar {
    min-width: auto;
  }

  .machine-gallery {
    grid-template-columns: 1fr;
  }

  .machine-card {
    margin-bottom: 1rem;
  }

  .card-actions {
    opacity: 1;
  }

  .card-hover-details {
    position: static;
    opacity: 1;
    transform: none;
    background: var(--color-background-soft);
    backdrop-filter: none;
  }
}

@media (max-width: 480px) {
  .stats-dashboard {
    grid-template-columns: 1fr;
  }

  .machine-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .key-specs {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
