CREATE TABLE SONGS_FEATURES(
  SONG_ID VARCHAR2(255) NOT NULL REFERENCES SONGS(ID),
  DANCEABILITY FLOAT NOT NULL,
  ENERGY FLOAT NOT NULL,
  KEY INTEGER NOT NULL,
  LOUDNESS FLOAT NOT NULL,
  MODE_ INTEGER NOT NULL,
  SPEECHINESS FLOAT NOT NULL,
  ACOUSTICNESS FLOAT NOT NULL,
  INSTRUMENTALNESS FLOAT NOT NULL,
  LIVENESS FLOAT NOT NULL,
  VALENCE FLOAT NOT NULL,
  TEMPO FLOAT NOT NULL,
  DURATION_MS INTEGER NOT NULL,
  TIME_SIGNATURE INTEGER NOT NULL
);