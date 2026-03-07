from __future__ import annotations

import pytest

from app.core.clients.anthropic_usage import fetch_usage_snapshot
from app.core.config.settings import get_settings


@pytest.mark.asyncio
async def test_fetch_usage_snapshot_uses_configured_user_agent(monkeypatch) -> None:
    monkeypatch.setenv("CODEX_LB_ANTHROPIC_OAUTH_USER_AGENT", "claude-code/test-usage")
    get_settings.cache_clear()

    seen_headers: dict[str, str] = {}

    class _StubResponse:
        status = 200

        async def json(self, content_type=None):
            return {
                "five_hour": {"utilization": 0.25, "resets_at": "2026-03-07T12:00:00Z"},
                "seven_day": {"utilization": 0.5, "resets_at": "2026-03-08T12:00:00Z"},
            }

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

    class _StubSession:
        def get(self, url, *, headers, timeout):
            del url, timeout
            seen_headers.update(headers)
            return _StubResponse()

    snapshot = await fetch_usage_snapshot(
        bearer_token="sk-ant-oat-test",
        session=_StubSession(),
    )

    assert snapshot.five_hour is not None
    assert snapshot.seven_day is not None
    assert seen_headers["User-Agent"] == "claude-code/test-usage"
