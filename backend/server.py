from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


# -------------------- MODELS --------------------
class Material(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    pricePerSheet: float
    sheetWidth: float  # mm
    sheetHeight: float  # mm
    thickness: float  # mm
    wasteFactor: float = 0.10  # 0..1
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class MaterialCreate(BaseModel):
    name: str
    pricePerSheet: float
    sheetWidth: float
    sheetHeight: float
    thickness: float
    wasteFactor: float = 0.10


class MaterialUpdate(BaseModel):
    name: Optional[str] = None
    pricePerSheet: Optional[float] = None
    sheetWidth: Optional[float] = None
    sheetHeight: Optional[float] = None
    thickness: Optional[float] = None
    wasteFactor: Optional[float] = None


class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "global"
    machineHourlyRate: float = 25.0
    engravingHourlyRate: float = 30.0
    electricityCostPerHour: float = 1.5
    laborCostPerHour: float = 8.0
    defaultProfitMargin: float = 30.0  # percent
    currency: str = "USD"
    currencySymbol: str = "$"
    businessName: str = "Mi Taller Láser"


class SettingsUpdate(BaseModel):
    machineHourlyRate: Optional[float] = None
    engravingHourlyRate: Optional[float] = None
    electricityCostPerHour: Optional[float] = None
    laborCostPerHour: Optional[float] = None
    defaultProfitMargin: Optional[float] = None
    currency: Optional[str] = None
    currencySymbol: Optional[str] = None
    businessName: Optional[str] = None


class AdditionalCost(BaseModel):
    label: str
    amount: float


class QuoteCreate(BaseModel):
    projectName: str
    clientName: Optional[str] = ""
    notes: Optional[str] = ""
    materialId: str
    materialName: str
    pricePerSheet: float
    sheetWidth: float
    sheetHeight: float
    wasteFactor: float
    pieceWidth: float
    pieceHeight: float
    quantity: int
    cuttingTimeMin: float
    engravingTimeMin: float
    machineHourlyRate: float
    engravingHourlyRate: float
    electricityCostPerHour: float
    laborCostPerHour: float
    additionalCosts: List[AdditionalCost] = []
    profitMargin: float
    currency: str
    currencySymbol: str
    # computed
    materialCost: float
    cuttingCost: float
    engravingCost: float
    electricityCost: float
    laborCost: float
    additionalTotal: float
    subtotal: float
    profitAmount: float
    total: float
    pricePerUnit: float


class Quote(QuoteCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    createdAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# -------------------- HELPERS --------------------
def clean_doc(doc: dict) -> dict:
    if doc and "_id" in doc:
        doc.pop("_id", None)
    return doc


async def ensure_seed():
    count = await db.materials.count_documents({})
    if count == 0:
        defaults = [
            {"name": "Madera contrachapada 3mm", "pricePerSheet": 18.0, "sheetWidth": 600, "sheetHeight": 400, "thickness": 3, "wasteFactor": 0.10},
            {"name": "Madera contrachapada 6mm", "pricePerSheet": 28.0, "sheetWidth": 600, "sheetHeight": 400, "thickness": 6, "wasteFactor": 0.10},
            {"name": "Acrílico 3mm", "pricePerSheet": 35.0, "sheetWidth": 600, "sheetHeight": 400, "thickness": 3, "wasteFactor": 0.08},
            {"name": "Acrílico 5mm", "pricePerSheet": 52.0, "sheetWidth": 600, "sheetHeight": 400, "thickness": 5, "wasteFactor": 0.08},
            {"name": "MDF 3mm", "pricePerSheet": 12.0, "sheetWidth": 600, "sheetHeight": 400, "thickness": 3, "wasteFactor": 0.12},
            {"name": "MDF 6mm", "pricePerSheet": 22.0, "sheetWidth": 600, "sheetHeight": 400, "thickness": 6, "wasteFactor": 0.12},
            {"name": "Cuero 2mm", "pricePerSheet": 40.0, "sheetWidth": 500, "sheetHeight": 350, "thickness": 2, "wasteFactor": 0.15},
            {"name": "Cartón 2mm", "pricePerSheet": 6.0, "sheetWidth": 700, "sheetHeight": 500, "thickness": 2, "wasteFactor": 0.10},
            {"name": "Metal acero 1mm", "pricePerSheet": 75.0, "sheetWidth": 500, "sheetHeight": 300, "thickness": 1, "wasteFactor": 0.05},
        ]
        for d in defaults:
            mat = Material(**d)
            await db.materials.insert_one(mat.model_dump())
    s = await db.settings.find_one({"id": "global"})
    if not s:
        await db.settings.insert_one(Settings().model_dump())


# -------------------- ROUTES --------------------
@api_router.get("/")
async def root():
    return {"message": "Calculadora Láser API", "status": "ok"}


# Materials
@api_router.get("/materials", response_model=List[Material])
async def list_materials():
    docs = await db.materials.find({}, {"_id": 0}).to_list(1000)
    return docs


@api_router.post("/materials", response_model=Material)
async def create_material(payload: MaterialCreate):
    mat = Material(**payload.model_dump())
    await db.materials.insert_one(mat.model_dump())
    return mat


@api_router.put("/materials/{material_id}", response_model=Material)
async def update_material(material_id: str, payload: MaterialUpdate):
    update_fields = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update_fields:
        existing = await db.materials.find_one({"id": material_id}, {"_id": 0})
        if not existing:
            raise HTTPException(404, "Material no encontrado")
        return existing
    res = await db.materials.update_one({"id": material_id}, {"$set": update_fields})
    if res.matched_count == 0:
        raise HTTPException(404, "Material no encontrado")
    doc = await db.materials.find_one({"id": material_id}, {"_id": 0})
    return doc


@api_router.delete("/materials/{material_id}")
async def delete_material(material_id: str):
    res = await db.materials.delete_one({"id": material_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Material no encontrado")
    return {"ok": True}


# Settings
@api_router.get("/settings", response_model=Settings)
async def get_settings():
    doc = await db.settings.find_one({"id": "global"}, {"_id": 0})
    if not doc:
        s = Settings()
        await db.settings.insert_one(s.model_dump())
        return s
    return doc


@api_router.put("/settings", response_model=Settings)
async def update_settings(payload: SettingsUpdate):
    update_fields = {k: v for k, v in payload.model_dump().items() if v is not None}
    if update_fields:
        await db.settings.update_one({"id": "global"}, {"$set": update_fields}, upsert=True)
    doc = await db.settings.find_one({"id": "global"}, {"_id": 0})
    return doc


# Quotes
@api_router.get("/quotes", response_model=List[Quote])
async def list_quotes():
    docs = await db.quotes.find({}, {"_id": 0}).sort("createdAt", -1).to_list(1000)
    return docs


@api_router.get("/quotes/{quote_id}", response_model=Quote)
async def get_quote(quote_id: str):
    doc = await db.quotes.find_one({"id": quote_id}, {"_id": 0})
    if not doc:
        raise HTTPException(404, "Cotización no encontrada")
    return doc


@api_router.post("/quotes", response_model=Quote)
async def create_quote(payload: QuoteCreate):
    quote = Quote(**payload.model_dump())
    await db.quotes.insert_one(quote.model_dump())
    return quote


@api_router.delete("/quotes/{quote_id}")
async def delete_quote(quote_id: str):
    res = await db.quotes.delete_one({"id": quote_id})
    if res.deleted_count == 0:
        raise HTTPException(404, "Cotización no encontrada")
    return {"ok": True}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def on_startup():
    await ensure_seed()
    logger.info("Database seeded with default materials and settings")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
