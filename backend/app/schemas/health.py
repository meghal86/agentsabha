from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    db: str
    redis: str
    agents_active: int
    version: str

