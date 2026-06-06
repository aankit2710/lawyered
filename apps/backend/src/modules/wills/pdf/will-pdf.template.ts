import { WillSnapshotState } from '../memory/will-snapshot-state';

export type PdfFormat = 'standard' | 'detailed' | 'simplified';

export type WillPdfData = {
  title: string;
  generatedAt: string;
  snapshot: WillSnapshotState;
  format: PdfFormat;
};

function esc(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function display(value: unknown, fallback = 'Not provided'): string {
  return esc(value === null || value === undefined || value === '' ? fallback : value);
}

function allocationPercent(allocation: Record<string, unknown>): string {
  if (allocation.percentage != null) return `${allocation.percentage}%`;
  if (allocation.share != null) {
    const share = Number(allocation.share);
    if (!Number.isNaN(share)) return share <= 1 ? `${share * 100}%` : `${share}%`;
  }
  return '—';
}

function assetLabel(asset: Record<string, unknown>, index: number): string {
  return String(asset.name || asset.asset_name || asset.kind || asset.type || `Asset ${index + 1}`);
}

export function buildWillPdfHtml(data: WillPdfData): string {
  const { snapshot, title, generatedAt, format } = data;
  const testator = snapshot.testator || {};
  const assets = snapshot.assets || [];
  const beneficiaries = snapshot.beneficiaries || [];
  const allocations = snapshot.allocations || [];
  const executor = snapshot.executor;
  const guardian = snapshot.guardian;
  const witnesses = snapshot.witnesses || [];

  const assetsRows = assets
    .map((asset, index) => {
      const label = assetLabel(asset, index);
      const value = asset.estimated_value || asset.value || '—';
      const location = asset.location || asset.description || '—';
      return `<tr>
        <td>${display(label)}</td>
        <td>${display(location)}</td>
        <td>${display(value)}</td>
      </tr>`;
    })
    .join('');

  const allocationRows = allocations
    .map(allocation => {
      return `<tr>
        <td>${display(allocation.asset || allocation.asset_name || 'Estate')}</td>
        <td>${display(allocation.beneficiary)}</td>
        <td>${allocationPercent(allocation)}</td>
      </tr>`;
    })
    .join('');

  const beneficiaryBlocks = beneficiaries
    .map((beneficiary, index) => {
      const name = beneficiary.name || `Beneficiary ${index + 1}`;
      const shares = allocations.filter(
        a => String(a.beneficiary).toLowerCase() === String(name).toLowerCase(),
      );
      const shareList =
        shares.length > 0
          ? shares.map(s => `${display(s.asset || 'asset')}: ${allocationPercent(s)}`).join(', ')
          : 'Shares not specified';
      return `<li><strong>${display(name)}</strong> (${display(beneficiary.relationship || beneficiary.relation, 'relationship not stated')}) — ${shareList}</li>`;
    })
    .join('');

  const witnessBlocks = witnesses
    .map((witness, index) => {
      return `<div class="signature-block">
        <p><strong>Witness ${index + 1}:</strong> ${display(witness.name)}</p>
        <p>Age: ${display(witness.age, '—')} | Contact: ${display(witness.contact || witness.address, '—')}</p>
        <p>Signature: _________________________ Date: ${display(witness.signature_date, '___________')}</p>
      </div>`;
    })
    .join('');

  const detailedExtra =
    format === 'detailed'
      ? `<section>
          <h2>Additional Declarations</h2>
          <p>This will was prepared with AI assistance and reviewed for structural completeness. Legal review in your jurisdiction is recommended before execution.</p>
        </section>`
      : '';

  const simplifiedStyle =
    format === 'simplified'
      ? 'body { font-size: 11pt; } section { margin-bottom: 16px; }'
      : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${display(title)}</title>
  <style>
    @page { margin: 20mm 18mm; }
    body { font-family: Georgia, 'Times New Roman', serif; color: #111; line-height: 1.55; font-size: 12pt; }
    header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 24px; }
    .brand { font-size: 10pt; letter-spacing: 0.25em; text-transform: uppercase; color: #2563eb; }
    h1 { font-size: 22pt; margin: 8px 0; }
    h2 { font-size: 13pt; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
    section { margin-bottom: 22px; page-break-inside: avoid; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 11pt; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: left; vertical-align: top; }
    th { background: #f5f5f5; }
    ul { margin: 8px 0 0 18px; }
    .signature-block { margin: 16px 0; padding: 12px; border: 1px dashed #999; }
    .footer-note { margin-top: 28px; font-size: 10pt; color: #555; }
    .print-instructions { background: #f8fafc; border: 1px solid #dbeafe; padding: 12px; font-size: 10pt; }
    ${simplifiedStyle}
  </style>
</head>
<body>
  <header>
    <div class="brand">Lawyered Will Maker</div>
    <h1>${display(title)}</h1>
    <p>Last Will and Testament — ${display(format)} format</p>
    <p style="font-size:10pt;color:#666;">Generated ${display(generatedAt)}</p>
  </header>

  <section>
    <h2>Declaration</h2>
    <p>
      I, <strong>${display(testator.name, '________________')}</strong>,
      aged <strong>${display(testator.age, '____')}</strong>,
      residing at <strong>${display(testator.address, '________________')}</strong>,
      being of sound mind, hereby declare this document to be my Last Will and Testament,
      revoking all prior wills and codicils.
    </p>
  </section>

  <section>
    <h2>Testator Information</h2>
    <table>
      <tr><th>Name</th><td>${display(testator.name)}</td></tr>
      <tr><th>Age</th><td>${display(testator.age)}</td></tr>
      <tr><th>Address</th><td>${display(testator.address)}</td></tr>
      <tr><th>Sound Mind</th><td>${testator.soundMind === false ? 'No' : 'Yes'}</td></tr>
    </table>
  </section>

  <section>
    <h2>Assets</h2>
    ${
      assets.length
        ? `<table>
            <thead><tr><th>Asset</th><th>Description / Location</th><th>Value</th></tr></thead>
            <tbody>${assetsRows}</tbody>
          </table>`
        : '<p>No assets recorded.</p>'
    }
  </section>

  <section>
    <h2>Beneficiaries &amp; Allocations</h2>
    ${beneficiaries.length ? `<ul>${beneficiaryBlocks}</ul>` : '<p>No beneficiaries recorded.</p>'}
    ${
      allocations.length
        ? `<table>
            <thead><tr><th>Asset</th><th>Beneficiary</th><th>Share</th></tr></thead>
            <tbody>${allocationRows}</tbody>
          </table>`
        : ''
    }
  </section>

  <section>
    <h2>Executor Appointment</h2>
    ${
      executor
        ? `<p>I appoint <strong>${display(executor.name)}</strong> as the executor of this will.
           Contact: ${display(executor.contact || executor.contact_number, '—')}.
           ${
             executor.backup || executor.primary_backup
               ? `Backup executor: ${display(executor.backup || executor.primary_backup)}.`
               : ''
           }</p>`
        : '<p>No executor appointed.</p>'
    }
  </section>

  <section>
    <h2>Guardian Appointment</h2>
    ${
      guardian
        ? `<p>I appoint <strong>${display(guardian.name)}</strong> as guardian
           (${display(guardian.relationship, 'relationship not stated')}).
           Contact: ${display(guardian.contact, '—')}.</p>`
        : '<p>No guardian appointed.</p>'
    }
  </section>

  ${detailedExtra}

  <section>
    <h2>Witness Declaration</h2>
    <p>
      We declare that the testator signed this will in our presence, that the testator appeared
      to be of sound mind, and that we signed as witnesses in the presence of the testator and
      each other.
    </p>
    ${witnessBlocks || '<p>Witness details not yet recorded.</p>'}
  </section>

  <section>
    <h2>Signatures</h2>
    <div class="signature-block">
      <p><strong>Testator</strong></p>
      <p>Signature: _________________________ Date: _____________</p>
    </div>
  </section>

  <section class="print-instructions">
    <h2>Execution Instructions</h2>
    <ol>
      <li>Print this document on durable paper.</li>
      <li>Sign in the presence of at least two independent adult witnesses.</li>
      <li>Ensure each witness signs and dates the document.</li>
      <li>Store the original in a safe place and inform your executor.</li>
      <li>Consult a qualified attorney for jurisdiction-specific validity requirements.</li>
    </ol>
  </section>

  <p class="footer-note">Document ID: ${display(title)} | Lawyered Will Maker | Page <span class="pageNumber"></span></p>
</body>
</html>`;
}

export function buildPdfFilename(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  return `${slug || 'will'}.pdf`;
}
