export interface Tool {
  id: string
  title: string
  subtitle: string
  description: string
  icon: string
  url: string
  features: string[]
  category: ToolCategory
  difficulty: ToolDifficulty
  tags: string[]
  comingSoon?: boolean
}

export enum ToolCategory {
  ENCODING = 'encoding',
  URL = 'url',
  DEVELOPMENT = 'development',
  UTILITY = 'utility',
  SECURITY = 'security'
}

export enum ToolDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

export interface DeepLinkData {
  scheme: string
  host?: string
  path?: string
  params?: Record<string, string>
}

export interface ParsedDeepLink {
  scheme: string
  host?: string
  port?: string
  path: string
  params: Record<string, string>
}

export interface Base64Operation {
  operation: 'encode' | 'decode'
  input: string
  output: string
  timestamp: Date
  inputType: 'text' | 'file'
}

export interface ToolError {
  code: string
  message: string
  details?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ToolError[]
}

export interface ToolHistory {
  id: string
  toolId: string
  operation: string
  input: string
  output: string
  timestamp: Date
}
