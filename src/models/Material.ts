export class Material {
  id: number
  name: string
  type: string
  quantity: number

  constructor(id: number, name: string, type: string, quantity: number) {
    this.id = id
    this.name = name
    this.type = type
    this.quantity = quantity
  }

  // Method to describe the material
  describe(): string {
    return `${this.name} is a ${this.type} material with ${this.quantity} units available.`
  }

  // Method to adjust the quantity of material
  adjustQuantity(amount: number): void {
    this.quantity += amount
    console.log(`${this.name} quantity adjusted to ${this.quantity}.`)
  }
}
