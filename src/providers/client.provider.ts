import { Core } from 'crm-core';
import { ClientSchema, Clients } from '../schemas/client.schema';

export const ClientsProviderSchema = {
  name: Clients.name,
  useFactory: () => {
    return ClientSchema;
  },
};
