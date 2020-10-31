import { GuildPayload } from './guild.ts'
import { UserPayload } from './user.ts'

export interface TemplatePayload {
  code: string
  name: string
  description: string | undefined
  usage_count: number
  creator_id: string
  creator: UserPayload
  created_at: string
  updated_at: string
  source_guild_id: string
  serialized_source_guild: GuildPayload
  is_dirty: boolean | undefined
}
