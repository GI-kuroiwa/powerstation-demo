import type { Invoice, Summary, BranchSummary, BranchStatus } from '../types';

const JOB_ID = 'mock-job-001';
const HASH = 'abc123def456';
const TS = '2026-02-28T10:00:00Z';

function okInvoice(branch: string, no: string, customer: string, subtotal: number): Invoice {
  const tax = Math.floor(subtotal * 0.1);
  return {
    id: 0, job_id: JOB_ID, source_file_hash: HASH, branch, invoice_no: no,
    customer_name: customer, subtotal_ex_tax: subtotal,
    discount_amount: null, discount_rate: null, applied_discount: 0,
    net_subtotal: subtotal, computed_tax: tax, computed_total: subtotal + tax,
    base_tax: tax, base_total: subtotal + tax, diff_amount: 0,
    status: 'OK', reason_code: null, reason_text: null, suggested_action: null,
    duplicate_skipped: false, created_at: TS,
  };
}

const CUSTOMERS_A = [
  'アルファ商事', 'ベータ工業', 'ガンマ物産', 'デルタ運輸', 'イプシロン建設',
  'ゼータ食品', 'エータ電機', 'シータ製薬', 'イオタ化学', 'カッパ通商',
  'ラムダ機械', 'ミュー金属', 'ニュー繊維', 'クシー自動車', 'オミクロン印刷',
  'パイ不動産', 'ロー物流', 'シグマ精密', 'タウ産業', 'ウプシロン商会',
  'ファイ電工', 'カイ石油', 'プサイ塗装', 'オメガ設備', 'アルファ第二商事',
  'ベータ第二工業', 'ガンマ第二物産', 'デルタ第二運輸', 'イプシロン第二建設', 'ゼータ第二食品',
];

const CUSTOMERS_B = [
  '北日本商事', '南日本工業', '東日本物産', '西日本運輸', '中央建設',
  '大和食品', '武蔵電機', '相模製薬', '甲斐化学', '信濃通商',
  '越後機械', '加賀金属', '能登繊維', '越中自動車', '飛騨印刷',
  '美濃不動産', '尾張物流', '三河精密', '遠江産業', '駿河商会',
  '伊豆電工', '箱根石油', '富士塗装', '浅間設備', '八ヶ岳商事',
  '諏訪工業', '松本物産', '長野運輸', '上田建設', '小諸食品',
];

const CUSTOMERS_C = [
  '九州商事', '博多工業', '長崎物産', '熊本運輸', '鹿児島建設',
  '宮崎食品', '大分電機', '佐賀製薬', '沖縄化学', '那覇通商',
  '久留米機械', '北九州金属', '別府繊維', '天草自動車', '阿蘇印刷',
  '雲仙不動産', '桜島物流', '霧島精密', '指宿産業', '屋久島商会',
  '奄美電工', '種子島石油', '対馬塗装', '壱岐設備', '五島商事',
  '平戸工業', '島原物産', '日田運輸', '竹田建設', '臼杵食品',
];

function buildBranchA(): Invoice[] {
  return CUSTOMERS_A.map((c, i) => {
    const subtotal = 100000 + i * 5000;
    return { ...okInvoice('A営業所', `INV-A-${String(i + 1).padStart(3, '0')}`, c, subtotal), id: i + 1 };
  });
}

function buildBranchB(): Invoice[] {
  return CUSTOMERS_B.map((c, i) => {
    const no = `INV-B-${String(i + 1).padStart(3, '0')}`;
    const subtotal = 80000 + i * 3000;
    const inv = { ...okInvoice('B営業所', no, c, subtotal), id: 31 + i };
    if (i === 4) {
      inv.discount_rate = 0.05;
      inv.applied_discount = Math.floor(subtotal * 0.05);
      inv.net_subtotal = subtotal - inv.applied_discount;
      inv.computed_tax = Math.floor(inv.net_subtotal * 0.1);
      inv.computed_total = inv.net_subtotal + inv.computed_tax;
      inv.base_total = inv.computed_total + 15;
      inv.diff_amount = inv.computed_total - inv.base_total;
      inv.status = 'EXCEPTION';
      inv.reason_code = 'DISCOUNT_MISMATCH';
      inv.reason_text = '値引き率5%を適用した再計算結果と基幹合計に15円の差額。'
        + '端数処理の違いが原因と推定されます。';
      inv.suggested_action = '基幹システムの値引き計算・端数処理設定を確認してください。';
    }
    if (i === 18) {
      inv.discount_amount = 5000;
      inv.discount_rate = 0.03;
      inv.applied_discount = 0;
      inv.net_subtotal = subtotal;
      inv.computed_tax = Math.floor(subtotal * 0.1);
      inv.computed_total = subtotal + inv.computed_tax;
      inv.diff_amount = 0;
      inv.status = 'EXCEPTION';
      inv.reason_code = 'MULTI_DISCOUNT';
      inv.reason_text = 'discount_amountとdiscount_rateが同時に指定されています。'
        + '値引き方式を一つに統一してください。';
      inv.suggested_action = 'discount_amountまたはdiscount_rateのいずれか一方のみを指定してください。';
    }
    return inv;
  });
}

function buildBranchC(): Invoice[] {
  return CUSTOMERS_C.map((c, i) => {
    const no = `INV-C-${String(i + 1).padStart(3, '0')}`;
    const subtotal = 120000 + i * 4000;
    const inv = { ...okInvoice('C営業所', no, c, subtotal), id: 61 + i };
    if (i === 2) {
      inv.base_tax = inv.computed_tax + 1;
      inv.base_total = inv.net_subtotal + inv.base_tax;
      inv.diff_amount = inv.computed_total - inv.base_total;
      inv.status = 'EXCEPTION';
      inv.reason_code = 'TAX_MISMATCH';
      inv.reason_text = '税額が1円不一致。基幹税額が切上げで計算されている可能性があります。';
      inv.suggested_action = '基幹システムの端数処理設定（切捨て/四捨五入/切上げ）を確認してください。';
    }
    if (i === 7) {
      inv.base_tax = inv.computed_tax + 3;
      inv.base_total = inv.net_subtotal + inv.base_tax;
      inv.diff_amount = inv.computed_total - inv.base_total;
      inv.status = 'EXCEPTION';
      inv.reason_code = 'TAX_MISMATCH';
      inv.reason_text = '税額が3円不一致。四捨五入と切捨ての差が原因と推定されます。';
      inv.suggested_action = '端数処理方式を統一してください。';
    }
    if (i === 12) {
      inv.base_total = inv.computed_total + 50;
      inv.diff_amount = inv.computed_total - inv.base_total;
      inv.status = 'EXCEPTION';
      inv.reason_code = 'TOTAL_MISMATCH';
      inv.reason_text = '税込合計が50円不一致。手入力ミスの可能性があります。';
      inv.suggested_action = '請求書の税込合計を再確認してください。';
    }
    if (i === 20) {
      inv.base_tax = inv.computed_tax - 2;
      inv.base_total = inv.net_subtotal + inv.base_tax;
      inv.diff_amount = inv.computed_total - inv.base_total;
      inv.status = 'EXCEPTION';
      inv.reason_code = 'TAX_MISMATCH';
      inv.reason_text = '税額が2円不一致。行別税計算の合算との差が原因と推定されます。';
      inv.suggested_action = '税計算粒度（ヘッダ税 vs 行別税）の設定を確認してください。';
    }
    if (i === 25) {
      inv.base_total = inv.computed_total - 100;
      inv.diff_amount = inv.computed_total - inv.base_total;
      inv.status = 'EXCEPTION';
      inv.reason_code = 'TOTAL_MISMATCH';
      inv.reason_text = '税込合計が100円不一致。値引き未反映の可能性があります。';
      inv.suggested_action = '値引き適用の有無と金額を確認してください。';
    }
    return inv;
  });
}

export function buildMockInvoices(): Invoice[] {
  return [...buildBranchA(), ...buildBranchB(), ...buildBranchC()];
}

export function buildMockSummary(): Summary {
  return { total: 90, ok: 83, exceptions: 7, exception_rate: 7.8, duration_sec: 12.3 };
}

export function buildMockBranchSummary(): BranchSummary[] {
  return [
    { branch: 'A営業所', total: 30, exceptions: 0, top_reason_code: null },
    { branch: 'B営業所', total: 30, exceptions: 2, top_reason_code: 'DISCOUNT_MISMATCH' },
    { branch: 'C営業所', total: 30, exceptions: 5, top_reason_code: 'TAX_MISMATCH' },
  ];
}

export function buildMockBranchStatus(): BranchStatus {
  return {
    'A営業所': { total: 30, processed: 30, status: 'done' },
    'B営業所': { total: 30, processed: 30, status: 'done' },
    'C営業所': { total: 30, processed: 30, status: 'done' },
  };
}
