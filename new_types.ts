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

export { TSearch, TAlbums };
