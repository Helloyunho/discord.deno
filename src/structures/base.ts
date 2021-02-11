import { Client } from '../models/client.ts'
import { Snowflake } from '../utils/snowflake.ts'

export class Base {
  client: Client

  constructor(client: Client, _data?: any) {
    this.client = client
  }
}

export class SnowflakeBase extends Base {
  id!: string

  /** Get Snowflake Object */
  get snowflake(): Snowflake {
    return new Snowflake(this.id)
  }

  /** Timestamp of when resource was created */
  get timestamp(): Date {
    return new Date(this.snowflake.timestamp)
  }
}
