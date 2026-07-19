import asyncio
import sys
from types import SimpleNamespace
from pathlib import Path

import pytest

from app.core import migrations as migration_module
from app.routers import annotations as annotations_router


class FakeSupabaseTable:
    def __init__(self, client):
        self.client = client
        self.calls = []

    def upsert(self, payload, on_conflict=None):
        self.calls.append((payload, on_conflict))
        self.client.last_payload = payload
        self.client.last_conflict = on_conflict
        return self

    def execute(self):
        self.client.rows[(self.client.last_payload["user_id"], self.client.last_payload["character_id"])] = {
            "id": f"ann-{self.client.last_payload['user_id']}-{self.client.last_payload['character_id']}",
            **self.client.last_payload,
        }
        return SimpleNamespace(data=[self.client.rows[(self.client.last_payload["user_id"], self.client.last_payload["character_id"])]])


class FakeSupabaseClient:
    def __init__(self):
        self.rows = {}
        self.last_payload = None
        self.last_conflict = None

    def table(self, name):
        assert name == "annotations"
        return FakeSupabaseTable(self)


def test_annotations_migration_declares_compound_unique_constraint():
    sql = migration_module.get_migration_sql("001_annotations_unique_constraint.sql")
    assert "UNIQUE (user_id, character_id)" in sql


def test_upsert_annotation_inserts_and_updates_for_same_user_character_pair(monkeypatch):
    fake_client = FakeSupabaseClient()
    monkeypatch.setattr(annotations_router, "_require_auth", lambda authorization: "user-1")
    monkeypatch.setattr(annotations_router, "_dev_store", {})
    monkeypatch.setattr("app.core.supabase.get_supabase", lambda: fake_client)

    first = asyncio.run(
        annotations_router.upsert_annotation(
            character_id="char-1",
            body=SimpleNamespace(content="first", updated_at=None),
            authorization="Bearer token",
        )
    )
    second = asyncio.run(
        annotations_router.upsert_annotation(
            character_id="char-1",
            body=SimpleNamespace(content="updated", updated_at=None),
            authorization="Bearer token",
        )
    )

    assert first["content"] == "first"
    assert second["content"] == "updated"
    assert fake_client.last_conflict == "user_id,character_id"
    assert len(fake_client.rows) == 1
    assert fake_client.rows[("user-1", "char-1")]["content"] == "updated"
