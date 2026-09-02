import type { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
// Additional shared types will be added here as we generate the full database types
