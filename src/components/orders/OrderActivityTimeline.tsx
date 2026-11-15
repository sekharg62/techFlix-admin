import React, { useMemo } from 'react';
import { Box, Typography, alpha, useTheme } from '@mui/material';
import { History as HistoryIcon } from '@mui/icons-material';
import type { OrderDetail } from '../../types/order';
import { SectionCard } from '../common/SectionCard';
import { ORDER_STATUS_META, PAYMENT_METHOD_META, formatBDT, formatDateTime, itemPlanLabel } from '../../utils/orderFormat';

type Tone = 'warning' | 'info' | 'success' | 'error' | 'grey';

interface ActivityEvent {
  id: string;
  at: string;
  title: string;
  detail?: string | null;
  by?: string | null;
  tone: Tone;
}

const toneForStatus: Record<string, Tone> = {
  PENDING: 'warning',
  PROCESSING: 'info',
  DELIVERED: 'success',
  CANCELLED: 'grey',
  REFUNDED: 'grey',
};

/** Merges status history, payment events and deliveries into one activity feed (newest first). */
export const OrderActivityTimeline: React.FC<{ order: OrderDetail }> = ({ order }) => {
  const theme = useTheme();

  const events = useMemo<ActivityEvent[]>(() => {
    const list: ActivityEvent[] = [];
    order.statusHistory.forEach((h) => {
      list.push({
        id: `s-${h.id}`,
        at: h.createdAt,
        title: h.fromStatus
          ? `Status: ${ORDER_STATUS_META[h.fromStatus].label} → ${ORDER_STATUS_META[h.toStatus].label}`
          : 'Order placed',
        detail: h.note,
        by: h.changedBy ? h.changedBy.name || h.changedBy.email : h.fromStatus ? null : order.customerName,
        tone: toneForStatus[h.toStatus],
      });
    });
    order.payments.forEach((p) => {
      list.push({
        id: `p-${p.id}`,
        at: p.createdAt,
        title: `${PAYMENT_METHOD_META[p.method].label} payment submitted`,
        detail: `${formatBDT(p.amount)} · TrxID ${p.trxId}`,
        by: order.customerName,
        tone: 'warning',
      });
      if (p.verifiedAt && p.status !== 'PENDING') {
        list.push({
          id: `pv-${p.id}`,
          at: p.verifiedAt,
          title: p.status === 'VERIFIED' ? 'Payment verified' : 'Payment rejected',
          detail: p.status === 'REJECTED' ? p.rejectionReason : `TrxID ${p.trxId}`,
          by: p.verifiedBy ? p.verifiedBy.name || p.verifiedBy.email : null,
          tone: p.status === 'VERIFIED' ? 'success' : 'error',
        });
      }
    });
    order.items.forEach((i) => {
      if (i.deliveredAt) {
        list.push({
          id: `d-${i.id}`,
          at: i.deliveredAt,
          title: 'Item delivered',
          detail: `${i.productName} — ${itemPlanLabel(i)}`,
          tone: 'success',
        });
      }
    });
    // Newest first; on identical timestamps keep a stable logical order
    return list.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  }, [order]);

  const colorFor = (tone: Tone) => (tone === 'grey' ? theme.palette.grey[500] : theme.palette[tone].main);

  return (
    <SectionCard title="Activity" icon={<HistoryIcon fontSize="small" />}>
      <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {events.map((event, index) => {
          const color = colorFor(event.tone);
          const isLast = index === events.length - 1;
          return (
            <Box component="li" key={event.id} sx={{ display: 'flex', gap: 1.5 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0.5 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: color,
                    boxShadow: `0 0 0 4px ${alpha(color, 0.15)}`,
                    flexShrink: 0,
                  }}
                />
                {!isLast && <Box sx={{ width: 2, flexGrow: 1, my: 0.5, backgroundColor: 'divider' }} />}
              </Box>
              <Box sx={{ pb: isLast ? 0 : 2.25, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {event.title}
                </Typography>
                {event.detail && (
                  <Typography variant="body2" sx={{ color: 'text.secondary', wordBreak: 'break-word' }}>
                    {event.detail}
                  </Typography>
                )}
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {formatDateTime(event.at)}
                  {event.by ? ` · ${event.by}` : ''}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </SectionCard>
  );
};
