from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import admin, briefs, citizen, journalist, mp, public, sansaddarpan, webhook

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    yield


app = FastAPI(title=settings.app_name, version=settings.api_version, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(public.router)
app.include_router(briefs.router)
app.include_router(sansaddarpan.router)
app.include_router(citizen.router)
app.include_router(mp.router)
app.include_router(journalist.router)
app.include_router(webhook.router)
app.include_router(admin.router)
