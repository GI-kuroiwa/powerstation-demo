import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import type { Invoice } from '../../types';

interface AuditLogTabProps {
  invoices: Invoice[];
}

export const AuditLogTab = ({ invoices }: AuditLogTabProps) => (
  <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 480 }}>
    <Table size="small" stickyHeader>
      <TableHead>
        <TableRow>
          <TableCell>ファイルハッシュ</TableCell>
          <TableCell>請求番号</TableCell>
          <TableCell>営業所</TableCell>
          <TableCell>ステータス</TableCell>
          <TableCell align="right">差額</TableCell>
          <TableCell>例外コード</TableCell>
          <TableCell>重複スキップ</TableCell>
          <TableCell>承認者</TableCell>
          <TableCell>処理日時</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {invoices.map((inv) => (
          <TableRow key={inv.invoice_no}>
            <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
              {inv.source_file_hash.slice(0, 8)}...
            </TableCell>
            <TableCell>{inv.invoice_no}</TableCell>
            <TableCell>{inv.branch}</TableCell>
            <TableCell>
              <Chip
                label={inv.status}
                size="small"
                color={inv.status === 'OK' ? 'success' : 'error'}
                variant="filled"
                sx={{ fontWeight: 600, minWidth: 80 }}
              />
            </TableCell>
            <TableCell
              align="right"
              sx={{ color: inv.diff_amount !== 0 ? 'error.main' : 'success.main', fontWeight: 600 }}
            >
              {inv.diff_amount}
            </TableCell>
            <TableCell>{inv.reason_code || '-'}</TableCell>
            <TableCell>{inv.duplicate_skipped ? 'Yes' : 'No'}</TableCell>
            <TableCell>demo_user</TableCell>
            <TableCell sx={{ fontSize: '0.75rem' }}>
              {new Date(inv.created_at).toLocaleString('ja-JP')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);
