# Phase 8 Completion — PDF Generation & Export

**Status**: ✅ COMPLETE  
**Date**: 2026-06-06

---

## Summary

Phase 8 adds professional PDF export from the latest will snapshot using HTML templates rendered through Puppeteer.

---

## Deliverables

### 8.1 — PDF Template
- HTML template with testator, assets, beneficiaries, allocations, executor, guardian, witnesses
- Signature blocks and execution instructions
- Three formats: `standard`, `detailed`, `simplified`

**Files**: `apps/backend/src/modules/wills/pdf/will-pdf.template.ts`

### 8.2 — Puppeteer Setup
- `puppeteer` package installed
- `PdfService.renderHtmlToPdf()` with A4 margins, header/footer page numbers
- Optional `PUPPETEER_EXECUTABLE_PATH` for Docker/Linux

**Files**: `apps/backend/src/modules/wills/pdf/pdf.service.ts`

### 8.3 — API Endpoints
| Endpoint | Purpose |
|----------|---------|
| `GET /api/wills/:willId/pdf` | Download PDF attachment |
| `GET /api/wills/:willId/pdf/preview` | HTML preview for print |

Query: `?format=standard|detailed|simplified`

### 8.4–8.6 — Template content
- Branding header (Lawyered)
- Asset tables with values
- Allocation tables (supports `percentage` and `share`)
- Grouped beneficiary listing
- Witness affidavit text + signature lines

### 8.7 — Frontend
- `PdfExportPanel` — format selector, preview modal, download button
- Loading and error states
- Integrated in `WillBuilder`

**Files**:
- `apps/frontend/src/components/will-builder/PdfExportPanel.tsx`
- `apps/frontend/src/hooks/usePdf.ts`

### 8.8 — Tests
```bash
cd apps/backend
npm run test:phase8
```

---

## Usage

```bash
# Download (authenticated)
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3001/api/wills/<willId>/pdf?format=standard" \
  --output will.pdf
```

---

## Next Phase

**Phase 9** — Demo data & seed scripts ✅ (implemented alongside)
