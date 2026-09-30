CREATE TABLE IF NOT EXISTS entries (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(30)  NOT NULL,
  message       VARCHAR(500) NOT NULL,
  password_hash TEXT         NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS entries_created_at_idx ON entries (created_at DESC, id DESC);
