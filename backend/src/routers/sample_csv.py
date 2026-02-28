"""GET /api/sample-csv"""

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from src.sample_data import generate_demo_csv

router = APIRouter()


@router.get("/api/sample-csv")
def sample_csv():
    body = generate_demo_csv()
    return StreamingResponse(
        iter([body]),
        media_type="text/csv",
        headers={
            "Content-Disposition": 'attachment; filename="sample_90.csv"',
        },
    )
