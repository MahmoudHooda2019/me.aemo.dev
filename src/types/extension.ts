export interface Extension {
  id: string
  title: string
  subtitle: string
  price: string
  filters?: string[]
  tags?: string[]
  lastUpdated: string
}

export interface ExtensionsAPI {
  loadExtensions(): Promise<Extension[]>
  setExtensions(data: Extension[]): void
  getAllExtensions(): Extension[]
  getExtensionsByFilter(filter: string): Extension[]
  getExtensionById(id: string): Promise<Extension | undefined>
}
