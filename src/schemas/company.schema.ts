import { Document } from 'mongoose';
import { Core } from 'crm-core';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true })
export class Companies extends Document implements Core.Company.Schema {
  @Prop({ type: uuidv4, default: uuidv4 })
  _id: string;
  @Prop({ type: String, default: null })
  name: string;

  @Prop({ type: Boolean, default: true })
  active: boolean;

  @Prop({ type: String, default: 'company' })
  object: string | 'company';

  @Prop({ type: String, default: null })
  owner: string;

  @Prop({ type: String, default: null })
  ownership: string | Core.Company.Ownership;

  @Prop({ type: Map, default: null })
  permissions: Map<string, any>;

  @Prop({ type: String, default: null })
  source: string;

  @Prop({ type: Array, default: [] })
  tags: Array<string>;

  @Prop({ type: Array, default: [] })
  clients: Array<string>;

  @Prop({ type: Map, default: {} })
  avatar: Map<string, any>;

  bank: Core.Company.Bank | null;

  holding: Record<string, any>;

  park: Record<string, any>;

  partner: Record<string, any>;
}

export const CompanySchema = SchemaFactory.createForClass(Companies);
