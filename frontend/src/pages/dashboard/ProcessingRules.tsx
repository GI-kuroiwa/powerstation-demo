import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsIcon from '@mui/icons-material/Settings';

const RULES = [
  '税率: 10%固定',
  '税計算: header税 floor（切捨て）',
  '差額許容: 0円のみ（±1円も例外）',
  '値引き優先: discount_amount > discount_rate > line_amount',
  '冪等: source_file_hash + invoice_no で UNIQUE',
];

export const ProcessingRules = () => (
  <Accordion
    disableGutters
    sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}
  >
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <SettingsIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
      <Typography variant="body2" fontWeight={600}>処理ルール</Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {RULES.map((r) => (
          <Chip key={r} label={r} size="small" variant="outlined" />
        ))}
      </Box>
    </AccordionDetails>
  </Accordion>
);
