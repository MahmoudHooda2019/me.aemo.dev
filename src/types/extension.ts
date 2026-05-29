export interface Extension {
  id: string
  title: string
  subtitle: string
  description?: string
  price: string
  filters?: string[]
  tags?: string[]
  lastUpdated: string
  version?: string
  url?: string
  source_code_url?: string
  lib_used_url?: string
  doc?: string
  icon?: string
  downloads?: number
  rating?: number
  author?: string
  [key: string]: unknown
}

export interface ExtensionsAPI {
  loadExtensions(): Promise<Extension[]>
  setExtensions(data: Extension[]): void
  getAllExtensions(): Extension[]
  getExtensionsByFilter(filter: string): Extension[]
  getExtensionById(id: string): Promise<Extension | undefined>
}
