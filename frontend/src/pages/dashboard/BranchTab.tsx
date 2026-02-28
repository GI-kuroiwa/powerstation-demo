import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import type { BranchSummary } from '../../types';

interface BranchTabProps {
  branches: BranchSummary[];
}

export const BranchTab = ({ branches }: BranchTabProps) => (
  <TableContainer component={Paper} sx={{ mt: 2 }}>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>営業所</TableCell>
          <TableCell align="right">件数</TableCell>
          <TableCell align="right">例外件数</TableCell>
          <TableCell>最多例外コード</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {branches.map((b) => (
          <TableRow key={b.branch}>
            <TableCell sx={{ fontWeight: 600 }}>{b.branch}</TableCell>
            <TableCell align="right">{b.total}</TableCell>
            <TableCell
              align="right"
              sx={{ color: b.exceptions > 0 ? 'error.main' : 'success.main', fontWeight: 700 }}
            >
              {b.exceptions}
            </TableCell>
            <TableCell>
              {b.top_reason_code ? (
                <Chip label={b.top_reason_code} size="small" color="error" variant="outlined" />
              ) : (
                <Chip label="なし" size="small" color="success" variant="outlined" />
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);
