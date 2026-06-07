CREATE TYPE difficulty_level AS ENUM ('easy', 'moderate', 'hard', 'expert');
CREATE TYPE activity_status AS ENUM ('in_progress', 'completed', 'aborted');

CREATE TABLE routes (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by          UUID REFERENCES users(id) ON DELETE SET NULL,

    name                VARCHAR(150) NOT NULL,
    description         TEXT,

    -- Track geometry: 3D LINESTRING (lat/lon/elevation) in WGS84 (SRID 4326)
    track_geom          GEOMETRY(LINESTRINGZ, 4326) NOT NULL,

    -- Derived points, handy for Mapbox markers without recomputation
    start_point         GEOMETRY(POINTZ, 4326) NOT NULL,
    end_point           GEOMETRY(POINTZ, 4326) NOT NULL,

    -- Computed metrics (recalculated by trigger on insert/update of track_geom)
    distance_meters     NUMERIC(10, 2),
    elevation_gain_m    NUMERIC(8, 2),
    elevation_loss_m    NUMERIC(8, 2),
    difficulty          difficulty_level NOT NULL DEFAULT 'moderate',

    estimated_duration_min  INTEGER,
    is_premium_only     BOOLEAN NOT NULL DEFAULT false,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_routes_track_geom ON routes USING GIST (track_geom);
CREATE INDEX idx_routes_start_point ON routes USING GIST (start_point);
CREATE INDEX idx_routes_difficulty ON routes (difficulty);

CREATE TABLE route_photos (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id    UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    photo_url   TEXT NOT NULL,
    caption     VARCHAR(255),
    taken_at_point GEOMETRY(POINTZ, 4326),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_route_photos_route_id ON route_photos (route_id);

CREATE TABLE user_route_activities (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    route_id        UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    status          activity_status NOT NULL DEFAULT 'in_progress',

    recorded_track  GEOMETRY(LINESTRINGZ, 4326),

    started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    finished_at     TIMESTAMPTZ,
    distance_covered_m NUMERIC(10, 2),

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activities_user_id ON user_route_activities (user_id);
CREATE INDEX idx_activities_recorded_track ON user_route_activities USING GIST (recorded_track);

-- ── PostGIS helper functions ────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION calculate_route_distance(track GEOMETRY)
RETURNS NUMERIC AS $$
    SELECT ST_Length(track::geography);
$$ LANGUAGE sql IMMUTABLE;

CREATE OR REPLACE FUNCTION calculate_elevation_gain_loss(track GEOMETRY)
RETURNS TABLE(gain NUMERIC, loss NUMERIC) AS $$
    WITH points AS (
        SELECT ST_Z((dp).geom) AS elevation, (dp).path[1] AS seq
        FROM ST_DumpPoints(track) AS dp
    ),
    diffs AS (
        SELECT elevation - LAG(elevation) OVER (ORDER BY seq) AS delta
        FROM points
    )
    SELECT
        COALESCE(SUM(delta) FILTER (WHERE delta > 0), 0) AS gain,
        COALESCE(ABS(SUM(delta) FILTER (WHERE delta < 0)), 0) AS loss
    FROM diffs;
$$ LANGUAGE sql IMMUTABLE;

CREATE OR REPLACE FUNCTION trg_set_route_metrics()
RETURNS TRIGGER AS $$
BEGIN
    NEW.distance_meters := calculate_route_distance(NEW.track_geom);

    SELECT gain, loss INTO NEW.elevation_gain_m, NEW.elevation_loss_m
    FROM calculate_elevation_gain_loss(NEW.track_geom);

    NEW.start_point := ST_StartPoint(NEW.track_geom);
    NEW.end_point   := ST_EndPoint(NEW.track_geom);
    NEW.updated_at  := now();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER routes_before_insert_update
BEFORE INSERT OR UPDATE OF track_geom ON routes
FOR EACH ROW EXECUTE FUNCTION trg_set_route_metrics();
