import { Permissions } from '../../mod.ts'
import { Client } from '../models/client.ts'
import { Guild } from '../structures/guild.ts'
import { Role } from '../structures/role.ts'
import { GUILD_ROLE, GUILD_ROLES } from '../types/endpoint.ts'
import { RolePayload } from '../types/role.ts'
import { BaseManager } from './base.ts'

export interface CreateGuildRoleOptions {
  name?: string
  permissions?: number | string | Permissions
  color?: number | string
  hoist?: boolean
  mentionable?: boolean
}

export class RolesManager extends BaseManager<RolePayload, Role> {
  guild: Guild

  constructor(client: Client, guild: Guild) {
    super(client, `roles:${guild.id}`, Role)
    this.guild = guild
  }

  /** Fetch a Guild Role (from API) */
  async fetch(id: string): Promise<Role> {
    return await new Promise((resolve, reject) => {
      this.client.rest
        .get(GUILD_ROLE(this.guild.id, id))
        .then(async (data) => {
          await this.set(id, data as RolePayload)
          resolve(((await this.get(id)) as unknown) as Role)
        })
        .catch((e) => reject(e))
    })
  }

  async fromPayload(roles: RolePayload[]): Promise<boolean> {
    for (const role of roles) {
      await this.set(role.id, role)
    }
    return true
  }

  /** Create a Guild Role */
  async create(data?: CreateGuildRoleOptions): Promise<Role> {
    if (typeof data?.color === 'string') {
      if (data.color.startsWith('#')) data.color = data.color.slice(1)
    }

    const roleRaw = ((await this.client.rest.post(GUILD_ROLES(this.guild.id), {
      name: data?.name,
      permissions:
        data?.permissions === undefined
          ? undefined
          : (typeof data.permissions === 'object'
              ? data.permissions.bitfield
              : data.permissions
            ).toString(),
      color:
        data?.color === undefined
          ? undefined
          : typeof data.color === 'string'
          ? isNaN(parseInt(data.color, 16))
            ? 0
            : parseInt(data.color, 16)
          : data.color,
      hoist: data?.hoist ?? false,
      mentionable: data?.mentionable ?? false
    })) as unknown) as RolePayload

    await this.set(roleRaw.id, roleRaw)
    return ((await this.get(roleRaw.id)) as unknown) as Role
  }

  /** Delete a Guild Role */
  async delete(role: Role | string): Promise<boolean> {
    await this.client.rest.delete(
      GUILD_ROLE(this.guild.id, typeof role === 'object' ? role.id : role)
    )
    return true
  }
}
