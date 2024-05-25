import { Schema, model, Document } from 'mongoose';

interface IWatchHistory {
  contentId: string;
  watchedOn: Date;
  rating?: number;
}

interface IUser extends Document {
  id: string;
  username: string;
  preferences: {
    favoriteGenres: string[];
    dislikedGenres: string[];
  };
  watchHistory: IWatchHistory[];
}

const userSchema = new Schema<IUser>({
  id: { type: String, required: true },
  username: { type: String, required: true },
  preferences: {
    favoriteGenres: { type: [String], required: true },
    dislikedGenres: { type: [String], required: true }
  },
  watchHistory: [
    {
      contentId: { type: String, required: true },
      watchedOn: { type: Date, required: true },
      rating: Number
    }
  ]
});

const User = model<IUser>('User', userSchema);

export default User;
