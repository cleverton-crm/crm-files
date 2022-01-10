import { Document } from 'mongoose';
import { Core } from 'crm-core';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true })
export class Companies extends Document {
  @Prop({ type: uuidv4, default: uuidv4 })
  _id: string;
  @Prop({ type: String, default: null })
  name: string;
  @Prop({ type: Boolean, default: 'active' })
  active: boolean;
  @Prop({ type: String, default: 'company' })
  object: string | 'company';

  @Prop({ type: String, default: null })
  owner: string;
  @Prop({ type: String, default: null })
  ownership: string | Core.Company.Ownership;
  @Prop({ type: String, default: null })
  permissions: string;
  @Prop({ type: String, default: null })
  source: string;
  @Prop({ type: Array, default: [] })
  tags: Array<string>;
  @Prop({ type: Array, default: [] })
  clients: Array<string>;
}

export const CompanySchema = SchemaFactory.createForClass(Companies);
