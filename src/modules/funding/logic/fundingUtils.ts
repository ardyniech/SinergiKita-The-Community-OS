export interface ProgressSummary {
  percent: number;
  remainingAmount: number;
  isFullyFunded: boolean;
  donorBadge: string;
}

export function calculateProjectProgress(collected: number, target: number): ProgressSummary {
  const safeTarget = Math.max(1, target || 1);
  const safeCollected = Math.max(0, collected || 0);
  const rawPercent = Math.round((safeCollected / safeTarget) * 100);
  const percent = Math.min(100, rawPercent);
  const remainingAmount = Math.max(0, safeTarget - safeCollected);
  const isFullyFunded = safeCollected >= safeTarget;

  let donorBadge = 'Warga Peduli';
  if (percent >= 100) {
    donorBadge = 'Target Tercapai';
  } else if (percent >= 75) {
    donorBadge = 'Hampir Tuntas';
  } else if (percent >= 50) {
    donorBadge = 'Separuh Jalan';
  }

  return {
    percent,
    remainingAmount,
    isFullyFunded,
    donorBadge
  };
}

export function generateProjectShareText(params: {
  tenantName: string;
  projectTitle: string;
  category: string;
  targetAmount: number;
  collectedAmount: number;
  percent: number;
}): string {
  const lines = [
    `🚀 *PATUNGAN WARGA & DONASI PROYEK*`,
    `Komunitas: *${params.tenantName}*`,
    `\n📋 *${params.projectTitle}* (${params.category.toUpperCase()})`,
    `💰 Terkumpul: *Rp ${params.collectedAmount.toLocaleString('id-ID')}* (${params.percent}%)`,
    `🎯 Target Dana: Rp ${params.targetAmount.toLocaleString('id-ID')}`,
    `\nMari bersama bergotong royong mewujudkan proyek kebaikan ini melalui SinergiKita! 🙏`
  ];
  return lines.join('\n');
}

export function generateCertificateData(params: {
  contributorName: string;
  projectTitle: string;
  amount: number;
  tenantName: string;
  dateStr: string;
}) {
  const certId = `CERT-CF-${Math.abs(params.amount * 31).toString(16).toUpperCase().slice(0, 6)}`;
  return {
    certId,
    title: 'PIAGAM APRESIASI GOTONG ROYONG',
    subtitle: 'Diberikan sebagai bentuk penghargaan atas partisipasi nyata:',
    contributorName: params.contributorName,
    amountStr: `Rp ${params.amount.toLocaleString('id-ID')}`,
    projectTitle: params.projectTitle,
    tenantName: params.tenantName,
    dateStr: params.dateStr
  };
}
