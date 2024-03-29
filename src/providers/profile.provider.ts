import { ProfileSchema } from '../schemas/profile.schema';

export const ProfileProvider = {
  name: 'Profile',
  useFactory: () => {
    ProfileSchema.set('toJSON', { virtuals: true });
    ProfileSchema.set('toObject', { virtuals: true });

    return ProfileSchema;
  },
};
