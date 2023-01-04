type TSearch = {
  artists: {
    items: Array<{
      data: {
        uri: string;
        profile: {
          name: string;
        };
      };
    }>;
  };
};

type TArtist = {
  artists: Array<{
    followers: {
      total: number;
    };
    genres: Array<string>;
  }>;
};

type TAlbums = {
  data: {
    artist: {
      discography: {
        albums: {
          items: Array<{
            releases: {
              items: Array<{
                id: string;
                name: string;
                uri: string;
                date: {
                  isoString: string;
                };
              }>;
            };
          }>;
        };
      };
    };
  };
};

type TAlbumTracks = {
  data: {
    album: {
      tracks: {
        items: Array<{
          track: Array<{
            name: string;
          }>;
        }>;
      };
    };
  };
};

export { TSearch, TArtist, TAlbums, TAlbumTracks };
