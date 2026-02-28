import { useCallback, useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface CsvDropZoneProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  disabled: boolean;
}

export const CsvDropZone = ({ file, onFileSelect, disabled }: CsvDropZoneProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((files: FileList | null) => {
    setError(null);
    if (!files || files.length === 0) return;
    if (files.length > 1) {
      setError('1ファイルずつアップロードしてください');
      return;
    }
    const f = files[0];
    if (!f.name.endsWith('.csv')) {
      setError('CSVファイルのみ対応しています');
      return;
    }
    onFileSelect(f);
  }, [onFileSelect]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    handleFile(e.dataTransfer.files);
  }, [disabled, handleFile]);

  return (
    <Box>
      <Paper
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        sx={{
          p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5,
          border: '2px dashed', cursor: disabled ? 'default' : 'pointer',
          borderColor: dragOver ? 'primary.main' : file ? 'success.main' : 'divider',
          bgcolor: dragOver ? 'rgba(92,156,230,0.08)' : 'background.paper',
          transition: 'all 0.2s',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <CloudUploadIcon sx={{ fontSize: 44, color: file ? 'success.main' : 'text.secondary' }} />
        {file ? (
          <Typography variant="body1" color="success.main" fontWeight={600}>
            {file.name}（{(file.size / 1024).toFixed(1)} KB）
          </Typography>
        ) : (
          <>
            <Typography variant="body1" color="text.secondary" fontWeight={500}>
              CSVファイルをドラッグ&ドロップ
            </Typography>
            <Typography variant="caption">またはクリックしてファイルを選択</Typography>
          </>
        )}
        <input
          ref={inputRef} type="file" accept=".csv" hidden
          onChange={(e) => handleFile(e.target.files)}
        />
      </Paper>
      {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
    </Box>
  );
};
