import axios from "axios";
import { TSearch, TArtist, TAlbums, TAlbumTracks } from "./types";

// free tier pe rapidapi -> pot face doar 5 requesturi o data xd

const authToken =
  "Bearer BQAaK3qlemJcC4fB23YbIZEsI9nJxU0Y6UMJc6heAnsJ9DcaZlA0nBm44HIiWYmvJgxzjViIzKOqlLGLe7N7vr4KeyiBfAOxvmfCOhYlB4CpWPiTDseejHpOp4qPMoyw1dZb8UvtwVouXDZjqUILvL5X6vReGLk2Xfy86kvAAWIpWW_w4p4T5iOoUiZfdIMs2uM";

const myArtists = [
  "Eminem",
  "Tyler, The Creator",
  "Kendrick Lamar",
  "Drake",
  "Kanye West",
  // "NF",
  // "Logic",
  // "J. Cole",
  // "Travis Scott",
  // "Post Malone",
  // "Lil Uzi Vert",
  // "Lil Wayne",
  // "Lil Baby",
  // "Lil Durk",
  // "Lil Yachty",
  // "Lil Skies",
  // "Lil Mosey",
  // "Lil Tecca",
  // "Lil Keed",
  // "Lil Gotit",
  // "Lil Tracy",
  // "Lil Migo",
  // "Lil Aaron",
  // "Lil Ameer",
  // "Lil A1",
  // "Lil A",
  // "Lil ASAP",
  // "Lil AJ",
  // "Lil AJ Tracey",
];

const myArtistsOfficialLabels = [
  "Shady Records",
  "Odd Future",
  "TDE",
  "OVO",
  "G.O.O.D. Music",
  "NF Real Music",
  "Def Jam Recordings",
  "Dreamville",
  "Cactus Jack Records",
  "Republic Records",
  "Generation Now",
  "Young Money Entertainment",
  "Quality Control Music",
  "Alamo Records",
  "QC The Label",
  "Warner Records",
  "Warner Records",
  "Warner Records",
  "Warner Records",
];

const myArtistsLocation = [
  "Detroit",
  "Los Angeles",
  "Compton",
  "Toronto",
  "Chicago",
  "St. Louis",
  "Philadelphia",
  "New York",
  "Houston",
  "Dallas",
  "Atlanta",
  "Miami",
  "Memphis",
  "New Orleans",
  "Baton Rouge",
  "Birmingham",
  "Jackson",
  "Jacksonville",
  "Tallahassee",
  "Tampa",
  "Orlando",
  "Nashville",
  "Charlotte",
  "Columbus",
  "Indianapolis",
  "Louisville",
];

async function getSpotifyURI() {
  const spotifyURI = new Array();

  for (let i = 0; i < myArtists.length; ++i) {
    await axios
      .get<TSearch>("https://api.spotify.com/v1/search/", {
        headers: {
          Authorization: authToken,
        },
        params: {
          q: myArtists[i],
          type: "artist",
        },
      })
      .then((result) => {
        spotifyURI.push(result.data.artists.items[0].data.uri.slice(15));
      });
  }

  return spotifyURI;
}

async function getArtistData(artistSpotifyURI: string[]) {
  let artistData: { genres: string[]; followers: { total: number } }[] =
    new Array();

  const request = artistSpotifyURI.map((vals) => {
    return axios
      .get<TArtist>("https://spotify23.p.rapidapi.com/artists/", {
        headers: {
          "X-RapidAPI-Key":
            "e5a5a7368emsh9212ece2892093ap171f1cjsn622bddba00e6",
          "X-RapidAPI-Host": "spotify23.p.rapidapi.com",
        },
        params: {
          ids: vals,
        },
      })
      .then((result) => {
        result.data.artists.map((dataArtistsVals) => {
          artistData.push({
            genres: dataArtistsVals.genres,
            followers: { total: dataArtistsVals.followers.total },
          });
        });
      });
  });

  await Promise.all(request);

  return artistData;
}

async function getArtistAlbums(spotifyURI: string[]) {
  const artist: { name: string; albums: { id: string; name: string }[] }[] = [];
  let artistAlbums: { id: string; name: string }[] = new Array();
  let iterator: number = 0;

  const request = spotifyURI.map((vals) => {
    return axios
      .get<TAlbums>("https://spotify23.p.rapidapi.com/artist_albums/", {
        headers: {
          "X-RapidAPI-Key":
            "e5a5a7368emsh9212ece2892093ap171f1cjsn622bddba00e6",
          "X-RapidAPI-Host": "spotify23.p.rapidapi.com",
        },
        params: {
          id: vals,
        },
      })
      .then((res) => {
        const albumItems = res.data.data.artist.discography.albums.items;
        albumItems.map((vals) => {
          vals.releases.items.map((tracks) => {
            artistAlbums.push({ id: tracks.id, name: tracks.name });
          });
        });
        artistAlbums = artistAlbums.filter(
          (v, i, a) => a.findIndex((t) => t.name === v.name) === i
        );
        artist.push({ name: myArtists[iterator++], albums: artistAlbums });
        artistAlbums = [];
      });
  });

  await Promise.all(request);

  return artist;
}

async function getAlbumTrackList(albumId: string) {
  let data: any = [];
  await axios
    .get<TAlbumTracks>("https://spotify23.p.rapidapi.com/album_tracks/", {
      headers: {
        "X-RapidAPI-Key": "e5a5a7368emsh9212ece2892093ap171f1cjsn622bddba00e6",
        "X-RapidAPI-Host": "spotify23.p.rapidapi.com",
      },
      params: {
        id: albumId,
      },
    })
    .then((res) => {
      data = res.data.data.album.tracks.items;
    });
  return data;
}

async function insertArtistData() {
  const spotifyURI = await getSpotifyURI();
  const artistData = await getArtistData(spotifyURI);

  const artistGenres: string[] = [];

  artistData.map((vals) => {
    let genre: string = "";
    vals.genres.map((genresVals) => {
      genre += genresVals + ", ";
    });
    artistGenres.push(genre);
    genre = "";
  });

  artistData.map((vals, idx) => {
    console.log(
      "INSERT INTO ARTISTS VALUES (",
      spotifyURI[idx],
      ", ",
      myArtists[idx],
      ", ",
      artistGenres[idx],
      vals.followers.total,
      ", ",
      myArtistsLocation[idx],
      ", ",
      myArtistsOfficialLabels[idx],
      ");"
    );
  });
}

(async () => {
  //await insertArtistData();
  const spotifyURI = await getSpotifyURI();
  console.log(spotifyURI);

  // const artistAlbum = await getArtistAlbums(spotifyURI);
  // const artistAlbumUnique: {
  //   name: string;
  //   albums: { id: string; name: string }[];
  // }[] = [];
  // artistAlbum.map((vals) => {
  //   artistAlbumUnique.push({
  //     name: vals.name,
  //     albums: vals.albums,
  //   });
  // });

  // artistAlbumUnique.map((vals) => {
  //   vals.albums.map((albums) => {
  //     console.log("Artist: " + vals.name + " Album: " + albums.name);
  //   });
  // });

  // INSERT INTO ARTISTS VALUES (_id, vals.name, vals.genre, birth_date -> followers, vals.location, vals.id_label)

  // INSERT INTO ALBUMS VALUES (_id, vals.name, albums, )
  //   artistAlbumUnique.map((vals) => {
  //     vals.albums.map((albums) => {
  //       console.log(albums);
  //     });
  //   });
})();
