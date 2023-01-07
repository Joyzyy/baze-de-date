type TSearch = {
  artists: {
    items: {
      followers: {
        total: number;
      };
      genres: string[];
      id: string;
      name: string;
    }[];
  };
};

type TAlbums = {
  items: {
    id: string;
    name: string;
    release_date: string;
    total_tracks: number;
  }[];
};

type TTracks = {
  items: {
    id: string;
    duration_ms: number;
    name: string;
  }[];
};

type TAudioFeatures = {
  danceability: number;
  energy: number;
  key: number;
  loudness: number;
  mode: number;
  speechiness: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
  tempo: number;
  id: string;
  duration_ms: number;
  time_signature: number;
};

export { TSearch, TAlbums, TTracks, TAudioFeatures };
