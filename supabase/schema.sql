-- ─────────────────────────────────────────────────────────────────────────────
-- Sweet Estate — Supabase SQL Schema
-- Run this in the Supabase SQL editor after creating your project.
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable the pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── Enum types ───────────────────────────────────────────────────────────────

CREATE TYPE property_type AS ENUM (
  'residential_sale',
  'residential_rental',
  'commercial',
  'luxury'
);

CREATE TYPE property_status AS ENUM (
  'available',
  'under_offer',
  'sold',
  'rented'
);

-- ─── Agents ───────────────────────────────────────────────────────────────────

CREATE TABLE agents (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT        UNIQUE NOT NULL,
  name          TEXT        NOT NULL,
  photo         TEXT        NOT NULL DEFAULT '',
  -- Localised fields stored as JSONB: { "en": "...", "fr": "...", "es": "...", "ca": "..." }
  title         JSONB       NOT NULL DEFAULT '{"en":"","fr":"","es":"","ca":""}',
  bio           JSONB       NOT NULL DEFAULT '{"en":"","fr":"","es":"","ca":""}',
  phone         TEXT        NOT NULL DEFAULT '',
  email         TEXT        UNIQUE NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Properties ───────────────────────────────────────────────────────────────

CREATE TABLE properties (
  id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT            UNIQUE NOT NULL,
  -- Localised text fields
  title           JSONB           NOT NULL DEFAULT '{"en":"","fr":"","es":"","ca":""}',
  description     JSONB           NOT NULL DEFAULT '{"en":"","fr":"","es":"","ca":""}',
  -- Classification
  type            property_type   NOT NULL,
  status          property_status NOT NULL DEFAULT 'available',
  -- Pricing (always stored in euros)
  price           INTEGER         NOT NULL CHECK (price >= 0),
  price_label     TEXT            NOT NULL DEFAULT '',
  -- Dimensions
  bedrooms        SMALLINT        NOT NULL DEFAULT 0 CHECK (bedrooms >= 0),
  bathrooms       SMALLINT        NOT NULL DEFAULT 0 CHECK (bathrooms >= 0),
  reception_rooms SMALLINT        NOT NULL DEFAULT 0 CHECK (reception_rooms >= 0),
  square_meters   SMALLINT        NOT NULL DEFAULT 0 CHECK (square_meters >= 0),
  -- Location
  address         TEXT            NOT NULL DEFAULT '',
  city            TEXT            NOT NULL DEFAULT '',
  postcode        TEXT            NOT NULL DEFAULT '',
  country         TEXT            NOT NULL DEFAULT '',
  -- Coordinates stored as { "lat": 0.0, "lng": 0.0 }
  coordinates     JSONB           NOT NULL DEFAULT '{"lat":0,"lng":0}',
  -- Features: array of localised objects [{ "en": "...", "fr": "...", ... }]
  features        JSONB           NOT NULL DEFAULT '[]',
  -- Images: array of URLs
  images          TEXT[]          NOT NULL DEFAULT '{}',
  -- Relations
  agent_id        UUID            REFERENCES agents(id) ON DELETE SET NULL,
  -- Dates
  listed_at       DATE            NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

-- Properties
CREATE INDEX idx_properties_type        ON properties (type);
CREATE INDEX idx_properties_status      ON properties (status);
CREATE INDEX idx_properties_city        ON properties (city);
CREATE INDEX idx_properties_price       ON properties (price);
CREATE INDEX idx_properties_bedrooms    ON properties (bedrooms);
CREATE INDEX idx_properties_listed_at   ON properties (listed_at DESC);
CREATE INDEX idx_properties_agent_id    ON properties (agent_id);
-- Full-text search on the English title (extend as needed for other locales)
CREATE INDEX idx_properties_title_en    ON properties USING gin (to_tsvector('english', title->>'en'));

-- Agents
CREATE INDEX idx_agents_slug            ON agents (slug);
CREATE INDEX idx_agents_email           ON agents (email);

-- ─── Automatic updated_at timestamps ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Row-Level Security ───────────────────────────────────────────────────────

-- Enable RLS on both tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Public: anyone can SELECT
CREATE POLICY "Public read — properties"
  ON properties FOR SELECT
  USING (true);

CREATE POLICY "Public read — agents"
  ON agents FOR SELECT
  USING (true);

-- Authenticated: only signed-in users (service role in API routes) can write
CREATE POLICY "Authenticated write — properties"
  ON properties FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated write — agents"
  ON agents FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ─── Comments ─────────────────────────────────────────────────────────────────

COMMENT ON TABLE properties IS 'Property listings with localised JSONB fields for title, description, and features.';
COMMENT ON TABLE agents     IS 'Agent profiles with localised JSONB fields for title and bio.';

COMMENT ON COLUMN properties.title       IS 'JSONB: { en, fr, es, ca }';
COMMENT ON COLUMN properties.description IS 'JSONB: { en, fr, es, ca }';
COMMENT ON COLUMN properties.features    IS 'JSONB array: [{ en, fr, es, ca }, ...]';
COMMENT ON COLUMN properties.coordinates IS 'JSONB: { lat: number, lng: number }';
COMMENT ON COLUMN agents.title           IS 'JSONB: { en, fr, es, ca }';
COMMENT ON COLUMN agents.bio             IS 'JSONB: { en, fr, es, ca }';
