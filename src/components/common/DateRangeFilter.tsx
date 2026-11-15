import React, { useMemo, useState } from 'react';
import { Box, Button, Divider, Menu, MenuItem, ListItemText, Typography } from '@mui/material';
import { CalendarMonth as CalendarIcon, ExpandMore as ExpandMoreIcon, Check as CheckIcon } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { ALL_TIME, DATE_PRESETS, presetRange } from '../../utils/dateRange';
import type { DateRange, PresetKey } from '../../utils/dateRange';

const FMT = 'YYYY-MM-DD';

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  allowAllTime?: boolean;
  maxDays?: number;
}

/** Preset menu (Today, Last 7 days, …) plus custom from/to pickers. */
export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ value, onChange, allowAllTime, maxDays = 366 }) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [customMode, setCustomMode] = useState(value.preset === 'custom');

  const label = useMemo(() => {
    if (value.preset === 'all') return 'All time';
    const preset = DATE_PRESETS.find((p) => p.key === value.preset);
    if (preset) return preset.label;
    return `${dayjs(value.from).format('DD MMM')} – ${dayjs(value.to).format('DD MMM YYYY')}`;
  }, [value]);

  const pick = (key: PresetKey) => {
    setAnchor(null);
    if (key === 'custom') {
      setCustomMode(true);
      if (value.preset === 'all') onChange({ ...presetRange('30d'), preset: 'custom' });
      else onChange({ ...value, preset: 'custom' });
      return;
    }
    setCustomMode(false);
    onChange(key === 'all' ? ALL_TIME : presetRange(key));
  };

  const setFrom = (d: Dayjs | null) => {
    if (!d || !d.isValid()) return;
    let to = value.to ? dayjs(value.to) : dayjs();
    if (d.isAfter(to)) to = d;
    if (to.diff(d, 'day') >= maxDays) to = d.add(maxDays - 1, 'day');
    onChange({ from: d.format(FMT), to: to.format(FMT), preset: 'custom' });
  };

  const setTo = (d: Dayjs | null) => {
    if (!d || !d.isValid()) return;
    let from = value.from ? dayjs(value.from) : d;
    if (d.isBefore(from)) from = d;
    if (d.diff(from, 'day') >= maxDays) from = d.subtract(maxDays - 1, 'day');
    onChange({ from: from.format(FMT), to: d.format(FMT), preset: 'custom' });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<CalendarIcon />}
          endIcon={<ExpandMoreIcon />}
          onClick={(e) => setAnchor(e.currentTarget)}
          sx={{ height: 40, borderColor: 'divider', fontWeight: 600, whiteSpace: 'nowrap' }}
          aria-haspopup="menu"
        >
          {label}
        </Button>
        <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
          {allowAllTime && (
            <MenuItem onClick={() => pick('all')} selected={value.preset === 'all'}>
              <ListItemText>All time</ListItemText>
              {value.preset === 'all' && <CheckIcon fontSize="small" />}
            </MenuItem>
          )}
          {DATE_PRESETS.map((p) => (
            <MenuItem key={p.key} onClick={() => pick(p.key)} selected={value.preset === p.key} sx={{ minWidth: 200 }}>
              <ListItemText>{p.label}</ListItemText>
              {value.preset === p.key && <CheckIcon fontSize="small" />}
            </MenuItem>
          ))}
          <Divider />
          <MenuItem onClick={() => pick('custom')} selected={value.preset === 'custom'}>
            <ListItemText>Custom range…</ListItemText>
          </MenuItem>
        </Menu>

        {(customMode || value.preset === 'custom') && value.preset !== 'all' && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <DatePicker
              label="From"
              value={value.from ? dayjs(value.from) : null}
              onChange={setFrom}
              maxDate={dayjs()}
              format="DD MMM YYYY"
              slotProps={{ textField: { size: 'small', sx: { width: 165 } } }}
            />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              to
            </Typography>
            <DatePicker
              label="To"
              value={value.to ? dayjs(value.to) : null}
              onChange={setTo}
              maxDate={dayjs()}
              format="DD MMM YYYY"
              slotProps={{ textField: { size: 'small', sx: { width: 165 } } }}
            />
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
};
