from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import crud, schemas
from .database import Base, engine, get_session
from .scheduler import start_scheduler

app = FastAPI(title="Website Screenshot Scheduler")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    start_scheduler()


def get_db():
    with get_session() as session:
        yield session


@app.post("/websites", response_model=schemas.WebsiteRead, status_code=201)
def create_website(website: schemas.WebsiteCreate, db: Session = Depends(get_db)):
    return crud.create_website(db, website)


@app.get("/websites", response_model=list[schemas.WebsiteRead])
def list_all_websites(db: Session = Depends(get_db)):
    return crud.list_websites(db)


@app.get("/websites/{website_id}", response_model=schemas.WebsiteRead)
def read_website(website_id: int, db: Session = Depends(get_db)):
    website = crud.get_website(db, website_id)
    if not website:
        raise HTTPException(status_code=404, detail="Website not found")
    return website


@app.put("/websites/{website_id}", response_model=schemas.WebsiteRead)
def update_website(website_id: int, data: schemas.WebsiteUpdate, db: Session = Depends(get_db)):
    website = crud.get_website(db, website_id)
    if not website:
        raise HTTPException(status_code=404, detail="Website not found")
    return crud.update_website(db, website, data)


@app.delete("/websites/{website_id}", status_code=204)
def delete_website(website_id: int, db: Session = Depends(get_db)):
    website = crud.get_website(db, website_id)
    if not website:
        raise HTTPException(status_code=404, detail="Website not found")
    crud.delete_website(db, website)
    return None
