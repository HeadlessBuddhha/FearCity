import pytest
from pydantic import ValidationError

from app.models.schemas import AnnotationUpsert, ValidateKeyRequest


def test_validate_key_request_rejects_short_or_blank_key():
    with pytest.raises(ValidationError):
        ValidateKeyRequest(key="  ")

    with pytest.raises(ValidationError):
        ValidateKeyRequest(key="ab")


def test_annotation_upsert_rejects_unreasonably_large_content():
    with pytest.raises(ValidationError):
        AnnotationUpsert(content="x" * 20001)
