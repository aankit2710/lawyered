import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { SnapshotService } from '../snapshot.service';
import { WillsService } from '../wills.service';
import {
  buildPdfFilename,
  buildWillPdfHtml,
  PdfFormat,
  WillPdfData,
} from './will-pdf.template';

export type GeneratedPdf = {
  buffer: Buffer;
  filename: string;
  html: string;
};

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  constructor(
    private readonly willsService: WillsService,
    private readonly snapshotService: SnapshotService,
  ) {}

  async generateWillPdf(
    userId: string,
    willId: string,
    format: PdfFormat = 'standard',
  ): Promise<GeneratedPdf> {
    const will = await this.willsService.findByUserIdAndWillId(userId, willId);
    if (!will) {
      throw new NotFoundException('Will not found');
    }

    const snapshot = await this.snapshotService.loadSnapshot(willId);
    const pdfData: WillPdfData = {
      title: will.title,
      generatedAt: new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' }),
      snapshot,
      format,
    };

    const html = buildWillPdfHtml(pdfData);
    const buffer = await this.renderHtmlToPdf(html);
    const filename = buildPdfFilename(will.title);

    this.logger.log(`PDF generated for willId=${willId} format=${format} bytes=${buffer.length}`);

    return { buffer, filename, html };
  }

  async renderHtmlToPdf(html: string): Promise<Buffer> {
    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || undefined;
    const browser = await puppeteer.launch({
      headless: true,
      executablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '18mm', bottom: '20mm', left: '18mm' },
        displayHeaderFooter: true,
        headerTemplate: '<div></div>',
        footerTemplate:
          '<div style="font-size:8px;width:100%;text-align:center;color:#666;">Lawyered Will Maker — Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
      });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }
}
