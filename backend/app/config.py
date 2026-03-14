from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import URL, make_url


def _normalize_async_database_url(value: str) -> str:
    normalized = value
    if value.startswith("postgresql://"):
        normalized = value.replace("postgresql://", "postgresql+asyncpg://", 1)
    parsed = make_url(normalized)
    query = dict(parsed.query)
    query.pop("pgbouncer", None)
    query.pop("sslmode", None)
    cleaned = URL.create(
        drivername=parsed.drivername,
        username=parsed.username,
        password=parsed.password,
        host=parsed.host,
        port=parsed.port,
        database=parsed.database,
        query=query,
    )
    return cleaned.render_as_string(hide_password=False)


def _normalize_direct_database_url(value: str) -> str:
    if value.startswith("postgresql+asyncpg://"):
        return value.replace("postgresql+asyncpg://", "postgresql://", 1)
    return value


ROOT_ENV_PATH = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(ROOT_ENV_PATH), env_file_encoding="utf-8", extra="ignore")

    app_name: str = "AgentSabha API"
    environment: str = "development"
    api_version: str = "0.1.0"
    secret_key: str = "development-secret"

    database_url: str = Field(default="postgresql://user:pass@localhost:5432/agentsabha", alias="DATABASE_URL")
    direct_url: Optional[str] = Field(default=None, alias="DIRECT_URL")
    redis_url: str = "redis://localhost:6379/0"

    anthropic_api_key: str = Field(default="", alias="ANTHROPIC_API_KEY")
    openai_api_key: str = Field(default="", alias="OPENAI_API_KEY")

    whatsapp_token: str = Field(default="", alias="WHATSAPP_TOKEN")
    whatsapp_phone_id: str = Field(default="", alias="WHATSAPP_PHONE_ID")
    whatsapp_verify_token: str = Field(default="", alias="WHATSAPP_VERIFY_TOKEN")
    whatsapp_app_secret: str = Field(default="", alias="WHATSAPP_APP_SECRET")

    uidai_aua_code: str = Field(default="", alias="UIDAI_AUA_CODE")
    uidai_asa_code: str = Field(default="", alias="UIDAI_ASA_CODE")
    uidai_license_key: str = Field(default="", alias="UIDAI_LICENSE_KEY")

    encryption_key: str = Field(default="", alias="ENCRYPTION_KEY")

    aws_region: str = Field(default="ap-south-1", alias="AWS_REGION")
    aws_bucket_name: str = Field(default="", alias="AWS_BUCKET_NAME")
    aws_access_key_id: str = Field(default="", alias="AWS_ACCESS_KEY_ID")
    aws_secret_access_key: str = Field(default="", alias="AWS_SECRET_ACCESS_KEY")

    correct_constituency_minimum_cluster_size: int = Field(default=50, alias="CORRECT_CONSTITUENCY_MINIMUM_CLUSTER_SIZE")
    tatkal_severity_threshold: float = Field(default=8.0, alias="TATKAL_SEVERITY_THRESHOLD")
    tatkal_new_reports_threshold: int = Field(default=50, alias="TATKAL_NEW_REPORTS_THRESHOLD")
    tatkal_max_age_hours: int = Field(default=24, alias="TATKAL_MAX_AGE_HOURS")

    @property
    def sqlalchemy_async_database_url(self) -> str:
        return _normalize_async_database_url(self.database_url)

    @property
    def sqlalchemy_direct_url(self) -> str:
        source = self.direct_url or self.database_url
        return _normalize_direct_database_url(source)

    @property
    def safe_database_host(self) -> Optional[str]:
        return make_url(self.sqlalchemy_direct_url).host

    @property
    def async_connect_args(self) -> dict[str, str]:
        host = self.safe_database_host or ""
        if host not in {"localhost", "127.0.0.1"}:
            return {"ssl": "require"}
        return {}


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
