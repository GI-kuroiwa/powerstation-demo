import { useState } from 'react';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import type { Invoice } from '../../types';

const fmt = (n: number) => n.toLocaleString('ja-JP');

const DetailRow = ({ inv }: { inv: Invoice }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TableRow sx={{ bgcolor: 'rgba(239,83,80,0.06)' }}>
        <TableCell sx={{ width: 40 }}>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{inv.invoice_no}</TableCell>
        <TableCell>{inv.branch}</TableCell>
        <TableCell>{inv.customer_name}</TableCell>
        <TableCell align="right" sx={{ color: 'error.main', fontWeight: 700 }}>
          {inv.diff_amount > 0 ? '+' : ''}{fmt(inv.diff_amount)}円
        </TableCell>
        <TableCell sx={{ maxWidth: 320 }}>
          <Typography variant="body2" noWrap>{inv.reason_text}</Typography>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={6} sx={{ py: 0, borderBottom: open ? undefined : 'none' }}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ py: 2, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <DetailBlock title="基幹値" items={[
                ['税抜小計', fmt(inv.subtotal_ex_tax)],
                ['税額', fmt(inv.base_tax)],
                ['税込合計', fmt(inv.base_total)],
              ]} />
              <DetailBlock title="AI再計算" items={[
                ['値引後小計', fmt(inv.net_subtotal)],
                ['再計算税額', fmt(inv.computed_tax)],
                ['再計算合計', fmt(inv.computed_total)],
              ]} />
              <DetailBlock title="値引き情報" items={[
                ['適用値引額', fmt(inv.applied_discount)],
                ['値引方式', discountType(inv)],
              ]} />
            </Box>
            {inv.suggested_action && (
              <Typography variant="body2" sx={{ pb: 2, color: 'warning.main' }}>
                推奨対応: {inv.suggested_action}
              </Typography>
            )}
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

function discountType(inv: Invoice): string {
  if (inv.discount_amount !== null && inv.discount_rate !== null) return 'amount+rate (重複)';
  if (inv.discount_amount !== null) return 'amount';
  if (inv.discount_rate !== null) return 'rate';
  return 'none';
}

interface DetailBlockProps {
  title: string;
  items: [string, string][];
}

const DetailBlock = ({ title, items }: DetailBlockProps) => (
  <Box>
    <Typography variant="caption" fontWeight={700} sx={{ mb: 0.5, display: 'block' }}>{title}</Typography>
    {items.map(([k, v]) => (
      <Typography key={k} variant="body2">
        {k}: <strong>{v}</strong>
      </Typography>
    ))}
  </Box>
);

interface ExceptionsTabProps {
  exceptions: Invoice[];
}

export const ExceptionsTab = ({ exceptions }: ExceptionsTabProps) => (
  <TableContainer component={Paper} sx={{ mt: 2 }}>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell />
          <TableCell>請求番号</TableCell>
          <TableCell>営業所</TableCell>
          <TableCell>取引先</TableCell>
          <TableCell align="right">差額</TableCell>
          <TableCell>AI生成理由</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {exceptions.map((inv) => <DetailRow key={inv.invoice_no} inv={inv} />)}
      </TableBody>
    </Table>
  </TableContainer>
);
