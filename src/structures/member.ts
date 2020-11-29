import { MemberRolesManager } from "../managers/memberRoles.ts"
import { Client } from '../models/client.ts'
import { MemberPayload } from '../types/guild.ts'
import { Permissions } from "../utils/permissions.ts"
import { Base } from './base.ts'
import { Guild } from "./guild.ts"
import { User } from './user.ts'

export class Member extends Base {
  id: string
  user: User
  nick?: string
  roles: MemberRolesManager
  joinedAt: string
  premiumSince?: string
  deaf: boolean
  mute: boolean
  guild: Guild
  permissions: Permissions

  constructor (client: Client, data: MemberPayload, user: User, guild: Guild, perms?: Permissions) {
    super(client)
    this.id = data.user.id
    this.user = user
    this.nick = data.nick
    this.guild = guild
    this.roles = new MemberRolesManager(this.client, this.guild.roles, this)
    this.joinedAt = data.joined_at
    this.premiumSince = data.premium_since
    this.deaf = data.deaf
    this.mute = data.mute
    if (perms !== undefined) this.permissions = perms
    else this.permissions = new Permissions(Permissions.DEFAULT)
  }

  protected readFromData (data: MemberPayload): void {
    super.readFromData(data.user)
    this.nick = data.nick ?? this.nick
    this.joinedAt = data.joined_at ?? this.joinedAt
    this.premiumSince = data.premium_since ?? this.premiumSince
    this.deaf = data.deaf ?? this.deaf
    this.mute = data.mute ?? this.mute
  }
}
