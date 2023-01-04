import axios from "axios";
import { TSearch, TAlbums } from "./new_types";
import { authToken, myArtistData } from "./constants";

async function getArtist() {
  let data: {
    id: string;
    name: string;
    genres: string;
    followers: number;
  }[] = [];

  const request = myArtistData.map((artist) => {
    return axios
      .get<TSearch>("https://api.spotify.com/v1/search/", {
        headers: {
          Authorization: authToken,
        },
        params: {
          q: artist.name,
          type: "artist",
        },
      })
      .then((result) => {
        data.push({
          id: result.data.artists.items[0].id,
          name: result.data.artists.items[0].name,
          genres: result.data.artists.items[0].genres.join(" / "),
          followers: result.data.artists.items[0].followers.total,
        });
      });
  });

  await Promise.all(request);

  return data;
}

async function getArtistAlbums(artists) {
  let data: {
    id: string;
    name: string;
    release_date: string;
    id_artist: string;
    id_label: number;
  }[] = [];

  const request = artists.map((artist) => {
    return axios
      .get<TAlbums>(
        "https://api.spotify.com/v1/artists/" + artist.id + "/albums",
        {
          headers: {
            Authorization: authToken,
          },
          params: {
            include_groups: "album",
            limit: 50,
          },
        }
      )
      .then((result) => {
        result.data.items.map((values) => {
          data.push({
            id: values.id,
            name: values.name,
            release_date: values.release_date,
            id_artist: artist.id,
            id_label: 0,
          });
        });
      });
  });

  await Promise.all(request);

  return data;
}

async function insertArtistData() {
  const artistData = await getArtist();

  let data: {
    id: string;
    name: string;
    genres: string;
    followers: number;
    location: string;
    label: string;
  }[] = [];

  artistData.map((values, index) => {
    myArtistData.map((artist) => {
      if (values.name === artist.name) {
        data.push({
          id: values.id,
          name: values.name,
          genres: values.genres,
          followers: values.followers,
          location: artist.location,
          label: artist.label,
        });
      }
    });
  });

  data.map((values) => {
    console.log(
      "INSERT INTO ARTISTS VALUES (" +
        "'" +
        values.id +
        "'" +
        "," +
        "'" +
        values.name +
        "'" +
        "," +
        "'" +
        values.genres +
        "'" +
        "," +
        values.followers +
        "," +
        "'" +
        values.location +
        "'" +
        "," +
        "'" +
        values.label +
        "'" +
        ");"
    );
  });
}

function insertLabelsData() {
  myArtistData.map((values, idx) => {
    idx += 1;
    console.log(
      "INSERT INTO LABELS VALUES (" +
        idx +
        "," +
        "'" +
        values.label +
        "'" +
        "," +
        "'" +
        values.location +
        "'" +
        ");"
    );
  });
}

(async () => {
  const artists = await getArtist();
  const albums = await getArtistAlbums(artists);
  console.log(albums);
})();
