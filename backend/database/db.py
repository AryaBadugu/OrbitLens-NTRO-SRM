"""
SQLite run-history & market/weather data cache database.
"""
import sqlite3
import json
import os
from datetime import datetime, timezone

DB_PATH = os.path.join(os.path.dirname(__file__), "mandi_mirror.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS simulation_runs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            crop TEXT NOT NULL,
            params_json TEXT NOT NULL,
            result_json TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS agmarknet_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            commodity TEXT NOT NULL,
            state TEXT NOT NULL,
            district TEXT NOT NULL,
            market TEXT NOT NULL,
            variety TEXT,
            grade TEXT,
            arrival_date TEXT,
            min_price REAL,
            max_price REAL,
            modal_price REAL,
            unit TEXT DEFAULT 'Rs/Quintal',
            source TEXT DEFAULT 'Government of India OGD / AGMARKNET',
            source_timestamp TEXT,
            latitude REAL,
            longitude REAL,
            raw_json TEXT,
            fetched_at TEXT NOT NULL
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS agmarknet_sync_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            status TEXT NOT NULL,
            records_fetched INTEGER DEFAULT 0,
            error_message TEXT,
            synced_at TEXT NOT NULL
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS mandi_geocodes (
            market_key TEXT PRIMARY KEY,
            state TEXT NOT NULL,
            district TEXT NOT NULL,
            market TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS weather_cache (
            location_key TEXT PRIMARY KEY,
            data_json TEXT NOT NULL,
            fetched_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


def save_run(crop: str, params: dict, result: dict):
    conn = get_connection()
    conn.execute(
        "INSERT INTO simulation_runs (crop, params_json, result_json, created_at) VALUES (?, ?, ?, ?)",
        (crop, json.dumps(params), json.dumps(result), datetime.now(timezone.utc).isoformat()),
    )
    conn.commit()
    conn.close()


def recent_runs(limit: int = 10):
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM simulation_runs ORDER BY id DESC LIMIT ?", (limit,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]

