import React, { useEffect, useState } from 'react';
import { Avatar, Box, Button, Divider, Link, Stack, TextField, Typography, CircularProgress } from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Public as CountryIcon,
  ReceiptLong as SummaryIcon,
  StickyNote2 as NoteIcon,
  OpenInNew as OpenIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import type { OrderDetail } from '../../types/order';
import { SectionCard } from '../common/SectionCard';
import { CopyButton } from '../common/CopyButton';
import { formatBDT, formatDateTime } from '../../utils/orderFormat';

const whatsappLink = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  // Bangladeshi local numbers start with 01 — prefix the country code
  const intl = digits.startsWith('01') && digits.length === 11 ? `88${digits}` : digits;
  return `https://wa.me/${intl}`;
};

export const CustomerCard: React.FC<{ order: OrderDetail }> = ({ order }) => (
  <SectionCard
    title="Customer"
    icon={<PersonIcon fontSize="small" />}
    action={
      <Button
        size="small"
        component={RouterLink}
        to={`/dashboard/customers?customer=${order.customerId}`}
        endIcon={<OpenIcon sx={{ fontSize: 14 }} />}
      >
        Profile
      </Button>
    }
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
      <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 700 }}>{order.customerName.charAt(0).toUpperCase()}</Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body1" sx={{ fontWeight: 700 }} noWrap>
          {order.customerName}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Customer since {formatDateTime(order.customer.createdAt).split(',')[0]}
        </Typography>
      </Box>
    </Box>
    <Stack spacing={1.25}>
      <ContactRow icon={<EmailIcon fontSize="small" />} copy={order.customerEmail}>
        <Link href={`mailto:${order.customerEmail}`} underline="hover" color="inherit" sx={{ wordBreak: 'break-all' }}>
          {order.customerEmail}
        </Link>
      </ContactRow>
      <ContactRow icon={<WhatsAppIcon fontSize="small" sx={{ color: '#25D366' }} />} copy={order.customerPhone}>
        <Link href={whatsappLink(order.customerPhone)} target="_blank" rel="noopener" underline="hover" color="inherit">
          {order.customerPhone}
        </Link>
      </ContactRow>
      {order.country && (
        <ContactRow icon={<CountryIcon fontSize="small" />}>
          <Typography variant="body2">{order.country}</Typography>
        </ContactRow>
      )}
    </Stack>
    {order.customerNote && (
      <>
        <Divider sx={{ my: 2 }} />
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          Customer note
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
          {order.customerNote}
        </Typography>
      </>
    )}
  </SectionCard>
);

const ContactRow: React.FC<{ icon: React.ReactNode; copy?: string; children: React.ReactNode }> = ({
  icon,
  copy,
  children,
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, color: 'text.secondary' }}>
    {icon}
    <Box sx={{ flexGrow: 1, minWidth: 0, color: 'text.primary', typography: 'body2' }}>{children}</Box>
    {copy && <CopyButton value={copy} />}
  </Box>
);

export const OrderSummaryCard: React.FC<{ order: OrderDetail }> = ({ order }) => (
  <SectionCard title="Summary" icon={<SummaryIcon fontSize="small" />}>
    <Stack spacing={1}>
      <SummaryRow label="Subtotal" value={formatBDT(order.subtotal)} />
      {Number(order.discount) > 0 && <SummaryRow label="Discount" value={`− ${formatBDT(order.discount)}`} />}
      <Divider />
      <SummaryRow label="Total" value={formatBDT(order.total)} strong />
      <Divider />
      <SummaryRow label="Placed" value={formatDateTime(order.createdAt)} />
      <SummaryRow label="Last updated" value={formatDateTime(order.updatedAt)} />
      {order.deliveredAt && <SummaryRow label="Delivered" value={formatDateTime(order.deliveredAt)} />}
      {order.cancelledAt && <SummaryRow label="Cancelled" value={formatDateTime(order.cancelledAt)} />}
    </Stack>
  </SectionCard>
);

const SummaryRow: React.FC<{ label: string; value: string; strong?: boolean }> = ({ label, value, strong }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
      {label}
    </Typography>
    <Typography
      variant={strong ? 'subtitle1' : 'body2'}
      sx={{ fontWeight: strong ? 800 : 600, color: strong ? 'primary.main' : 'text.primary', textAlign: 'right' }}
    >
      {value}
    </Typography>
  </Box>
);

export const AdminNoteCard: React.FC<{ order: OrderDetail; onSave: (note: string) => Promise<void> }> = ({
  order,
  onSave,
}) => {
  const [note, setNote] = useState(order.adminNote || '');
  const [saving, setSaving] = useState(false);
  useEffect(() => setNote(order.adminNote || ''), [order.adminNote]);
  const dirty = note.trim() !== (order.adminNote || '').trim();

  const save = async () => {
    setSaving(true);
    try {
      await onSave(note.trim());
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard title="Internal note" subtitle="Only visible to admins" icon={<NoteIcon fontSize="small" />}>
      <TextField
        fullWidth
        multiline
        minRows={3}
        placeholder="Add a private note about this order…"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        slotProps={{ htmlInput: { maxLength: 2000 } }}
      />
      {dirty && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1.5 }}>
          <Button size="small" color="inherit" onClick={() => setNote(order.adminNote || '')} disabled={saving}>
            Discard
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={save}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}
          >
            Save note
          </Button>
        </Box>
      )}
    </SectionCard>
  );
};
