"""PostgreSQL接続管理 + スキーマ初期化（raw SQL, psycopg2）"""

import psycopg2
from psycopg2.extras import RealDictCursor

from src.config import DATABASE_URL

_CREATE_TABLES = """
CREATE TABLE IF NOT EXISTS jobs (
    job_id UUID PRIMARY KEY,
    source_file_hash VARCHAR(64) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'queued',
    total_count INT NOT NULL DEFAULT 0,
    processed_count INT NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    error_message TEXT
);

CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    job_id UUID NOT NULL REFERENCES jobs(job_id),
    source_file_hash VARCHAR(64) NOT NULL,
    branch VARCHAR(100) NOT NULL,
    invoice_no VARCHAR(100) NOT NULL,
    customer_name VARCHAR(200) NOT NULL,
    subtotal_ex_tax INT NOT NULL,
    discount_amount INT,
    discount_rate DECIMAL(5,4),
    applied_discount INT NOT NULL DEFAULT 0,
    net_subtotal INT NOT NULL,
    computed_tax INT NOT NULL,
    computed_total INT NOT NULL,
    base_tax INT NOT NULL,
    base_total INT NOT NULL,
    diff_amount INT NOT NULL,
    status VARCHAR(20) NOT NULL,
    reason_code VARCHAR(50),
    reason_text TEXT,
    suggested_action TEXT,
    duplicate_skipped BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(source_file_hash, invoice_no)
);
"""


def get_conn():
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)


def init_schema():
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(_CREATE_TABLES)
        conn.commit()
