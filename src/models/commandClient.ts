import { Embed, Message } from '../../mod.ts'
import { Client, ClientOptions } from './client.ts'
import { CommandContext, CommandsManager, parseCommand } from './command.ts'

type PrefixReturnType = string | string[] | Promise<string | string[]>

export interface CommandClientOptions extends ClientOptions {
  prefix: string | string[]
  mentionPrefix?: boolean
  getGuildPrefix?: (guildID: string) => PrefixReturnType
  getUserPrefix?: (userID: string) => PrefixReturnType
  spacesAfterPrefix?: boolean
  betterArgs?: boolean
  owners?: string[]
  allowBots?: boolean
  allowDMs?: boolean
  caseSensitive?: boolean
}

type CommandText = string | Embed

export interface CommandTexts {
  GUILD_ONLY?: CommandText
  OWNER_ONLY?: CommandText
  DMS_ONLY?: CommandText
  ERROR?: CommandText
}

export const DefaultCommandTexts: CommandTexts = {
  GUILD_ONLY: 'This command can only be used in a Server!',
  OWNER_ONLY: 'This command can only be used by Bot Owners!',
  DMS_ONLY: "This command can only be used in Bot's DMs!",
  ERROR: 'An error occured while executing command!'
}

interface Replaces {
  [name: string]: string
}

export const massReplace = (text: string, replaces: Replaces): string => {
  Object.entries(replaces).forEach(replace => {
    text = text.replace(new RegExp(`{{${replace[0]}}}`, 'g'), replace[1])
  })
  return text
}

export class CommandClient extends Client implements CommandClientOptions {
  prefix: string | string[]
  mentionPrefix: boolean
  getGuildPrefix: (guildID: string) => PrefixReturnType
  getUserPrefix: (userID: string) => PrefixReturnType
  spacesAfterPrefix: boolean
  betterArgs: boolean
  owners: string[]
  allowBots: boolean
  allowDMs: boolean
  caseSensitive: boolean
  commands: CommandsManager = new CommandsManager(this)
  texts: CommandTexts = DefaultCommandTexts

  constructor (options: CommandClientOptions) {
    super(options)
    this.prefix = options.prefix
    this.mentionPrefix =
      options.mentionPrefix === undefined ? false : options.mentionPrefix
    this.getGuildPrefix =
      options.getGuildPrefix === undefined
        ? (id: string) => this.prefix
        : options.getGuildPrefix
    this.getUserPrefix =
      options.getUserPrefix === undefined
        ? (id: string) => this.prefix
        : options.getUserPrefix
    this.spacesAfterPrefix =
      options.spacesAfterPrefix === undefined
        ? false
        : options.spacesAfterPrefix
    this.betterArgs =
      options.betterArgs === undefined ? false : options.betterArgs
    this.owners = options.owners === undefined ? [] : options.owners
    this.allowBots = options.allowBots === undefined ? false : options.allowBots
    this.allowDMs = options.allowDMs === undefined ? true : options.allowDMs
    this.caseSensitive =
      options.caseSensitive === undefined ? false : options.caseSensitive

    this.on(
      'messageCreate',
      async (msg: Message) => await this.processMessage(msg)
    )
  }

  async processMessage (msg: Message): Promise<any> {
    if (!this.allowBots && msg.author.bot === true) return

    let prefix: string | string[] = this.prefix

    if (msg.guild !== undefined) {
      let guildPrefix = this.getGuildPrefix(msg.guild.id)
      if (guildPrefix instanceof Promise) guildPrefix = await guildPrefix
      prefix = guildPrefix
    } else {
      let userPrefix = this.getUserPrefix(msg.author.id)
      if (userPrefix instanceof Promise) userPrefix = await userPrefix
      prefix = userPrefix
    }

    if (typeof prefix === 'string') {
      if (msg.content.startsWith(prefix) === false) return
    } else {
      const usedPrefix = prefix.find(v => msg.content.startsWith(v))
      if (usedPrefix === undefined) return
      else prefix = usedPrefix
    }

    const parsed = parseCommand(this, msg, prefix)
    const command = this.commands.find(parsed.name)

    if (command === undefined) return

    const baseReplaces: Replaces = {
      command: command.name,
      nameUsed: parsed.name,
      prefix,
      username: msg.author.username,
      tag: msg.author.tag,
      mention: msg.author.mention,
      id: msg.author.id
    }

    if (command.guildOnly === true && msg.guild === undefined) {
      if (this.texts.GUILD_ONLY !== undefined)
        return this.sendProcessedText(msg, this.texts.GUILD_ONLY, baseReplaces)
      return
    }
    if (command.dmOnly === true && msg.guild !== undefined) {
      if (this.texts.DMS_ONLY !== undefined)
        return this.sendProcessedText(msg, this.texts.DMS_ONLY, baseReplaces)
      return
    }
    if (command.ownerOnly === true && !this.owners.includes(msg.author.id)) {
      if (this.texts.OWNER_ONLY !== undefined)
        return this.sendProcessedText(msg, this.texts.OWNER_ONLY, baseReplaces)
      return
    }

    const ctx: CommandContext = {
      client: this,
      name: parsed.name,
      prefix,
      args: parsed.args,
      argString: parsed.argString,
      message: msg,
      author: msg.author,
      command,
      channel: msg.channel,
      guild: msg.guild
    }

    try {
      this.emit('commandUsed', { context: ctx })
      command.execute(ctx)
    } catch (e) {
      if (this.texts.ERROR !== undefined)
        return this.sendProcessedText(
          msg,
          this.texts.ERROR,
          Object.assign(baseReplaces, { error: e.message })
        )
      this.emit('commandError', { command, parsed, error: e })
    }
  }

  sendProcessedText (msg: Message, text: CommandText, replaces: Replaces): any {
    if (typeof text === 'string') {
      text = massReplace(text, replaces)
      return msg.channel.send(text)
    } else {
      if (text.description !== undefined)
        text.description = massReplace(text.description, replaces)
      if (text.title !== undefined)
        text.description = massReplace(text.title, replaces)
      if (text.author?.name !== undefined)
        text.description = massReplace(text.author.name, replaces)
      if (text.footer?.text !== undefined)
        text.description = massReplace(text.footer.text, replaces)
      return msg.channel.send(text)
    }
  }
}
