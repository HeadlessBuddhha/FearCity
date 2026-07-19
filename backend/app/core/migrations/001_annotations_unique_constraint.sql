CREATE TABLE IF NOT EXISTS annotations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    character_id text NOT NULL,
    content text NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT annotations_user_character_unique UNIQUE (user_id, character_id)
);
