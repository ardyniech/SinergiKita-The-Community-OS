import { describe, it, expect } from 'vitest';
import { calculateProjectProgress, generateProjectShareText, generateCertificateData } from '../src/modules/funding/logic/fundingUtils';

describe('Funding & Crowdfunding Module Logic', () => {
  it('happy path: calculateProjectProgress calculates percentage, remaining, and donor badges accurately', () => {
    const progress = calculateProjectProgress(3500000, 5000000);
    expect(progress.percent).toBe(70);
    expect(progress.remainingAmount).toBe(1500000);
    expect(progress.isFullyFunded).toBe(false);
    expect(progress.donorBadge).toBe('Separuh Jalan');
  });

  it('happy path: calculateProjectProgress flags fully funded projects and caps percentage at 100', () => {
    const progress = calculateProjectProgress(6000000, 5000000);
    expect(progress.percent).toBe(100);
    expect(progress.remainingAmount).toBe(0);
    expect(progress.isFullyFunded).toBe(true);
    expect(progress.donorBadge).toBe('Target Tercapai');
  });

  it('error & edge path: calculateProjectProgress handles zero target and negative amounts safely', () => {
    const progress = calculateProjectProgress(-500, 0);
    expect(progress.percent).toBe(0);
    expect(progress.remainingAmount).toBe(1);
    expect(progress.isFullyFunded).toBe(false);
  });

  it('generates WhatsApp broadcast text correctly for fundraising projects', () => {
    const shareText = generateProjectShareText({
      tenantName: 'RT 05 RW 02',
      projectTitle: 'Renovasi Pos Ronda',
      category: 'infrastructure',
      targetAmount: 5000000,
      collectedAmount: 2500000,
      percent: 50
    });

    expect(shareText).toContain('RT 05 RW 02');
    expect(shareText).toContain('Renovasi Pos Ronda');
    expect(shareText).toContain('INFRASTRUCTURE');
    expect(shareText).toContain('2.500.000');
    expect(shareText).toContain('50%');
  });

  it('generates digital donor certificate metadata properly', () => {
    const cert = generateCertificateData({
      contributorName: 'Budi Santoso',
      projectTitle: 'Penerangan Jalan Warga',
      amount: 150000,
      tenantName: 'RW 08 Sukamaju',
      dateStr: '21 Agustus 2026'
    });

    expect(cert.certId).toMatch(/^CERT-CF-/);
    expect(cert.contributorName).toBe('Budi Santoso');
    expect(cert.projectTitle).toBe('Penerangan Jalan Warga');
    expect(cert.amountStr).toContain('150.000');
    expect(cert.tenantName).toBe('RW 08 Sukamaju');
  });
});
