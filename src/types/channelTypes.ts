export interface Channel {
    id: string
    type: number
    guild_id?: string
    position?: number
    approximate_member_count?: Overwrite
    name?: string
    topic?: string | undefined
    nsfw?: boolean
    last_message_id?: string
    bitrate?: number
    user_limit?: number
    rate_limit_per_user?: number
    recipients?: User
    icon?: string | undefined
    owner_id?: string
    application_id?: string
    parent_id?: string | undefined 
    last_pin_timestamp?: string
}

interface Overwrite {
    id: string
    type: number
    allow: string
    deny: string
}

enum ChannelTypes {
    GUILD_TEXT = 0,
    DM = 1,
    GUILD_VOICE = 2,
    GROUP_DM = 3,
    GUILD_CATEGORY = 4,
    GUILD_NEWS = 5,
    GUILD_STORE = 6
}

interface Message {
    id: string
    channel_id: string
    guild_id?: string
    suthor: User
    member?: GuildMember
    content: string
    timestamp: string
    edited_timestamp: string | undefined
    tts: boolean
    mention_everyone: boolean
    mentions: User[] 
    mention_roles: Role[]
    mention_channels?: ChannelMention[] 
    attachments: Attachment[]
    embeds: Embed[]
    reactions?: Reaction[]
    nonce?: number | string
    pinned: boolean
    webhook_id?: string
    type: number
    activity?: MessageActivity
    application?: MessageApplication 
    message_reference?: MessageReference 
    flags?: number
}

interface ChannelMention {
    id: string
    guild_id: string
    type: ChannelTypes
    name: string
}

interface Attachment {
    id: string
    filename: string
    size: number
    url: string
    proxy_url: string
    height: number | undefined
    width: number | undefined
}

interface Embed {
    title?: string
    type?: EmbedTypes
    description?: string
    url?: string
    timestamp?: string
    color?: number
    footer?: EmbedFooter
    image?: EmbedImage
    thumbnail?:	EmbedThumbnail
    video?: EmbedVideo
    provider?: EmbedProvider
    author?: EmbedAuthor 
    fields?: EmbedField[] 
}

type EmbedTypes = 
 | "rich"
 | "image"
 | "video"
 | "gifv"
 | "article"
 | "link"

interface EmbedField {
    name: string
    value: string
    inline?: boolean
}

interface EmbedAuthor {
    name?: string
    url?: string
    icon_url?: string
    proxy_icon_url?: string
}

interface EmbedFooter {
    text: string
    icon_url?: string
    proxy_icon_url?: string
}

interface EmbedImage {
    url?: string
    proxy_url?: string
    height?: number
    width?: number
}

interface EmbedProvider {
    name?: string
    url?: string
}

interface EmbedVideo {
    url?: string
    height?: number
    width?: number
}

interface EmbedThumbnail {
    url?: string
    proxy_url?: string
    height?: number
    width?: number
}

interface Reaction {
    count: number
    me: boolean
    emoji: Emoji
}

interface MessageActivity {
    type: MessageTypes
    party_id?: string
}

interface MessageApplication {
    id: string
    cover_image?: string
    desription: string
    icon: string | undefined
    name: string
}

interface MessageReference {
    message_id?: string
    channel_id?: string
    guild_id?: string
}

enum MessageTypes {
    DEFAULT = 0,
    RECIPIENT_ADD = 1,
    RECIPIENT_REMOVE = 2,
    CALL = 3,
    CHANNEL_NAME_CHANGE = 4,
    CHANNEL_ICON_CHANGE = 5,
    CHANNEL_PINNED_MESSAGE = 6,
    GUILD_MEMBER_JOIN = 7,
    USER_PREMIUM_GUILD_SUBSCRIPTION = 8,
    USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1 = 9,
    USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2 = 10,
    USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3 = 11,
    CHANNEL_FOLLOW_ADD = 12,
    GUILD_DISCOVERY_DISQUALIFIED = 14,
    GUILD_DISCOVERY_REQUALIFIED = 15
}

enum MessageActivityTypes {
    JOIN = 1,
    SPECTATE = 2,
    LISTEN = 3,
    JOIN_REQUEST = 4
}

enum MessageFlags {
    CROSSPOSTED = 1 << 0,
    IS_CROSSPOST = 1 << 1,
    SUPPRESS_EMBEDS = 1 << 2,
    SOURCE_MESSAGE_DELETED = 1 << 3,
    URGENT = 1 << 4
}

interface FollowedChannel {
    channel_id: string,
    webhook_id: string
}

interface Reaction {
    count: number,
    me: boolean
    emoji: Emoji
}

interface Overwrite {
    id: string,
    type: number 
    allow: string
    deny: string
}
interface ChannelMention {
    id: string
    guild_id: string
    type: ChannelTypes
    name: string
}