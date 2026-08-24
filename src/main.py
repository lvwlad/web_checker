from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from models import Base
from api.users import router as users_router
from api.monitors import router as monitors_router
from database import engine

app = FastAPI()

Base.metadata.create_all(engine)

app.include_router(users_router)
app.include_router(monitors_router)

app.mount("/", StaticFiles(directory=Path(__file__).parent / "static", html=True), name="static")


