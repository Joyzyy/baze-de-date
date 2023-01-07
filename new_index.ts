import axios from "axios";
import { TSearch, TAlbums, TTracks, TAudioFeatures } from "./new_types";
import { authToken, myArtistData } from "./constants";
import { appendFile, writeFile, readFileSync } from "fs";

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

async function getTracksFromAlbums(albums) {
  const data: {
    id: string;
    duration_ms: number;
    name: string;
    id_album: string;
  }[] = [];

  const request = albums.map(async (album) => {
    try {
      const result = await axios.get<TTracks>(
        "https://api.spotify.com/v1/albums/" + album.id + "/tracks",
        {
          headers: {
            Authorization: authToken,
          },
        }
      );
      data.push(
        ...result.data.items.flatMap((values) => [
          {
            id: values.id,
            duration_ms: values.duration_ms,
            name: values.name.replace("'", ""),
            id_album: album.id,
          },
        ])
      );
    } catch (err) {
      const retryAfter = err.response.headers["retry-after"];
      if (err.response.status === 429 && retryAfter) {
        console.log("retrying after " + retryAfter + " seconds");
        return new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
      }
    }
  });

  await Promise.all(request);

  return data;
}

async function getAudioFeatures(tracks) {
  let data: {
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
  }[] = [];

  const request = tracks.map(async (track) => {
    try {
      const result = await axios.get<TAudioFeatures>(
        "https://api.spotify.com/v1/audio-features/" + track.id,
        {
          headers: {
            Authorization: authToken,
          },
        }
      );

      data.push({
        danceability: result.data.danceability,
        energy: result.data.energy,
        key: result.data.key,
        loudness: result.data.loudness,
        mode: result.data.mode,
        speechiness: result.data.speechiness,
        acousticness: result.data.acousticness,
        instrumentalness: result.data.instrumentalness,
        liveness: result.data.liveness,
        valence: result.data.valence,
        tempo: result.data.tempo,
        id: track.id,
        duration_ms: track.duration_ms,
        time_signature: result.data.time_signature,
      });
    } catch (err) {
      if (err.response.headers["retry-after"]) {
        const retryAfter = err.response?.headers["retry-after"];
        if (err.response.status === 429 && retryAfter) {
          console.log("retrying after " + retryAfter + " seconds");
          return new Promise((resolve) =>
            setTimeout(resolve, retryAfter * 1000)
          );
        }
      }
    }
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

async function insertAlbumsData() {
  const artists = await getArtist();
  const albums = await getArtistAlbums(artists);

  let albumsWithLabel: {
    id: string;
    name: string;
    release_date: string;
    id_artist: string;
    id_label: number;
  }[] = [];

  albums.map((values) => {
    artists.map((artist) => {
      if (values.id_artist === artist.id) {
        albumsWithLabel.push({
          id: values.id,
          name: values.name,
          release_date: values.release_date,
          id_artist: values.id_artist,
          id_label: myArtistData.findIndex((x) => x.name === artist.name) + 1,
        });
      }
    });
  });

  // write to file
  writeFile("albums.json", "", (err) => {
    if (err) return;
  });

  albumsWithLabel.map((values) => {
    let stringToAppend =
      "INSERT INTO ALBUMS VALUES ( " +
      "'" +
      values.id +
      "'" +
      "," +
      "'" +
      values.name +
      "'" +
      "," +
      "TO_DATE(" +
      "'" +
      values.release_date +
      "'" +
      ", 'YYYY-MM-DD')" +
      "," +
      "'" +
      values.id_artist +
      "'" +
      "," +
      values.id_label +
      ");";

    appendFile("albums.json", stringToAppend + "\n", (err) => {
      if (err) console.log(err);
    });
  });
}

async function insertSongsData() {
  const artists = await getArtist();
  const albums = await getArtistAlbums(artists);
  const tracks = await getTracksFromAlbums(albums);

  writeFile("tracks.sql", "", (err) => {
    if (err) return;
  });

  tracks.map((track) => {
    const textToAppend =
      "INSERT INTO SONGS VALUES (" +
      "'" +
      track.id +
      "'" +
      "," +
      "'" +
      track.name +
      "'" +
      "," +
      track.duration_ms +
      "," +
      "'" +
      track.id_album +
      "'" +
      ");";
    appendFile("tracks.sql", textToAppend + "\n", (err) => {
      if (err) console.warn(err);
    });
  });
}

(async () => {
  // read JSON from audioFeatures.json and store it into a variable
  let audioFeatures: any;
  const data = await readFileSync("audioFeatures.json", "utf8");
  audioFeatures = JSON.parse(data);
  console.log(audioFeatures);

  // const tracks = await getTracksFromAlbums(albums);
  // const audioFeatures = await getAudioFeatures(tracks);

  // writeFile("audioFeatures.sql", "", (err) => {
  //   if (err) return;
  // });

  audioFeatures.map((features) => {
    const textToAppend =
      "INSERT INTO AUDIO_FEATURES VALUES (" +
      "'" +
      features.id +
      "'" +
      "," +
      features.danceability +
      "," +
      features.energy +
      "," +
      features.key +
      "," +
      features.loudness +
      "," +
      features.mode +
      "," +
      features.speechiness +
      "," +
      features.acousticness +
      "," +
      features.instrumentalness +
      "," +
      features.liveness +
      "," +
      features.valence +
      "," +
      features.tempo +
      "," +
      +features.duration_ms +
      "," +
      features.time_signature +
      ");";

    appendFile("audioFeatures.sql", textToAppend + "\n", (err) => {
      if (err) console.warn(err);
    });
  });
})();
