from fastapi import APIRouter
import torch

router = APIRouter(tags=["health"])


@router.get("/health")
@router.get("/api/health")
def health_check():
    gpu_available = torch.cuda.is_available()
    device_name = torch.cuda.get_device_name(0) if gpu_available else "CPU"
    return {
        "status": "operational",
        "gpu": gpu_available,
        "device": device_name,
        "model": "Swin2SR Active",
        "model_name": "caidas/swin2SR-classical-sr-x2-64",
        "model_loaded": True
    }
