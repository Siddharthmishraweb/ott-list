import mongoose from 'mongoose';
import User from '../src/models/user';
import Movie from '../src/models/movie';
import TVShow from '../src/models/tvShow';
import dbConnect from '../src/utils/dbConnect';


const seedData = async () => {
  await dbConnect();

  await User.create([
    {
      id: '1',
      username: 'user1',
      preferences: {
        favoriteGenres: ['Action', 'Comedy'],
        dislikedGenres: ['Horror']
      },
      watchHistory: []
    }
  ]);

  await Movie.create([
    {
      id: 'm1',
      title: 'Movie 1',
      description: 'Description 1',
      genres: ['Action'],
      releaseDate: new Date(),
      director: 'Director 1',
      actors: ['Actor 1']
    }
  ]);

  await TVShow.create([
    {
      id: 't1',
      title: 'TV Show 1',
      description: 'Description 1',
      genres: ['Drama'],
      episodes: [
        {
          episodeNumber: 1,
          seasonNumber: 1,
          releaseDate: new Date(),
          director: 'Director 1',
          actors: ['Actor 1']
        }
      ]
    }
  ]);

  console.log('Data seeded');
  mongoose.connection.close();
};

seedData();
