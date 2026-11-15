import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

export interface DateRange {
  from: string; // YYYY-MM-DD
  to: string;
  preset: PresetKey;
}

export type PresetKey = 'today' | 'yesterday' | '7d' | '30d' | 'thisMonth' | 'lastMonth' | '90d' | 'custom' | 'all';

const FMT = 'YYYY-MM-DD';

export const DATE_PRESETS: { key: Exclude<PresetKey, 'custom' | 'all'>; label: string; range: () => [Dayjs, Dayjs] }[] = [
  { key: 'today', label: 'Today', range: () => [dayjs(), dayjs()] },
  { key: 'yesterday', label: 'Yesterday', range: () => [dayjs().subtract(1, 'day'), dayjs().subtract(1, 'day')] },
  { key: '7d', label: 'Last 7 days', range: () => [dayjs().subtract(6, 'day'), dayjs()] },
  { key: '30d', label: 'Last 30 days', range: () => [dayjs().subtract(29, 'day'), dayjs()] },
  { key: 'thisMonth', label: 'This month', range: () => [dayjs().startOf('month'), dayjs()] },
  {
    key: 'lastMonth',
    label: 'Last month',
    range: () => [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')],
  },
  { key: '90d', label: 'Last 90 days', range: () => [dayjs().subtract(89, 'day'), dayjs()] },
];

export const presetRange = (key: Exclude<PresetKey, 'custom' | 'all'>): DateRange => {
  const preset = DATE_PRESETS.find((p) => p.key === key)!;
  const [from, to] = preset.range();
  return { from: from.format(FMT), to: to.format(FMT), preset: key };
};

export const ALL_TIME: DateRange = { from: '', to: '', preset: 'all' };
