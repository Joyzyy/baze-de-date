-- Sa se afiseze numele artistilor care au genul rap si numele incepe cu litera L
SELECT
  *
FROM
  ARTISTS
WHERE
  LOWER(GEN) LIKE '%rap%'
  AND NUME LIKE 'L%';

-- Sa se afiseze numele si locatia, precum si numarul de followeri ai artistilor care au cel mai mare numar de followeri
SELECT
  NUME,
  LOCATIE,
  FOLLOWERS
FROM
  ARTISTS
WHERE
  FOLLOWERS = (
    SELECT
      MAX(FOLLOWERS)
    FROM
      ARTISTS
  );

-- Sa se afiseze numele si follower-ii primilor 10 artisti cu cel mai mare numar de followeri
SELECT
  NUME,
  FOLLOWERS
FROM
  ARTISTS
ORDER BY
  FOLLOWERS DESC FETCH FIRST 10 ROWS ONLY;

-- Sa se afiseze numele si follower-ii primilor 10 artisti cu cel mai mic numar de followeri
SELECT
  NUME,
  FOLLOWERS
FROM
  ARTISTS
ORDER BY
  FOLLOWERS ASC FETCH FIRST 10 ROWS ONLY;

-- albums
-- Sa se afiseze numele albumelor care au cel mai mare numar de melodii, precum si numele artistului si numarul de followeri
SELECT
  ALBUMS.TITLU,
  ARTISTS.NUME,
  ARTISTS.FOLLOWERS
FROM
  ALBUMS
  INNER JOIN ARTISTS
  ON ALBUMS.ID_ARTIST = ARTISTS.ID
WHERE
  ALBUMS.ID IN (
    SELECT
      ID_ALBUM
    FROM
      SONGS
    GROUP BY
      ID_ALBUM
    HAVING
      COUNT(ID_ALBUM) = (
        SELECT
          MAX(COUNT(ID_ALBUM))
        FROM
          SONGS
        GROUP BY
          ID_ALBUM
      )
  );

-- Sa se afiseze albumele care au minim 10 track-uri
SELECT
  *
FROM
  ALBUMS
WHERE
  ID IN (
    SELECT
      ID_ALBUM
    FROM
      SONGS
    GROUP BY
      ID_ALBUM
    HAVING
      COUNT(ID_ALBUM) >= 10
  );

-- Sa se afiseze numele albumelor si numele artistului care are cel mai mare numar de albume
SELECT
  ALBUMS.TITLU,
  ARTISTS.NUME
FROM
  ALBUMS
  INNER JOIN ARTISTS
  ON ALBUMS.ID_ARTIST = ARTISTS.ID
WHERE
  ARTISTS.ID IN (
    SELECT
      ID_ARTIST
    FROM
      ALBUMS
    GROUP BY
      ID_ARTIST
    HAVING
      COUNT(ID_ARTIST) = (
        SELECT
          MAX(COUNT(ID_ARTIST))
        FROM
          ALBUMS
        GROUP BY
          ID_ARTIST
      )
  );

-- Sa se afiseze numele albumelor si numele artistului care are cel mai mic numar de albume folosind tabele virtuale
CREATE OR REPLACE VIEW ALBUMS_COUNT AS
  SELECT
    ID_ARTIST,
    COUNT(ID_ARTIST) AS ALBUMS_COUNT
  FROM
    ALBUMS
  GROUP BY
    ID_ARTIST;

SELECT
  ALBUMS.TITLU,
  ARTISTS.NUME
FROM
  ALBUMS
  INNER JOIN ARTISTS
  ON ALBUMS.ID_ARTIST = ARTISTS.ID
WHERE
  ARTISTS.ID IN (
    SELECT
      ID_ARTIST
    FROM
      ALBUMS_COUNT
    WHERE
      ALBUMS_COUNT = (
        SELECT
          MIN(ALBUMS_COUNT)
        FROM
          ALBUMS_COUNT
      )
  );

-- Sa se afiseze numele albumelor si numele artistului care are cel mai mic numar de albume folosind subselectii
SELECT
  ALBUMS.TITLU,
  ARTISTS.NUME
FROM
  ALBUMS
  INNER JOIN ARTISTS
  ON ALBUMS.ID_ARTIST = ARTISTS.ID
WHERE
  ARTISTS.ID IN (
    SELECT
      ID_ARTIST
    FROM
      ALBUMS
    GROUP BY
      ID_ARTIST
    HAVING
      COUNT(ID_ARTIST) = (
        SELECT
          MIN(COUNT(ID_ARTIST))
        FROM
          ALBUMS
        GROUP BY
          ID_ARTIST
      )
  );

-- songs
-- Sa se afiseze numele melodiei, numele albumului si numele artistului
SELECT
  SONGS.TITLU,
  ALBUMS.TITLU,
  ARTISTS.NUME
FROM
  SONGS
  INNER JOIN ALBUMS
  ON SONGS.ID_ALBUM = ALBUMS.ID
  INNER JOIN ARTISTS
  ON ALBUMS.ID_ARTIST = ARTISTS.ID;

-- Sa se afiseze numele melodiei, numele albumului si numele artistului care au cel mai mare numar de melodii
SELECT
  SONGS.TITLU,
  ALBUMS.TITLU,
  ARTISTS.NUME
FROM
  SONGS
  INNER JOIN ALBUMS
  ON SONGS.ID_ALBUM = ALBUMS.ID
  INNER JOIN ARTISTS
  ON ALBUMS.ID_ARTIST = ARTISTS.ID
WHERE
  ARTISTS.ID IN (
    SELECT
      ID_ARTIST
    FROM
      SONGS
    GROUP BY
      ID_ARTIST
    HAVING
      COUNT(ID_ARTIST) = (
        SELECT
          MAX(COUNT(ID_ARTIST))
        FROM
          SONGS
        GROUP BY
          ID_ARTIST
      )
  );

-- audio_features
-- Sa se afiseze numele melodiei care are cel mai mare danceability level folosind tabele virtuale
CREATE OR REPLACE VIEW MAX_DANCEABILITY AS
  SELECT
    MAX(DANCEABILITY) AS MAX_DANCEABILITY
  FROM
    AUDIO_FEATURES;

SELECT
  SONGS.TITLU
FROM
  SONGS
  INNER JOIN AUDIO_FEATURES
  ON SONGS.ID = AUDIO_FEATURES.SONG_ID
WHERE
  DANCEABILITY = (
    SELECT
      MAX_DANCEABILITY
    FROM
      MAX_DANCEABILITY
  );

-- labels
-- sa se afiseze numele labelului, precum si numarul de albume care are cele mai multe albume folosind tabele virtuale
CREATE OR REPLACE VIEW LABELS_ALBUMS AS
  SELECT
    ID_LABEL,
    COUNT(ID_LABEL) AS ALBUMS_COUNT
  FROM
    ALBUMS
  GROUP BY
    ID_LABEL;

SELECT
  LABELS.NUME,
  LABELS_ALBUMS.ALBUMS_COUNT
FROM
  LABELS
  INNER JOIN LABELS_ALBUMS
  ON LABELS.ID = LABELS_ALBUMS.ID_LABEL
WHERE
  LABELS_ALBUMS.ALBUMS_COUNT = (
    SELECT
      MAX(LABELS_ALBUMS.ALBUMS_COUNT)
    FROM
      LABELS_ALBUMS
  );