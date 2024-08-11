<template>
  <div class="machine-form">
    <div class="form-header">
      <h1>Machines</h1>
      <button @click="addMachine">Add Machine</button>
    </div>
    <div class="machine-list">
      <ul>
        <li v-for="machine in machines" :key="machine.id">
          <div>
            <button @click="editMachine(machine)">Edit</button>
            <p>{{ machine.name }}</p>
          </div>
          <div>
            <p>{{ machine.status }}</p>
            <svg ref="svg" width="25" height="25" v-if="machine.status == 'Running'">
              <circle cx="12.5" cy="12.5" r="5" stroke="black" stroke-width="3" fill="red" />
            </svg>
            <svg ref="svg" width="25" height="25" v-if="machine.status == 'Idle'">
              <circle cx="12.5" cy="12.5" r="5" stroke="black" stroke-width="3" fill="yellow" />
            </svg>
            <svg ref="svg" width="25" height="25" v-if="machine.status == 'Waiting'">
              <circle cx="12.5" cy="12.5" r="5" stroke="black" stroke-width="3" fill="green" />
            </svg>
          </div>
        </li>
      </ul>
    </div>
    <div v-if="selectedMachine" class="machine-configure-form">
      <h2>{{ isEditing ? 'Edit' : 'Add' }} Machine</h2>
      <form @submit.prevent="saveMachine">
        <div>
          <label for="id">ID:</label>
          <input v-model="selectedMachine.id" id="id" type="text" disabled />
        </div>
        <div>
          <label for="name">Name:</label>
          <input v-model="selectedMachine.name" id="name" type="text" />
        </div>
        <div>
          <label for="status">Status:</label>
          <select v-model="selectedMachine.status" id="status">
            <option value="Running">Running</option>
            <option value="Idle">Idle</option>
            <option value="Waiting">Waiting</option>
          </select>
        </div>
        <div>
          <label for="type">Type:</label>
          <input v-model="selectedMachine.type" id="type" type="text" />
        </div>
        <div>
          <label for="kinematics">Kinematics:</label>
          <input v-model="selectedMachine.kinematics" id="kinematics" type="text" />
        </div>
        <div>
          <label for="xMaxTravel">X Travel:</label>
          <input v-model="selectedMachine.xMaxTravel" id="xMaxTravel" type="text" />
        </div>
        <div>
          <label for="yMaxTravel">Y Travel:</label>
          <input v-model="selectedMachine.yMaxTravel" id="yMaxTravel" type="text" />
        </div>
        <div>
          <label for="maxWorkPieceX">Max Work Piece X:</label>
          <input v-model="selectedMachine.maxWorkPieceX" id="maxWorkPieceX" type="text" />
        </div>
        <div>
          <label for="maxWorkPieceY">Max Work Piece Y:</label>
          <input v-model="selectedMachine.maxWorkPieceY" id="maxWorkPieceY" type="text" />
        </div>
        <div>
          <label for="maxWorkPieceZ">Max Work Piece Z:</label>
          <input v-model="selectedMachine.maxWorkPieceZ" id="maxWorkPieceZ" type="text" />
        </div>
        <div>
          <label for="workHoldingSystem">Work Holding System:</label>
          <input v-model="selectedMachine.workHoldingSystem" id="workHoldingSystem" type="text" />
        </div>
        <div>
          <label for="wireDiamter">Wire Diameter:</label>
          <input v-model="selectedMachine.wireDiameter" id="wireDiameter" type="text" />
        </div>
        <div>
          <label for="wireTension">Wire Tension:</label>
          <input v-model="selectedMachine.wireTension" id="wireTension" type="text" />
        </div>
        <div>
          <label for="maxWireSpeed">Max Wire Speed:</label>
          <input v-model="selectedMachine.maxWireSpeed" id="maxWireSpeed" type="text" />
        </div>
        <div>
          <label for="maxWireTension">Max Wire Tension:</label>
          <input v-model="selectedMachine.maxWireTension" id="maxWireTension" type="text" />
        </div>
        <div>
          <label for="cutKerfRadius">Cut Kerf Radius:</label>
          <input v-model="selectedMachine.cutKerfRadius" id="cutKerfRadius" type="text" />
        </div>
        <div>
          <label for="postProcessor">Post Processor:</label>
          <input v-model="selectedMachine.postProcessor" id="postProcessor" type="text" />
        </div>
        <div class="form-actions">
          <button type="submit">{{ isEditing ? 'Save' : 'Add' }} Machine</button>
          <button @click="cancelEdit">Cancel</button>
          <button v-if="isEditing" @click="deleteMachine">Delete</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import MachineService from '../services/MachineService'
import Machine from '../models/Machine'
const machineService = new MachineService()

export default defineComponent({
  setup() {
    const machines = ref<Machine[]>([])
    const selectedMachine = ref<Machine | null>(null)
    const isEditing = ref(false)

    const fetchMachines = async () => {
      try {
        machines.value = await machineService.fetchAllMachines()
      } catch (error) {
        console.error('Failed to fetch machines:', error)
      }
    }

    const editMachine = (machine: Machine) => {
      selectedMachine.value = { ...machine }
      isEditing.value = true
    }

    const addMachine = () => {
      selectedMachine.value = {
        id: machines.value.length + 1, // This is just a placeholder ID; adjust it to match your backend logic
        name: '',
        status: 'Stopped',
        type: ''
      } as Machine
      isEditing.value = false
    }

    const saveMachine = async () => {
      if (selectedMachine.value) {
        try {
          if (isEditing.value) {
            await machineService.configureMachine(selectedMachine.value.id, selectedMachine.value)
          } else {
            await machineService.addMachine(selectedMachine.value)
          }
          await fetchMachines() // Refresh the list after saving
          selectedMachine.value = null // Clear the form
        } catch (error) {
          // error.propertyName will be the name of the property that failed validation
          // Highlight problematic field in the form
          document.getElementById(error.propertyName)?.focus()
          alert('Failed to save machine: ' + error.message)
        }
      }
    }

    const deleteMachine = async () => {
      if (selectedMachine.value && isEditing.value) {
        try {
          await machineService.removeMachine(selectedMachine.value.id)
          await fetchMachines() // Refresh the list after deletion
          selectedMachine.value = null // Clear the form
        } catch (error) {
          alert('Failed to delete machine: ' + error.message)
        }
      }
    }

    const cancelEdit = () => {
      selectedMachine.value = null
    }

    onMounted(fetchMachines)

    return {
      machines,
      selectedMachine,
      isEditing,
      editMachine,
      addMachine,
      saveMachine,
      deleteMachine,
      cancelEdit
    }
  }
})
</script>

<style scoped>
.machine-form {
  margin-top: 2rem;
  background: #000000;
  width: 400px;
  border-radius: 4px;
}
.form-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background: orange;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}
.form-header button {
  margin-right: 1rem;
  padding: 0.5rem 1rem;
  font-size: 16px;
  border: 1px solid var(--color-border);
  background-color: var(--color-background);
  color: white;
}
.form-header h1 {
  margin-left: 1rem;
  color: white;
}
.machine-list ul {
  list-style-type: none;
  padding: 0;
}
.machine-list li {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--color-border);
}
.machine-list li div {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.machine-list li button {
  padding: 0.5rem 1rem;
  font-size: 14px;
  border: 1px solid var(--color-border);
  background-color: var(--color-background);
  color: white;
  margin-right: 1rem;
}
.machine-list li button:hover {
  background-color: var(--color-background-hover);
}
.machine-list li svg {
  margin-left: 1rem;
}
.machine-configure-form {
  display: flex;
  flex-direction: column;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}
.machine-configure-form h2 {
  display: flex;
  justify-content: center;
  color: white;
  background: orange;
  margin-bottom: 0.5rem;
}
.machine-configure-form form {
  display: flex;
  flex-direction: column;
}
.machine-configure-form form div {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.machine-configure-form form div label {
  margin-left: 1rem;
  font-size: 16px;
}
.machine-configure-form form div input,
.machine-configure-form form div select {
  font-size: 16px;
  border: 1px solid var(--color-border);
  margin-left: auto;
  margin-right: 1rem;
}
.machine-configure-form form .form-actions {
  margin-top: 1rem;
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 1rem;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  background: orange;
  padding: 0.25rem 0;
}
.machine-configure-form form .form-actions button {
  padding: 0.5rem 1rem;
  font-size: 16px;
  border: 1px solid var(--color-border);
  background-color: var(--color-background);
  color: white;
}
</style>
