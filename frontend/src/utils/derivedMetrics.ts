import type { Invoice, ReasonCode } from '../types';

export interface BranchExceptionCount {
  branch: string;
  exceptions: number;
  total: number;
}

export interface ReasonCodeCount {
  reasonCode: ReasonCode;
  count: number;
}

export interface JournalPreviewRow {
  invoiceNo: string;
  branch: string;
  customerName: string;
  netSubtotal: number;
  computedTax: number;
  computedTotal: number;
  confidence: number;
}

export interface BranchProfitEstimate {
  branch: string;
  revenue: number;
  estimatedCost: number;
  grossProfit: number;
  profitMargin: number;
}

export interface DerivedMetrics {
  okCount: number;
  exceptionCount: number;
  totalCount: number;
  automationRate: number;
  byBranch: BranchExceptionCount[];
  byReason: ReasonCodeCount[];
  topBranch: string | null;
  topReasonCode: ReasonCode | null;
  exceptionRate: number;
  journalPreview: JournalPreviewRow[];
  branchProfit: BranchProfitEstimate[];
  totalRevenue: number;
  totalGrossProfit: number;
  totalProfitMargin: number;
}

/** 営業所別の擬似原価率（デモ用） */
const COST_RATIOS: Record<string, number> = {
  '東京本社': 0.72,
  '大阪支社': 0.75,
  '名古屋支社': 0.70,
  '福岡支社': 0.74,
  '仙台支社': 0.71,
};
const DEFAULT_COST_RATIO = 0.73;

/** invoice_no から再現性のある擬似 confidence (0.95〜0.99) を生成 */
const pseudoConfidence = (invoiceNo: string): number => {
  let hash = 0;
  for (let i = 0; i < invoiceNo.length; i++) {
    hash = ((hash << 5) - hash + invoiceNo.charCodeAt(i)) | 0;
  }
  return 0.95 + (Math.abs(hash) % 500) / 10000;
};

/**
 * result.audit_logs（全invoices）から連動メトリクスを算出する純関数。
 * 既存タブのロジック・状態には一切干渉しない。
 */
export const derivedMetrics = (invoices: Invoice[]): DerivedMetrics => {
  const okCount = invoices.filter((inv) => inv.status === 'OK').length;
  const exceptionCount = invoices.filter((inv) => inv.status === 'EXCEPTION').length;
  const totalCount = invoices.length;
  const automationRate = totalCount > 0 ? okCount / totalCount : 0;
  const exceptionRate = totalCount > 0 ? exceptionCount / totalCount : 0;

  // 営業所別例外件数
  const branchMap = new Map<string, { exceptions: number; total: number }>();
  for (const inv of invoices) {
    const entry = branchMap.get(inv.branch) ?? { exceptions: 0, total: 0 };
    entry.total++;
    if (inv.status === 'EXCEPTION') entry.exceptions++;
    branchMap.set(inv.branch, entry);
  }
  const byBranch: BranchExceptionCount[] = Array.from(branchMap.entries())
    .map(([branch, { exceptions, total }]) => ({ branch, exceptions, total }))
    .sort((a, b) => b.exceptions - a.exceptions);

  // reason_code別件数
  const reasonMap = new Map<ReasonCode, number>();
  for (const inv of invoices) {
    if (inv.reason_code) {
      reasonMap.set(inv.reason_code, (reasonMap.get(inv.reason_code) ?? 0) + 1);
    }
  }
  const byReason: ReasonCodeCount[] = Array.from(reasonMap.entries())
    .map(([reasonCode, count]) => ({ reasonCode, count }))
    .sort((a, b) => b.count - a.count);

  const topBranch = byBranch.length > 0 ? byBranch[0].branch : null;
  const topReasonCode = byReason.length > 0 ? byReason[0].reasonCode : null;

  // 仕訳プレビュー（OKのみ上位20件）
  const journalPreview: JournalPreviewRow[] = invoices
    .filter((inv) => inv.status === 'OK')
    .slice(0, 20)
    .map((inv) => ({
      invoiceNo: inv.invoice_no,
      branch: inv.branch,
      customerName: inv.customer_name,
      netSubtotal: inv.net_subtotal,
      computedTax: inv.computed_tax,
      computedTotal: inv.computed_total,
      confidence: pseudoConfidence(inv.invoice_no),
    }));

  // 営業所別利益推定（OKの請求書のみ）
  const revenueMap = new Map<string, number>();
  for (const inv of invoices) {
    if (inv.status === 'OK') {
      revenueMap.set(inv.branch, (revenueMap.get(inv.branch) ?? 0) + inv.net_subtotal);
    }
  }
  const branchProfit: BranchProfitEstimate[] = Array.from(revenueMap.entries()).map(([branch, revenue]) => {
    const costRatio = COST_RATIOS[branch] ?? DEFAULT_COST_RATIO;
    const estimatedCost = Math.floor(revenue * costRatio);
    const grossProfit = revenue - estimatedCost;
    return { branch, revenue, estimatedCost, grossProfit, profitMargin: revenue > 0 ? grossProfit / revenue : 0 };
  }).sort((a, b) => b.grossProfit - a.grossProfit);

  const totalRevenue = branchProfit.reduce((s, b) => s + b.revenue, 0);
  const totalGrossProfit = branchProfit.reduce((s, b) => s + b.grossProfit, 0);
  const totalProfitMargin = totalRevenue > 0 ? totalGrossProfit / totalRevenue : 0;

  return {
    okCount,
    exceptionCount,
    totalCount,
    automationRate,
    exceptionRate,
    byBranch,
    byReason,
    topBranch,
    topReasonCode,
    journalPreview,
    branchProfit,
    totalRevenue,
    totalGrossProfit,
    totalProfitMargin,
  };
};
