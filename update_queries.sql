-- update ARTISTS
-- Sa se updateze numarul de followeri ai artistilor in urmatorul mod: daca locatia este new york -> followers creste cu 10%, iar daca este london atunci cu 20%
UPDATE ARTISTS
SET
  FOLLOWERS = CASE WHEN LOCATIE = 'New York' THEN FOLLOWERS * 1.1 WHEN LOCATIE = 'London' THEN FOLLOWERS * 1.2 ELSE FOLLOWERS END
 -- sa se updateze label-ul artistilor in urmatorul fel:
 --  daca numarul de followeri este 150.000 atunci acesta va fi signed la 'Columbia records'
 --  daca numarul de followeri este 200.000 atunci acesta va fi signed la 'Dreamville'
  UPDATE ARTISTS
  SET
    LABEL=DECODE(
      FOLLOWERS,
      150000,
      'Columbia Records',
      2000000,
      'DreamVille',
      LABEL
    );

-- audio_features
-- sa se actualizeze nivelul de danceabilty ale track-urilor care apartin unui album cu un numar mai mare de 20 de track-uri
UPDATE AUDIO_FEATURES
SET
  DANCEABILITY = DANCEABILITY * 1.1
WHERE
  TRACK_ID IN (
    SELECT TRACK_ID FROM TRACKS WHERE ALBUM_ID IN ( SELECT ALBUM_ID FROM ALBUMS WHERE TRACKS_NR > 20 )
  );

-- audio_features
-- sa se actualizeze nivelul de danceabilty ale pieselor cu 10% mai mare decat valoarea medie a danceability-ului
UPDATE AUDIO_FEATURES
SET
  DANCEABILITY = DANCEABILITY * 1.1
WHERE
  DANCEABILITY > (
    SELECT AVG(DANCEABILITY) FROM AUDIO_FEATURES
  );

-- sa se actualizeze energy ale pieselor care au duration_ms mai mare decat valoarea medie a celorlalte piese
UPDATE AUDIO_FEATURES
SET
  ENERGY = ENERGY * 1.1
WHERE
  DURATION_MS > (
    SELECT AVG(DURATION_MS) FROM AUDIO_FEATURES
  );

-- sa se actualizeze valoarea de loudness ale pieselor astfel:
--  daca loudness este mai mare decat valoarea medie a loudness-ului, sa se actualizeze cu 10% mai mare
--  daca loudness este mai mica decat valoarea medie a loudness-ului, sa se actualizeze cu 10% mai mica
UPDATE AUDIO_FEATURES
SET
  LOUDNESS = CASE WHEN LOUDNESS > (
    SELECT AVG(LOUDNESS) FROM AUDIO_FEATURES
  ) THEN LOUDNESS * 1.1 ELSE LOUDNESS * 0.9 END;