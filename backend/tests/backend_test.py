import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://cut-time-calc-1.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# Health
def test_root_ok(client):
    r = client.get(f"{API}/")
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "ok"


# Materials
def test_list_materials_seeded(client):
    r = client.get(f"{API}/materials")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 9
    for m in data:
        assert "_id" not in m
        assert "id" in m and "name" in m and "pricePerSheet" in m


def test_material_crud(client):
    # CREATE
    payload = {
        "name": "TEST_Material",
        "pricePerSheet": 10.0,
        "sheetWidth": 600,
        "sheetHeight": 400,
        "thickness": 3,
        "wasteFactor": 0.1,
    }
    r = client.post(f"{API}/materials", json=payload)
    assert r.status_code == 200, r.text
    created = r.json()
    assert "_id" not in created
    assert created["name"] == "TEST_Material"
    mid = created["id"]

    # UPDATE
    r = client.put(f"{API}/materials/{mid}", json={"pricePerSheet": 12.5})
    assert r.status_code == 200
    updated = r.json()
    assert updated["pricePerSheet"] == 12.5
    assert "_id" not in updated

    # Verify via list
    r = client.get(f"{API}/materials")
    assert r.status_code == 200
    assert any(m["id"] == mid and m["pricePerSheet"] == 12.5 for m in r.json())

    # DELETE
    r = client.delete(f"{API}/materials/{mid}")
    assert r.status_code == 200
    # 404 on second delete
    r = client.delete(f"{API}/materials/{mid}")
    assert r.status_code == 404


# Settings
def test_settings_get_and_update(client):
    r = client.get(f"{API}/settings")
    assert r.status_code == 200
    s = r.json()
    assert "_id" not in s
    assert s["currency"] == "USD" or "currency" in s
    assert "machineHourlyRate" in s

    # update
    new_rate = 27.5
    r = client.put(f"{API}/settings", json={"machineHourlyRate": new_rate})
    assert r.status_code == 200
    upd = r.json()
    assert upd["machineHourlyRate"] == new_rate
    assert "_id" not in upd

    # restore
    client.put(f"{API}/settings", json={"machineHourlyRate": s["machineHourlyRate"]})


# Quotes
def _build_quote_payload(material):
    return {
        "projectName": "TEST_Quote",
        "clientName": "TEST_Client",
        "notes": "",
        "materialId": material["id"],
        "materialName": material["name"],
        "pricePerSheet": material["pricePerSheet"],
        "sheetWidth": material["sheetWidth"],
        "sheetHeight": material["sheetHeight"],
        "wasteFactor": material["wasteFactor"],
        "pieceWidth": 100,
        "pieceHeight": 100,
        "quantity": 2,
        "cuttingTimeMin": 5,
        "engravingTimeMin": 2,
        "machineHourlyRate": 25,
        "engravingHourlyRate": 30,
        "electricityCostPerHour": 1.5,
        "laborCostPerHour": 8,
        "additionalCosts": [{"label": "Embalaje", "amount": 1.5}],
        "profitMargin": 30,
        "currency": "USD",
        "currencySymbol": "$",
        "materialCost": 5.0,
        "cuttingCost": 2.08,
        "engravingCost": 1.0,
        "electricityCost": 0.18,
        "laborCost": 0.93,
        "additionalTotal": 1.5,
        "subtotal": 10.69,
        "profitAmount": 3.21,
        "total": 13.9,
        "pricePerUnit": 6.95,
    }


def test_quote_crud(client):
    mats = client.get(f"{API}/materials").json()
    assert mats
    payload = _build_quote_payload(mats[0])
    r = client.post(f"{API}/quotes", json=payload)
    assert r.status_code == 200, r.text
    q = r.json()
    assert "_id" not in q
    assert q["projectName"] == "TEST_Quote"
    assert q["total"] == 13.9
    qid = q["id"]

    # GET single
    r = client.get(f"{API}/quotes/{qid}")
    assert r.status_code == 200
    assert r.json()["id"] == qid

    # LIST sorted desc
    r = client.get(f"{API}/quotes")
    assert r.status_code == 200
    lst = r.json()
    assert any(x["id"] == qid for x in lst)
    if len(lst) > 1:
        # sorted desc by createdAt
        assert lst[0]["createdAt"] >= lst[-1]["createdAt"]
    for x in lst:
        assert "_id" not in x

    # DELETE
    r = client.delete(f"{API}/quotes/{qid}")
    assert r.status_code == 200
    r = client.get(f"{API}/quotes/{qid}")
    assert r.status_code == 404
