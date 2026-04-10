import json

from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import FileResponse, JSONResponse

from app.services.cnab_service import (
    process_cnab_file,
    parse_cnab_file,
    process_and_parse_cnab_file,
    generate_corrected_cnab_file,
)

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok"}


@router.post("/cnab/validate-and-fix")
async def validate_and_fix_cnab(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Arquivo inválido")

    content = await file.read()
    result = process_cnab_file(file.filename, content)
    return JSONResponse(content=result)


@router.post("/cnab/validate-and-fix/download")
async def validate_and_fix_cnab_and_download(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Arquivo inválido")

    content = await file.read()
    result = generate_corrected_cnab_file(file.filename, content)

    return FileResponse(
        path=result["output_path"],
        filename=result["output_file"],
        media_type="application/octet-stream",
    )


@router.post("/cnab/validate-and-fix/report")
async def validate_and_fix_cnab_report(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Arquivo inválido")

    content = await file.read()
    result = process_cnab_file(file.filename, content)

    report_name = f"{file.filename}.report.json"
    report_path = f"/tmp/{report_name}"

    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    return FileResponse(
        path=report_path,
        filename=report_name,
        media_type="application/json",
    )


@router.post("/cnab/parse")
async def parse_cnab(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Arquivo inválido")

    content = await file.read()
    result = parse_cnab_file(file.filename, content)
    return JSONResponse(content=result)


@router.post("/cnab/validate-fix-and-parse")
async def validate_fix_and_parse_cnab(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Arquivo inválido")

    content = await file.read()
    result = process_and_parse_cnab_file(file.filename, content)
    return JSONResponse(content=result)