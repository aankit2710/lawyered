import { buildPdfFilename, buildWillPdfHtml } from '../../src/modules/wills/pdf/will-pdf.template';
import type { WillSnapshotState } from '../../src/modules/wills/memory/will-snapshot-state';

declare const describe: any;
declare const it: any;
declare const expect: any;

describe('will PDF template (Phase 8)', () => {
  const snapshot: WillSnapshotState = {
    title: 'Test Will',
    testator: { name: 'Jane Doe', age: 50, address: 'Pune', soundMind: true },
    assets: [{ name: 'House', description: 'Family home', value: '₹50L' }],
    beneficiaries: [{ name: 'Rahul', relationship: 'son' }],
    allocations: [{ asset: 'House', beneficiary: 'Rahul', share: 1 }],
    executor: { name: 'Amit', contact: '9999999999' },
    guardian: null,
    witnesses: [
      { name: 'W1', signature_date: '2026-01-01' },
      { name: 'W2', signature_date: '2026-01-02' },
    ],
  };

  it('builds HTML containing all required legal sections', () => {
    const html = buildWillPdfHtml({
      title: 'Test Will',
      generatedAt: 'June 6, 2026',
      snapshot,
      format: 'standard',
    });

    expect(html).toContain('Last Will and Testament');
    expect(html).toContain('Jane Doe');
    expect(html).toContain('Executor Appointment');
    expect(html).toContain('Witness Declaration');
    expect(html).toContain('Execution Instructions');
    expect(html).toContain('Rahul');
  });

  it('supports detailed and simplified formats', () => {
    const detailed = buildWillPdfHtml({
      title: 'Test Will',
      generatedAt: 'June 6, 2026',
      snapshot,
      format: 'detailed',
    });
    const simplified = buildWillPdfHtml({
      title: 'Test Will',
      generatedAt: 'June 6, 2026',
      snapshot,
      format: 'simplified',
    });

    expect(detailed).toContain('Additional Declarations');
    expect(simplified).toContain('font-size: 11pt');
  });

  it('creates a safe pdf filename slug', () => {
    expect(buildPdfFilename('Rajesh Kumar Will!')).toBe('rajesh-kumar-will.pdf');
  });
});
