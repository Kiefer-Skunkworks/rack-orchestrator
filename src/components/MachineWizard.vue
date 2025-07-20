<template>
  <div class="wizard-overlay" @click="handleOverlayClick">
    <div class="wizard-container" @click.stop>
      <!-- Wizard Header -->
      <div class="wizard-header">
        <div class="header-content">
          <h2 class="wizard-title">Add New Machine</h2>
          <p class="wizard-subtitle">Step {{ currentStep }} of {{ totalSteps }}</p>
        </div>
        <button class="close-btn" @click="$emit('close')" title="Close">
          <span class="close-icon">✕</span>
        </button>
      </div>

      <!-- Progress Bar -->
      <div class="progress-container">
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: `${(currentStep / totalSteps) * 100}%` }"
          ></div>
        </div>
        <div class="step-indicators">
          <div
            v-for="(step, index) in steps"
            :key="index"
            class="step-indicator"
            :class="{
              completed: index + 1 < currentStep,
              active: index + 1 === currentStep,
              upcoming: index + 1 > currentStep
            }"
          >
            <div class="step-circle">
              <span v-if="index + 1 < currentStep" class="step-check">✓</span>
              <span v-else class="step-number">{{ index + 1 }}</span>
            </div>
            <span class="step-label">{{ step.label }}</span>
          </div>
        </div>
      </div>

      <!-- Wizard Content -->
      <div class="wizard-content">
        <!-- Step 1: Machine Identity -->
        <div v-if="currentStep === 1" class="step-content identity-step">
          <div class="step-header">
            <h3>Machine Identity</h3>
            <p>Give your machine a name and visual identity</p>
          </div>

          <div class="identity-form">
            <div class="photo-section">
              <div class="photo-upload-area" :class="{ 'has-photo': machineData.visual.photoUrl }">
                <input
                  ref="photoInput"
                  type="file"
                  accept="image/*"
                  @change="handlePhotoUpload"
                  class="photo-input"
                />

                <div v-if="machineData.visual.photoUrl" class="photo-preview">
                  <img :src="machineData.visual.photoUrl" :alt="machineData.name" />
                  <div class="photo-overlay">
                    <button @click="$refs.photoInput.click()" class="change-photo-btn">
                      Change Photo
                    </button>
                    <button @click="removePhoto" class="remove-photo-btn">Remove</button>
                  </div>
                </div>

                <div v-else class="photo-placeholder" @click="$refs.photoInput.click()">
                  <div class="upload-icon">📷</div>
                  <p>Click to add machine photo</p>
                  <span class="upload-hint">JPG, PNG up to 5MB</span>
                </div>
              </div>
            </div>

            <div class="identity-fields">
              <div class="field-group">
                <label for="machine-name" class="field-label">Machine Name</label>
                <input
                  id="machine-name"
                  v-model="machineData.name"
                  type="text"
                  class="field-input"
                  placeholder="e.g., Haas VF-2, Prusa MK4"
                  @input="updateDisplayName"
                />
              </div>

              <div class="field-group">
                <label for="display-name" class="field-label">Display Name</label>
                <input
                  id="display-name"
                  v-model="machineData.visual.displayName"
                  type="text"
                  class="field-input"
                  placeholder="Friendly name for the interface"
                />
              </div>

              <div class="field-group">
                <label class="field-label">Machine Type</label>
                <div class="type-selector">
                  <div
                    v-for="type in machineTypes"
                    :key="type.value"
                    class="type-option"
                    :class="{ selected: machineData.type === type.value }"
                    @click="selectMachineType(type.value)"
                  >
                    <div class="type-icon">{{ type.icon }}</div>
                    <span class="type-name">{{ type.label }}</span>
                  </div>
                </div>
              </div>

              <div class="field-group">
                <label class="field-label">Theme Color</label>
                <div class="color-picker">
                  <div
                    v-for="color in themeColors"
                    :key="color"
                    class="color-option"
                    :class="{ selected: machineData.visual.themeColor === color }"
                    :style="{ backgroundColor: color }"
                    @click="machineData.visual.themeColor = color"
                  >
                    <span v-if="machineData.visual.themeColor === color" class="color-check"
                      >✓</span
                    >
                  </div>
                </div>
              </div>

              <div class="field-group">
                <label for="location" class="field-label">Location</label>
                <input
                  id="location"
                  v-model="machineData.location"
                  type="text"
                  class="field-input"
                  placeholder="e.g., Rack 2 - Slot 3, Workshop A"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Physical Specifications -->
        <div v-if="currentStep === 2" class="step-content workspace-step">
          <div class="step-header">
            <h3>Physical Specifications</h3>
            <p>Define the machine's workspace and travel limits</p>
          </div>

          <div class="workspace-form">
            <div class="workspace-preview">
              <h4>Workspace Preview</h4>
              <div class="workspace-3d">
                <div class="workspace-bounds" :style="workspaceStyle">
                  <div class="workspace-inner">
                    <span class="dimension-label">
                      {{ machineData.workspace.maxWorkPieceX }}×{{
                        machineData.workspace.maxWorkPieceY
                      }}
                      {{ machineData.workspace.units }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="workspace-inputs">
              <div class="units-selector">
                <label class="field-label">Units</label>
                <div class="radio-group">
                  <label class="radio-option">
                    <input v-model="machineData.workspace.units" type="radio" value="mm" />
                    <span>Millimeters (mm)</span>
                  </label>
                  <label class="radio-option">
                    <input v-model="machineData.workspace.units" type="radio" value="inches" />
                    <span>Inches</span>
                  </label>
                </div>
              </div>

              <div class="dimension-group">
                <h4>Machine Travel Limits</h4>
                <div class="dimension-inputs">
                  <div class="dimension-field">
                    <label class="field-label">X Travel</label>
                    <div class="input-with-unit">
                      <input
                        v-model.number="machineData.workspace.xMaxTravel"
                        type="number"
                        class="field-input"
                        min="0"
                        step="0.1"
                      />
                      <span class="unit-label">{{ machineData.workspace.units }}</span>
                    </div>
                  </div>
                  <div class="dimension-field">
                    <label class="field-label">Y Travel</label>
                    <div class="input-with-unit">
                      <input
                        v-model.number="machineData.workspace.yMaxTravel"
                        type="number"
                        class="field-input"
                        min="0"
                        step="0.1"
                      />
                      <span class="unit-label">{{ machineData.workspace.units }}</span>
                    </div>
                  </div>
                  <div class="dimension-field">
                    <label class="field-label">Z Travel</label>
                    <div class="input-with-unit">
                      <input
                        v-model.number="machineData.workspace.zMaxTravel"
                        type="number"
                        class="field-input"
                        min="0"
                        step="0.1"
                      />
                      <span class="unit-label">{{ machineData.workspace.units }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="dimension-group">
                <h4>Usable Workspace</h4>
                <div class="dimension-inputs">
                  <div class="dimension-field">
                    <label class="field-label">Max Workpiece X</label>
                    <div class="input-with-unit">
                      <input
                        v-model.number="machineData.workspace.maxWorkPieceX"
                        type="number"
                        class="field-input"
                        min="0"
                        step="0.1"
                        :max="machineData.workspace.xMaxTravel"
                      />
                      <span class="unit-label">{{ machineData.workspace.units }}</span>
                    </div>
                  </div>
                  <div class="dimension-field">
                    <label class="field-label">Max Workpiece Y</label>
                    <div class="input-with-unit">
                      <input
                        v-model.number="machineData.workspace.maxWorkPieceY"
                        type="number"
                        class="field-input"
                        min="0"
                        step="0.1"
                        :max="machineData.workspace.yMaxTravel"
                      />
                      <span class="unit-label">{{ machineData.workspace.units }}</span>
                    </div>
                  </div>
                  <div class="dimension-field">
                    <label class="field-label">Max Workpiece Z</label>
                    <div class="input-with-unit">
                      <input
                        v-model.number="machineData.workspace.maxWorkPieceZ"
                        type="number"
                        class="field-input"
                        min="0"
                        step="0.1"
                        :max="machineData.workspace.zMaxTravel"
                      />
                      <span class="unit-label">{{ machineData.workspace.units }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Cutting Parameters -->
        <div v-if="currentStep === 3" class="step-content cutting-step">
          <div class="step-header">
            <h3>Cutting Parameters</h3>
            <p>Configure machine-specific cutting capabilities</p>
          </div>

          <div class="cutting-form">
            <!-- EDM Parameters -->
            <div v-if="machineData.type === 'EDM'" class="parameter-group">
              <h4>EDM Configuration</h4>
              <div class="parameter-grid">
                <div class="field-group">
                  <label class="field-label">Wire Diameter</label>
                  <div class="input-with-unit">
                    <input
                      v-model.number="machineData.cutting.wireDiameter"
                      type="number"
                      class="field-input"
                      step="0.01"
                      min="0.01"
                    />
                    <span class="unit-label">mm</span>
                  </div>
                </div>
                <div class="field-group">
                  <label class="field-label">Cut Kerf Radius</label>
                  <div class="input-with-unit">
                    <input
                      v-model.number="machineData.cutting.cutKerfRadius"
                      type="number"
                      class="field-input"
                      step="0.01"
                      min="0"
                    />
                    <span class="unit-label">mm</span>
                  </div>
                </div>
                <div class="field-group">
                  <label class="field-label">Max Wire Speed</label>
                  <div class="input-with-unit">
                    <input
                      v-model.number="machineData.cutting.maxWireSpeed"
                      type="number"
                      class="field-input"
                      min="0"
                    />
                    <span class="unit-label">mm/min</span>
                  </div>
                </div>
                <div class="field-group">
                  <label class="field-label">Wire Tension</label>
                  <div class="input-with-unit">
                    <input
                      v-model.number="machineData.cutting.wireTension"
                      type="number"
                      class="field-input"
                      min="0"
                    />
                    <span class="unit-label">N</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- CNC Mill Parameters -->
            <div v-if="machineData.type === 'CNC_MILL'" class="parameter-group">
              <h4>CNC Mill Configuration</h4>
              <div class="parameter-grid">
                <div class="field-group">
                  <label class="field-label">Min Spindle Speed</label>
                  <div class="input-with-unit">
                    <input
                      v-model.number="machineData.cutting.spindleSpeedRange.min"
                      type="number"
                      class="field-input"
                      min="0"
                    />
                    <span class="unit-label">RPM</span>
                  </div>
                </div>
                <div class="field-group">
                  <label class="field-label">Max Spindle Speed</label>
                  <div class="input-with-unit">
                    <input
                      v-model.number="machineData.cutting.spindleSpeedRange.max"
                      type="number"
                      class="field-input"
                      min="0"
                    />
                    <span class="unit-label">RPM</span>
                  </div>
                </div>
                <div class="field-group">
                  <label class="field-label">Min Feed Rate</label>
                  <div class="input-with-unit">
                    <input
                      v-model.number="machineData.cutting.feedRateRange.min"
                      type="number"
                      class="field-input"
                      min="0"
                    />
                    <span class="unit-label">mm/min</span>
                  </div>
                </div>
                <div class="field-group">
                  <label class="field-label">Max Feed Rate</label>
                  <div class="input-with-unit">
                    <input
                      v-model.number="machineData.cutting.feedRateRange.max"
                      type="number"
                      class="field-input"
                      min="0"
                    />
                    <span class="unit-label">mm/min</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3D Printer Parameters -->
            <div v-if="machineData.type === '3D_PRINTER'" class="parameter-group">
              <h4>3D Printer Configuration</h4>
              <div class="parameter-grid">
                <div class="field-group">
                  <label class="field-label">Nozzle Diameter</label>
                  <div class="input-with-unit">
                    <input
                      v-model.number="machineData.cutting.nozzleDiameter"
                      type="number"
                      class="field-input"
                      step="0.1"
                      min="0.1"
                    />
                    <span class="unit-label">mm</span>
                  </div>
                </div>
                <div class="field-group">
                  <label class="field-label">Number of Extruders</label>
                  <input
                    v-model.number="machineData.cutting.extruders"
                    type="number"
                    class="field-input"
                    min="1"
                    max="8"
                  />
                </div>
                <div class="field-group">
                  <label class="field-label">Max Hotend Temp</label>
                  <div class="input-with-unit">
                    <input
                      v-model.number="machineData.cutting.maxHotendTemp"
                      type="number"
                      class="field-input"
                      min="0"
                    />
                    <span class="unit-label">°C</span>
                  </div>
                </div>
                <div class="field-group">
                  <label class="field-label">Max Bed Temp</label>
                  <div class="input-with-unit">
                    <input
                      v-model.number="machineData.cutting.maxBedTemp"
                      type="number"
                      class="field-input"
                      min="0"
                    />
                    <span class="unit-label">°C</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Laser Cutter Parameters -->
            <div v-if="machineData.type === 'LASER_CUTTER'" class="parameter-group">
              <h4>Laser Cutter Configuration</h4>
              <div class="parameter-grid">
                <div class="field-group">
                  <label class="field-label">Laser Power</label>
                  <div class="input-with-unit">
                    <input
                      v-model.number="machineData.cutting.laserPower"
                      type="number"
                      class="field-input"
                      min="0"
                    />
                    <span class="unit-label">W</span>
                  </div>
                </div>
                <div class="field-group">
                  <label class="field-label">Wavelength</label>
                  <div class="input-with-unit">
                    <input
                      v-model.number="machineData.cutting.wavelength"
                      type="number"
                      class="field-input"
                      min="0"
                    />
                    <span class="unit-label">nm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 4: Post-Processing -->
        <div v-if="currentStep === 4" class="step-content postprocessor-step">
          <div class="step-header">
            <h3>Post-Processing</h3>
            <p>Configure code generation and output settings</p>
          </div>

          <div class="postprocessor-form">
            <div class="field-group">
              <label class="field-label">Post-Processor Name</label>
              <input
                v-model="machineData.postProcessor.name"
                type="text"
                class="field-input"
                placeholder="e.g., Haas NGC, Grbl, Marlin"
              />
            </div>

            <div class="field-group">
              <label class="field-label">File Extension</label>
              <input
                v-model="machineData.postProcessor.fileExtension"
                type="text"
                class="field-input"
                placeholder="e.g., .nc, .gcode, .ngc"
              />
            </div>

            <div class="field-group">
              <label class="field-label">Template</label>
              <select v-model="machineData.postProcessor.template" class="field-select">
                <option value="">Select a template...</option>
                <option
                  v-for="template in postProcessorTemplates"
                  :key="template.value"
                  :value="template.value"
                >
                  {{ template.label }}
                </option>
              </select>
            </div>

            <div class="capabilities-section">
              <h4>Machine Capabilities</h4>
              <div class="capability-checkboxes">
                <label
                  v-for="capability in capabilities"
                  :key="capability.key"
                  class="checkbox-option"
                >
                  <input v-model="machineData.capabilities[capability.key]" type="checkbox" />
                  <span class="checkbox-label">{{ capability.label }}</span>
                </label>
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Tags</label>
              <div class="tags-input">
                <div class="selected-tags">
                  <span v-for="tag in machineData.tags" :key="tag" class="tag-chip">
                    {{ tag }}
                    <button @click="removeTag(tag)" class="tag-remove">×</button>
                  </span>
                </div>
                <input
                  v-model="newTag"
                  type="text"
                  class="tag-input"
                  placeholder="Add tag..."
                  @keyup.enter="addTag"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Step 5: Review -->
        <div v-if="currentStep === 5" class="step-content review-step">
          <div class="step-header">
            <h3>Review & Create</h3>
            <p>Review your machine configuration</p>
          </div>

          <div class="review-content">
            <div class="machine-preview">
              <div class="preview-card" :style="{ '--theme-color': machineData.visual.themeColor }">
                <div class="preview-hero">
                  <div class="preview-photo">
                    <img
                      v-if="machineData.visual.photoUrl"
                      :src="machineData.visual.photoUrl"
                      :alt="machineData.visual.displayName"
                    />
                    <div v-else class="preview-placeholder">
                      {{ getMachineIcon(machineData.type) }}
                    </div>
                  </div>
                  <div class="preview-status">
                    <span class="status-dot"></span>
                    Ready to Configure
                  </div>
                </div>
                <div class="preview-identity">
                  <h3>{{ machineData.visual.displayName }}</h3>
                  <div class="preview-meta">
                    <span class="type-badge">{{ formatMachineType(machineData.type) }}</span>
                    <span v-if="machineData.location" class="location-tag">
                      📍 {{ machineData.location }}
                    </span>
                  </div>
                  <div v-if="machineData.tags.length" class="preview-tags">
                    <span v-for="tag in machineData.tags" :key="tag" class="tag">{{ tag }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="review-details">
              <div class="detail-section">
                <h4>Workspace</h4>
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="detail-label">Travel:</span>
                    <span class="detail-value">
                      {{ machineData.workspace.xMaxTravel }}×{{
                        machineData.workspace.yMaxTravel
                      }}×{{ machineData.workspace.zMaxTravel }} {{ machineData.workspace.units }}
                    </span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Workpiece:</span>
                    <span class="detail-value">
                      {{ machineData.workspace.maxWorkPieceX }}×{{
                        machineData.workspace.maxWorkPieceY
                      }}×{{ machineData.workspace.maxWorkPieceZ }} {{ machineData.workspace.units }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="detail-section">
                <h4>Cutting Parameters</h4>
                <div class="detail-grid">
                  <div v-if="machineData.cutting.wireDiameter" class="detail-item">
                    <span class="detail-label">Wire Diameter:</span>
                    <span class="detail-value">{{ machineData.cutting.wireDiameter }}mm</span>
                  </div>
                  <div v-if="machineData.cutting.cutKerfRadius" class="detail-item">
                    <span class="detail-label">Kerf Radius:</span>
                    <span class="detail-value">{{ machineData.cutting.cutKerfRadius }}mm</span>
                  </div>
                  <div v-if="machineData.cutting.nozzleDiameter" class="detail-item">
                    <span class="detail-label">Nozzle:</span>
                    <span class="detail-value">Ø{{ machineData.cutting.nozzleDiameter }}mm</span>
                  </div>
                  <div v-if="machineData.cutting.laserPower" class="detail-item">
                    <span class="detail-label">Laser Power:</span>
                    <span class="detail-value">{{ machineData.cutting.laserPower }}W</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Wizard Actions -->
      <div class="wizard-actions">
        <button v-if="currentStep > 1" @click="previousStep" class="btn btn-secondary">
          <span class="btn-icon">←</span>
          Previous
        </button>

        <div class="actions-spacer"></div>

        <button
          v-if="currentStep < totalSteps"
          @click="nextStep"
          class="btn btn-primary"
          :disabled="!isCurrentStepValid"
        >
          Next
          <span class="btn-icon">→</span>
        </button>

        <button
          v-if="currentStep === totalSteps"
          @click="createMachine"
          class="btn btn-success"
          :disabled="!isCurrentStepValid"
        >
          <span class="btn-icon">✓</span>
          Create Machine
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'

// Props and Emits
defineProps<{
  visible?: boolean
}>()

const emit = defineEmits<{
  close: []
  created: [machine: any]
}>()

// Wizard state
const currentStep = ref(1)
const totalSteps = 5

const steps = [
  { label: 'Identity' },
  { label: 'Workspace' },
  { label: 'Cutting' },
  { label: 'Post-Processing' },
  { label: 'Review' }
]

// Form data
const machineData = reactive({
  name: '',
  type: '',
  visual: {
    displayName: '',
    photoUrl: '',
    themeColor: '#3B82F6',
    iconType: 'modern'
  },
  workspace: {
    xMaxTravel: 300,
    yMaxTravel: 200,
    zMaxTravel: 150,
    maxWorkPieceX: 250,
    maxWorkPieceY: 150,
    maxWorkPieceZ: 100,
    units: 'mm',
    origin: { x: 0, y: 0, z: 0 },
    coordinateSystem: 'machine'
  },
  cutting: {
    // EDM
    wireDiameter: 0.25,
    cutKerfRadius: 0.15,
    maxWireSpeed: 120,
    wireTension: 12,
    // CNC
    spindleSpeedRange: { min: 100, max: 8000 },
    feedRateRange: { min: 25, max: 3048 },
    // 3D Printer
    nozzleDiameter: 0.4,
    extruders: 1,
    maxHotendTemp: 300,
    maxBedTemp: 120,
    // Laser
    laserPower: 120,
    wavelength: 10600
  },
  postProcessor: {
    name: '',
    fileExtension: '.nc',
    template: ''
  },
  capabilities: {
    hasToolChanger: false,
    hasProbing: false,
    hasRotaryAxis: false,
    hasFloodCoolant: false,
    hasMistCoolant: false,
    hasEnclosure: false,
    hasCamera: false
  },
  tags: [],
  location: ''
})

const newTag = ref('')

// Machine types
const machineTypes = [
  { value: 'EDM', label: 'EDM', icon: '⚡' },
  { value: 'CNC_MILL', label: 'CNC Mill', icon: '🔧' },
  { value: 'CNC_LATHE', label: 'CNC Lathe', icon: '🔄' },
  { value: '3D_PRINTER', label: '3D Printer', icon: '🖨️' },
  { value: 'LASER_CUTTER', label: 'Laser Cutter', icon: '🔥' },
  { value: 'WATERJET', label: 'Waterjet', icon: '💧' },
  { value: 'PLASMA_CUTTER', label: 'Plasma Cutter', icon: '⚡' }
]

// Theme colors
const themeColors = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#06B6D4',
  '#F97316',
  '#84CC16',
  '#EC4899',
  '#6B7280'
]

// Post-processor templates
const postProcessorTemplates = [
  { value: 'grbl', label: 'GRBL (CNC)' },
  { value: 'haas', label: 'Haas NGC' },
  { value: 'fanuc', label: 'Fanuc' },
  { value: 'siemens', label: 'Siemens' },
  { value: 'marlin', label: 'Marlin (3D Printer)' },
  { value: 'klipper', label: 'Klipper (3D Printer)' },
  { value: 'lightburn', label: 'LightBurn (Laser)' },
  { value: 'rdworks', label: 'RDWorks (Laser)' },
  { value: 'edm_standard', label: 'EDM Standard' }
]

// Capabilities
const capabilities = [
  { key: 'hasToolChanger', label: 'Automatic Tool Changer' },
  { key: 'hasProbing', label: 'Probing System' },
  { key: 'hasRotaryAxis', label: 'Rotary Axis' },
  { key: 'hasFloodCoolant', label: 'Flood Coolant' },
  { key: 'hasMistCoolant', label: 'Mist Coolant' },
  { key: 'hasEnclosure', label: 'Enclosure' },
  { key: 'hasCamera', label: 'Monitoring Camera' }
]

// Computed properties
const workspaceStyle = computed(() => {
  const maxDimension = Math.max(
    machineData.workspace.maxWorkPieceX,
    machineData.workspace.maxWorkPieceY
  )
  const scale = 200 / maxDimension

  return {
    width: `${machineData.workspace.maxWorkPieceX * scale}px`,
    height: `${machineData.workspace.maxWorkPieceY * scale}px`,
    backgroundColor: machineData.visual.themeColor + '20',
    border: `2px solid ${machineData.visual.themeColor}`
  }
})

const isCurrentStepValid = computed(() => {
  switch (currentStep.value) {
    case 1:
      return machineData.name && machineData.type && machineData.visual.displayName
    case 2:
      return (
        machineData.workspace.xMaxTravel > 0 &&
        machineData.workspace.yMaxTravel > 0 &&
        machineData.workspace.maxWorkPieceX > 0 &&
        machineData.workspace.maxWorkPieceY > 0 &&
        machineData.workspace.maxWorkPieceX <= machineData.workspace.xMaxTravel &&
        machineData.workspace.maxWorkPieceY <= machineData.workspace.yMaxTravel
      )
    case 3:
      if (machineData.type === 'EDM') {
        return machineData.cutting.wireDiameter > 0 && machineData.cutting.cutKerfRadius >= 0
      }
      if (machineData.type === 'CNC_MILL') {
        return (
          machineData.cutting.spindleSpeedRange.min > 0 &&
          machineData.cutting.spindleSpeedRange.max > machineData.cutting.spindleSpeedRange.min
        )
      }
      if (machineData.type === '3D_PRINTER') {
        return machineData.cutting.nozzleDiameter > 0 && machineData.cutting.extruders > 0
      }
      if (machineData.type === 'LASER_CUTTER') {
        return machineData.cutting.laserPower > 0
      }
      return true
    case 4:
      return machineData.postProcessor.name && machineData.postProcessor.fileExtension
    case 5:
      return true
    default:
      return false
  }
})

// Methods
const handleOverlayClick = () => {
  emit('close')
}

const updateDisplayName = () => {
  if (!machineData.visual.displayName || machineData.visual.displayName === machineData.name) {
    machineData.visual.displayName = machineData.name
  }
}

const selectMachineType = (type: string) => {
  machineData.type = type

  // Set default post-processor based on type
  switch (type) {
    case 'EDM':
      machineData.postProcessor.name = 'EDM Standard'
      machineData.postProcessor.template = 'edm_standard'
      machineData.postProcessor.fileExtension = '.edm'
      break
    case 'CNC_MILL':
    case 'CNC_LATHE':
      machineData.postProcessor.name = 'GRBL'
      machineData.postProcessor.template = 'grbl'
      machineData.postProcessor.fileExtension = '.nc'
      break
    case '3D_PRINTER':
      machineData.postProcessor.name = 'Marlin'
      machineData.postProcessor.template = 'marlin'
      machineData.postProcessor.fileExtension = '.gcode'
      break
    case 'LASER_CUTTER':
      machineData.postProcessor.name = 'LightBurn'
      machineData.postProcessor.template = 'lightburn'
      machineData.postProcessor.fileExtension = '.lbrn'
      break
    default:
      machineData.postProcessor.name = ''
      machineData.postProcessor.template = ''
      machineData.postProcessor.fileExtension = '.nc'
  }
}

const handlePhotoUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      alert('File size must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      machineData.visual.photoUrl = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const removePhoto = () => {
  machineData.visual.photoUrl = ''
}

const addTag = () => {
  if (newTag.value.trim() && !machineData.tags.includes(newTag.value.trim())) {
    machineData.tags.push(newTag.value.trim())
    newTag.value = ''
  }
}

const removeTag = (tag: string) => {
  machineData.tags = machineData.tags.filter((t) => t !== tag)
}

const nextStep = () => {
  if (currentStep.value < totalSteps && isCurrentStepValid.value) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const createMachine = () => {
  if (isCurrentStepValid.value) {
    // Create machine object
    const machine = {
      id: `machine_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...machineData,
      status: 'offline',
      createdAt: new Date(),
      lastModified: new Date(),
      version: 1,
      usage: {
        totalRuntime: 0,
        jobCount: 0,
        utilizationRate: 0
      }
    }

    emit('created', machine)
    emit('close')
  }
}

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

// Watch for machine type changes to update cutting parameters
watch(
  () => machineData.type,
  (newType) => {
    // Reset capabilities based on machine type
    Object.keys(machineData.capabilities).forEach((key) => {
      machineData.capabilities[key] = false
    })

    // Set default capabilities for machine type
    switch (newType) {
      case 'CNC_MILL':
        machineData.capabilities.hasToolChanger = true
        machineData.capabilities.hasProbing = true
        machineData.capabilities.hasFloodCoolant = true
        break
      case '3D_PRINTER':
        machineData.capabilities.hasEnclosure = true
        machineData.capabilities.hasCamera = true
        break
      case 'LASER_CUTTER':
        machineData.capabilities.hasEnclosure = true
        machineData.capabilities.hasCamera = true
        break
    }
  }
)
</script>

<style scoped>
.wizard-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.wizard-container {
  background: var(--color-background);
  border-radius: 1.5rem;
  width: 90%;
  max-width: 1200px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
  display: flex;
  flex-direction: column;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Header */
.wizard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid var(--color-border);
}

.wizard-title {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-text);
}

.wizard-subtitle {
  margin: 0.5rem 0 0 0;
  color: var(--color-text);
  opacity: 0.7;
  font-size: 0.9rem;
}

.close-btn {
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  background: var(--color-background-soft);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--color-background-mute);
  transform: scale(1.1);
}

.close-icon {
  font-size: 1.2rem;
  color: var(--color-text);
  opacity: 0.7;
}

/* Progress */
.progress-container {
  padding: 1rem 2rem 2rem 2rem;
}

.progress-bar {
  height: 4px;
  background: var(--color-background-mute);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #10b981);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.step-indicators {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.step-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  text-align: center;
}

.step-circle {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

.step-indicator.completed .step-circle {
  background: #10b981;
  color: white;
}

.step-indicator.active .step-circle {
  background: #3b82f6;
  color: white;
  transform: scale(1.1);
}

.step-indicator.upcoming .step-circle {
  background: var(--color-background-mute);
  color: var(--color-text);
  opacity: 0.5;
}

.step-label {
  font-size: 0.8rem;
  color: var(--color-text);
  opacity: 0.7;
}

.step-indicator.active .step-label {
  opacity: 1;
  font-weight: 600;
}

/* Content */
.wizard-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 2rem;
}

.step-content {
  min-height: 400px;
  animation: slideInContent 0.3s ease;
}

@keyframes slideInContent {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.step-header {
  margin-bottom: 2rem;
  text-align: center;
}

.step-header h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
}

.step-header p {
  margin: 0;
  color: var(--color-text);
  opacity: 0.7;
}

/* Form Elements */
.field-group {
  margin-bottom: 1.5rem;
}

.field-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.9rem;
}

.field-input,
.field-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.field-input:focus,
.field-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-with-unit {
  display: flex;
  align-items: center;
}

.input-with-unit .field-input {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-right: none;
}

.unit-label {
  padding: 0.75rem 1rem;
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-left: none;
  border-top-right-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
  font-size: 0.9rem;
  color: var(--color-text);
  opacity: 0.7;
  white-space: nowrap;
}

/* Identity Step */
.identity-form {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  align-items: start;
}

.photo-section {
  position: sticky;
  top: 1rem;
}

.photo-upload-area {
  position: relative;
  aspect-ratio: 4/3;
  border: 2px dashed var(--color-border);
  border-radius: 1rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.photo-upload-area:hover {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.photo-upload-area.has-photo {
  border-style: solid;
}

.photo-input {
  display: none;
}

.photo-preview {
  position: relative;
  width: 100%;
  height: 100%;
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.photo-preview:hover .photo-overlay {
  opacity: 1;
}

.change-photo-btn,
.remove-photo-btn {
  padding: 0.5rem 1rem;
  border: 1px solid white;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.change-photo-btn:hover,
.remove-photo-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.photo-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 1rem;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.photo-placeholder p {
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  color: var(--color-text);
}

.upload-hint {
  font-size: 0.8rem;
  color: var(--color-text);
  opacity: 0.6;
}

.type-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.type-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border: 2px solid var(--color-border);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.type-option:hover {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.type-option.selected {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.type-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.type-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
}

.color-picker {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.color-option {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.selected {
  border-color: var(--color-text);
  transform: scale(1.15);
}

.color-check {
  color: white;
  font-weight: bold;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
}

.radio-group {
  display: flex;
  gap: 1rem;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.radio-option input[type='radio'] {
  margin: 0;
}

/* Workspace Step */
.workspace-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.workspace-preview h4 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
}

.workspace-3d {
  height: 200px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.workspace-bounds {
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
}

.workspace-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.dimension-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: white;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  background: rgba(0, 0, 0, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  backdrop-filter: blur(4px);
}

.dimension-group {
  margin-bottom: 2rem;
}

.dimension-group h4 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
}

.dimension-inputs {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

/* Cutting Parameters */
.parameter-group {
  margin-bottom: 2rem;
}

.parameter-group h4 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
}

.parameter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

/* Post-Processing */
.capabilities-section {
  margin: 2rem 0;
}

.capabilities-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
}

.capability-checkboxes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 0.75rem;
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: background 0.2s ease;
}

.checkbox-option:hover {
  background: var(--color-background-soft);
}

.checkbox-option input[type='checkbox'] {
  margin: 0;
}

.checkbox-label {
  font-size: 0.9rem;
  color: var(--color-text);
}

.tags-input {
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 0.5rem;
  background: var(--color-background);
  min-height: 3rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-chip {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: #3b82f6;
  color: white;
  border-radius: 1rem;
  font-size: 0.8rem;
}

.tag-remove {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.tag-remove:hover {
  opacity: 1;
}

.tag-input {
  flex: 1;
  border: none;
  background: none;
  outline: none;
  color: var(--color-text);
  min-width: 100px;
}

/* Review Step */
.review-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
}

.preview-card {
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  overflow: hidden;
  background: var(--color-background);
}

.preview-hero {
  position: relative;
  height: 150px;
}

.preview-photo {
  width: 100%;
  height: 100%;
}

.preview-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-placeholder {
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
  font-size: 3rem;
  color: white;
}

.preview-status {
  position: absolute;
  top: 1rem;
  left: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.9);
  color: var(--color-background);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  animation: pulse 2s infinite;
}

.preview-identity {
  padding: 1rem;
}

.preview-identity h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--theme-color);
}

.preview-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.type-badge {
  padding: 0.25rem 0.5rem;
  background: var(--theme-color);
  color: white;
  border-radius: 1rem;
  font-size: 0.7rem;
  font-weight: 600;
}

.location-tag {
  font-size: 0.7rem;
  color: var(--color-text);
  opacity: 0.7;
}

.preview-tags {
  display: flex;
  gap: 0.25rem;
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

.detail-section {
  margin-bottom: 2rem;
}

.detail-section h4 {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
}

.detail-grid {
  display: grid;
  gap: 0.75rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--color-background-soft);
  border-radius: 0.5rem;
}

.detail-label {
  font-size: 0.9rem;
  color: var(--color-text);
  opacity: 0.7;
}

.detail-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
}

/* Actions */
.wizard-actions {
  display: flex;
  align-items: center;
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--color-border);
  background: var(--color-background-soft);
}

.actions-spacer {
  flex: 1;
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
  font-size: 0.9rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-secondary {
  background: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-background-mute);
  transform: translateY(-1px);
}

.btn-success {
  background: #10b981;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-icon {
  font-size: 1rem;
  line-height: 1;
}

/* Responsive Design */
@media (max-width: 768px) {
  .wizard-container {
    width: 95%;
    max-height: 95vh;
    margin: 0;
  }

  .wizard-header {
    padding: 1.5rem 1.5rem 1rem 1.5rem;
  }

  .wizard-title {
    font-size: 1.5rem;
  }

  .progress-container {
    padding: 1rem 1.5rem 1.5rem 1.5rem;
  }

  .step-indicators {
    gap: 0.5rem;
  }

  .step-circle {
    width: 2rem;
    height: 2rem;
    font-size: 0.8rem;
  }

  .step-label {
    font-size: 0.7rem;
  }

  .wizard-content {
    padding: 0 1.5rem;
  }

  .wizard-actions {
    padding: 1rem 1.5rem;
    flex-direction: column;
    gap: 1rem;
  }

  .actions-spacer {
    display: none;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  /* Identity step mobile */
  .identity-form {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .photo-upload-area {
    max-width: 250px;
    margin: 0 auto;
  }

  .type-selector {
    grid-template-columns: repeat(2, 1fr);
  }

  /* Workspace step mobile */
  .workspace-form {
    grid-template-columns: 1fr;
  }

  .workspace-preview {
    order: 1;
  }

  .workspace-inputs {
    order: 2;
  }

  .dimension-inputs {
    grid-template-columns: 1fr;
  }

  .parameter-grid {
    grid-template-columns: 1fr;
  }

  .capability-checkboxes {
    grid-template-columns: 1fr;
  }

  /* Review step mobile */
  .review-content {
    grid-template-columns: 1fr;
  }

  .preview-card {
    margin-bottom: 1rem;
  }
}

@media (max-width: 480px) {
  .wizard-container {
    border-radius: 1rem;
  }

  .step-indicators {
    flex-direction: column;
    gap: 0.75rem;
  }

  .step-indicator {
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
  }

  .step-circle {
    margin-bottom: 0;
  }

  .color-picker {
    justify-content: center;
  }

  .color-option {
    width: 2.5rem;
    height: 2.5rem;
  }

  .type-selector {
    grid-template-columns: 1fr;
  }

  .radio-group {
    flex-direction: column;
    gap: 0.75rem;
  }
}

/* Animation for step transitions */
.step-content {
  opacity: 1;
  transform: translateX(0);
}

.step-content.entering {
  opacity: 0;
  transform: translateX(20px);
}

.step-content.leaving {
  opacity: 0;
  transform: translateX(-20px);
}

/* Focus styles for accessibility */
.btn:focus,
.field-input:focus,
.field-select:focus,
.type-option:focus,
.color-option:focus,
.checkbox-option:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Loading state for create button */
.btn-success.loading {
  position: relative;
  color: transparent;
}

.btn-success.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

/* Pulse animation for status dot */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

/* Enhanced hover effects */
.machine-preview:hover .preview-card {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

/* Validation states */
.field-input.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.field-input.success {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

/* Tooltip styles for help text */
.field-tooltip {
  position: relative;
  display: inline-block;
  margin-left: 0.5rem;
  cursor: help;
}

.field-tooltip::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-background);
  color: var(--color-text);
  padding: 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid var(--color-border);
  font-size: 0.8rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  z-index: 1000;
}

.field-tooltip:hover::after {
  opacity: 1;
}

/* Dark mode considerations */
@media (prefers-color-scheme: dark) {
  .workspace-3d {
    background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  }

  .photo-placeholder {
    background: var(--color-background-mute);
  }

  .preview-status {
    background: rgba(0, 0, 0, 0.8);
    color: white;
  }
}
</style>
