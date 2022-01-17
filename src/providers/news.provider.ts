import { News, NewsSchema } from '../schemas/news.schema';

export const NewsProviderSchema = {
  name: News.name,
  useFactory: () => {
    return NewsSchema
  }
}