export default class {
  id: number
  header: string
  footer: string
  holePop: string
  pathChange: string

  constructor(id: number, header: string, footer: string, holePop: string, pathChange: string) {
    this.id = id
    this.header = header
    this.footer = footer
    this.holePop = holePop
    this.pathChange = pathChange
  }
}
