import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, model, PaginateModel } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true })
export class News extends Document {
  @Prop({ type: uuidv4, default: uuidv4 })
  _id: string;

  @Prop({ type: Boolean, default: true })
  active: boolean;

  @Prop({ type: String, default: null })
  author: string;

  @Prop({ type: Map, default: {} })
  comments: Map<string, any>;

  @Prop({ type: String, default: null })
  content: string;

  @Prop({ type: String, default: null })
  name: string;

  @Prop({ type: Map, default: {} })
  picture?: Map<string, any>;
}
export const NewsSchema = SchemaFactory.createForClass(News);