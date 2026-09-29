import os
from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Response
from fastapi.responses import FileResponse
from app.config import settings
from app.services.swin2sr_service import run_swin2sr_inference

router = APIRouter(tags=["enhance"])

ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".tif", ".tiff", ".geotiff", ".bmp", ".webp"}
MAX_FILE_SIZE_BYTES = 32 * 1024 * 1024  # 32 MB limit


async def _handle_enhancement(file: UploadFile, raw: bool, fallback: bool = False):
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="No image file provided for enhancement.")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Supported formats: PNG, JPEG, TIFF, GeoTIFF, WebP."
        )

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty (0 bytes).")

    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=422,
            detail=f"File exceeds maximum allowed size ({round(len(content) / (1024*1024), 2)} MB)."
        )

    try:
        result = run_swin2sr_inference(content, file.filename)
        if fallback:
            result["cached"] = True

        # GeoTIFF CRS Extraction
        crs_info = "Unknown (Not a GeoTIFF)"
        if file.filename.lower().endswith(('.tif', '.tiff')):
            try:
                import rasterio
                from io import BytesIO
                with rasterio.open(BytesIO(content)) as dataset:
                    crs_info = str(dataset.crs) if dataset.crs else "Unregistered CRS"
            except Exception:
                crs_info = "Unregistered CRS"
        else:
            crs_info = result.get("crs_info", "EPSG:4326 (WGS 84)")
        result["crs_info"] = crs_info
        if "metrics" in result:
            result["metrics"]["crs"] = crs_info
            result["metrics"]["crs_info"] = crs_info
        
        # If client explicitly requests raw PNG image bytes:
        if raw:
            raw_data = result.get("raw_bytes")
            return Response(
                content=raw_data,
                media_type="image/png",
                headers={
                    "Content-Disposition": f'inline; filename="{os.path.basename(result["enhanced_path"])}"',
                    "X-PSNR": str(result["metrics"]["psnr"]),
                    "X-SSIM": str(result["metrics"]["ssim"]),
                    "X-Inference-Time-Ms": str(result["metrics"]["inference_time_ms"]),
                    "X-Device": str(result["metrics"]["device"])
                }
            )

        # Clean binary raw_bytes out of JSON response dictionary so FastAPI doesn't attempt utf-8 string serialization
        result.pop("raw_bytes", None)
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Swin2SR GPU inference failed: {str(e)}"
        )


@router.post("/enhance")
async def enhance_direct(
    file: UploadFile = File(...),
    raw: bool = Query(False, description="Return raw PNG image bytes"),
    fallback: bool = Query(False, description="Enable fallback cache indicator")
):
    """Direct /enhance endpoint for single-step satellite image super-resolution."""
    return await _handle_enhancement(file, raw, fallback)


@router.post("/api/enhance")
async def enhance_api(
    file: UploadFile = File(...),
    raw: bool = Query(False, description="Return raw PNG image bytes"),
    fallback: bool = Query(False, description="Enable fallback cache indicator")
):
    """API-prefixed /api/enhance endpoint for frontend clients."""
    return await _handle_enhancement(file, raw, fallback)


@router.get("/outputs/{filename}")
@router.get("/api/outputs/{filename}")
def get_output_file(filename: str):
    """Serve generated super-resolved images and baseline tiles."""
    file_path = os.path.join(settings.OUTPUT_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Output file not found on disk.")
    return FileResponse(file_path, media_type="image/png")
