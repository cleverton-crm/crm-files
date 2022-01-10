import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Core } from 'crm-core';
import { v4 as uuidv4 } from 'uuid';
import { Document, model, PaginateModel } from 'mongoose';

@Schema({ timestamps: true })
export class Clients extends Document {
  @Prop({ type: uuidv4, default: uuidv4 })
  _id: string;

  @Prop({ type: Map, default: null })
  attachments: Map<string, string>;

  @Prop({ type: String, default: null })
  company: string;

  @Prop({ type: String, default: 'client' })
  object: 'client';

  @Prop({ type: String, default: null })
  owner: string;

  @Prop({ type: Boolean, default: true })
  active: boolean;
}

export const ClientSchema = SchemaFactory.createForClass(Clients);
