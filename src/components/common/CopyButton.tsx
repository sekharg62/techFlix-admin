import React, { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { ContentCopy as CopyIcon, Check as CheckIcon } from '@mui/icons-material';

export const CopyButton: React.FC<{ value: string; label?: string }> = ({ value, label = 'Copy' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable (e.g. insecure context)
    }
  };

  return (
    <Tooltip title={copied ? 'Copied!' : label}>
      <IconButton size="small" onClick={handleCopy} aria-label={label} sx={{ color: 'text.secondary', p: 0.5 }}>
        {copied ? <CheckIcon sx={{ fontSize: 15, color: 'success.main' }} /> : <CopyIcon sx={{ fontSize: 15 }} />}
      </IconButton>
    </Tooltip>
  );
};
