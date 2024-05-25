import { Schema, model, Document } from 'mongoose';

interface IMovie extends Document {
  id: string;
  title: string;
  description: string;
  genres: string[];
  releaseDate: Date;
  director: string;
  actors: string[];
}

const movieSchema = new Schema<IMovie>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  genres: { type: [String], required: true },
  releaseDate: { type: Date, required: true },
  director: { type: String, required: true },
  actors: { type: [String], required: true }
});

const Movie = model<IMovie>('Movie', movieSchema);

export default Movie;
