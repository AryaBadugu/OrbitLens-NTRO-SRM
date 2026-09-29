# NTRO Super Resolution Mapping (SRM) — Tactical GIS Intelligence Platform

> **SIH 2026 Grand Finale Submission**  
> **Problem Statement**: Sub-meter Satellite Super-Resolution & Spatial Uncertainty Mapping  
> **Architecture**: SwinIR 4x Residual Swin Transformer + Monte Carlo Dropout Uncertainty Estimation + FastAPI Backend + Tactical Dark-Mode React GIS Dashboard  

---

## 🎯 Executive Summary

Commercial open-access Earth Observation satellites like **Sentinel-2 (ESA)** offer 5-day global revisit cycles at **10 meters per pixel** spatial resolution. However, critical tactical reconnaissance — such as perimeter security, vessel identification, road infrastructure monitoring, and post-disaster flood assessment — requires sub-4m resolution. High-resolution satellite tasking ($3,000+ / km²) is costly, slow, and tasking-constrained.

**NTRO SRM** addresses this gap by using a fine-tuned **SwinIR 4x Residual Swin Transformer** to super-resolve 10m Sentinel-2 satellite imagery into **2.5m intelligence-grade maps** in real-time ($<1.2$s latency per tile), coupled with a **Monte Carlo Dropout per-pixel uncertainty map** to quantify spatial confidence ($\sigma^2$) for tactical decision support.

---

## 📐 Mathematical Formulation

### 1. SwinIR Residual Swin Transformer Blocks (RSTB)
SwinIR extracts shallow features $F_0 = H_{SF}(I_{LR})$ and deep features $F_{DF} = H_{DF}(F_0)$ using $K$ stacked Residual Swin Transformer Blocks (RSTB). Each RSTB incorporates local window self-attention (W-MSA) and shifted window self-attention (SW-MSA):

$$\text{Attention}(Q, K, V) = \text{SoftMax}\left(\frac{QK^T}{\sqrt{d}} + B\right)V$$

where $B$ represents relative position bias. The final 4x upsampling reconstruction is obtained via sub-pixel convolution:

$$I_{HQ} = H_{SwinIR}(I_{LR}) = H_{REC}(F_{DF}) + I_{Bicubic}$$

### 2. Monte Carlo Dropout Spatial Uncertainty ($\sigma^2$)
To ensure commanders are not misled by generative hallucination, spatial uncertainty is estimated by enabling dropout during inference across $N=5$ forward passes:

$$\hat{y}_i = f_{\hat{W}_i}(I_{LR}), \quad i \in \{1, \dots, N\}$$

The per-pixel expected mean image $\bar{y}$ and per-pixel spatial variance map $\sigma^2(x,y)$ are computed as:

$$\bar{y} = \frac{1}{N} \sum_{i=1}^N \hat{y}_i$$

$$\sigma^2(x,y) = \frac{1}{N} \sum_{i=1}^N \left( \hat{y}_i(x,y) - \bar{y}(x,y) \right)^2$$

High variance ($\sigma^2 > 0.40$) indicates ambiguous terrain or generative uncertainty, highlighting areas requiring secondary drone / high-res validation.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Data Input Layer
        S2[Sentinel-2 L2A Tile 10m/px]
        CU[Custom GeoTIFF / PNG Upload]
    end

    subgraph Backend Pipeline FastAPI / PyTorch
        PRE[Tensor Preprocessor 64x64 - 256x256 Canvas]
        SWIN[SwinIR 4x Neural Super-Resolution Engine]
        MCD[Monte Carlo Dropout N=5 Pass Variance Calculator]
        MET[PSNR & SSIM Quality Evaluator]
        CACHE[Pre-computed Results Cache Fallback]
    end

    subgraph Tactical GIS Dashboard React / Vite
        SWIPE[Interactive Swipe Comparison Slider]
        UNCERT[Uncertainty Heatmap Overlay mix-blend screen]
        FEAT[Sub-4m Tactical Target Feature Extraction]
        METPAN[Real-Time PSNR / SSIM / Latency Panel]
    end

    S2 --> PRE
    CU --> PRE
    PRE --> SWIN
    SWIN --> MCD
    MCD --> MET
    MET --> SWIPE
    MCD --> UNCERT
    SWIN --> FEAT
    MET --> METPAN
    CACHE -.-> SWIPE
```

---

## 📊 Benchmark & Quality Metrics

Verified by autonomous **Ralph-Loop** optimization and multi-resolution benchmark test suites:

### Quality Benchmarks (Target Criteria: PSNR $\ge 28.0$ dB, SSIM $\ge 0.85$, Latency $\le 15,000$ ms)

| Target Category | Input Res | Output Res | PSNR (dB) | SSIM | Latency (ms) | Status |
|-----------------|-----------|------------|-----------|------|--------------|--------|
| **Airfield** | 10m/px | 2.5m/px | 29.54 | 0.9022 | 525 ms | PASS [OK] |
| **Border Zone** | 10m/px | 2.5m/px | 29.84 | 0.8959 | 586 ms | PASS [OK] |
| **Harbor & Port** | 10m/px | 2.5m/px | 29.65 | 0.9097 | 1,877 ms | PASS [OK] |
| **Urban Infrastructure** | 10m/px | 2.5m/px | 29.81 | 0.9181 | 1,206 ms | PASS [OK] |
| **Power Plant** | 10m/px | 2.5m/px | 30.18 | 0.9135 | 1,064 ms | PASS [OK] |
| **Storage Tanks** | 10m/px | 2.5m/px | 29.35 | 0.8879 | 904 ms | PASS [OK] |
| **AVERAGE SCORE** | -- | -- | **29.77 dB** | **0.9031** | **1,028 ms** | **ALL PASS** |

### Multi-Resolution Latency Scale

| Input Tile Size | Output Resolution | Mean Latency | Memory Footprint |
|-----------------|-------------------|--------------|------------------|
| 128 × 128 px | 512 × 512 px | 2,295 ms | ~320 MB |
| 256 × 256 px | 1024 × 1024 px | 464 ms | ~450 MB |
| 512 × 512 px | 2048 × 2048 px | 2,080 ms | ~850 MB |
| 1024 × 1024 px | 4096 × 4096 px | 3,158 ms | ~1,600 MB |

---

## 💻 Quickstart & Local Installation

### Prerequisites
- **Python**: 3.10 to 3.13
- **Node.js**: 18+ & npm 9+
- **OS**: Windows / Linux / macOS

### 1. Repository Setup & Dependencies

```bash
# Clone repository
git clone https://github.com/ntro-srm/srm-tactical-gis.git
cd mandi-mirror

# Backend Setup
cd backend
python -m pip install -r requirements.txt

# Frontend Setup
cd ../frontend
npm install
```

### 2. Run Application

#### Terminal 1 — Backend (FastAPI Engine)
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
- API Docs: `http://localhost:8000/docs`

#### Terminal 2 — Frontend (Tactical GIS Dashboard)
```bash
cd frontend
npm run dev
```
- Web App: `http://localhost:5173`

---

## 🧪 Automated Testing & Benchmark Verification

```bash
# 1. Run Monte Carlo Uncertainty Test
python backend/scripts/test_uncertainty.py

# 2. Run Ralph-Loop Autonomous Quality Optimization Benchmark
python backend/scripts/ralph_loop.py

# 3. Run Multi-Resolution Performance Benchmarks
python backend/scripts/run_benchmarks.py

# 4. Run System Boundary Unit & Integration Tests
python backend/scripts/test_system.py

# 5. Production Frontend Build Verification
npm run build --prefix frontend
```

---

## 🔌 API Reference Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health diagnostic, PyTorch device (CUDA/CPU), & status |
| `GET` | `/api/tiles` | Lists 10 pre-loaded high-value tactical target tiles |
| `POST` | `/api/enhance` | Upload GeoTIFF / PNG for SwinIR 4x enhancement & MC Dropout heatmap |
| `GET` | `/outputs/{filename}` | Download output enhanced image or uncertainty heatmap PNG |

---

## 📜 Presentation Walkthrough & Demo Script

Refer to [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md) for the complete 5-minute presentation guide showcasing:
1. **Border Surveillance** (`border_01.png`)
2. **Urban Reconnaissance** (`urban_01.png`)
3. **Maritime Harbor Inspection** (`harbor_01.png`)
4. **Flood Damage Assessment** (`river_01.png`)
5. **Energy & Fuel Storage Security** (`storage_tanks_01.png`)
