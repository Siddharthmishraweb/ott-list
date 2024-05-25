import { Schema, model, Document } from 'mongoose';

interface IEpisode extends Document {
  episodeNumber: number;
  seasonNumber: number;
  releaseDate: Date;
  director: string;
  actors: string[];
}

interface ITVShow extends Document {
  id: string;
  title: string;
  description: string;
  genres: string[];
  episodes: IEpisode[];
}

const episodeSchema = new Schema<IEpisode>({
  episodeNumber: { type: Number, required: true },
  seasonNumber: { type: Number, required: true },
  releaseDate: { type: Date, required: true },
  director: { type: String, required: true },
  actors: { type: [String], required: true }
});

const tvShowSchema = new Schema<ITVShow>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  genres: { type: [String], required: true },
  episodes: { type: [episodeSchema], required: true }
});

const TVShow = model<ITVShow>('TVShow', tvShowSchema);

export default TVShow;
