import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControlLabel,
  Grid,
  MenuItem,
  Skeleton,
  Stack,
  Switch,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import { AccountBalanceWallet as WalletIcon, Save as SaveIcon, DeleteOutlined as DeleteIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { paymentMethodService } from '../services/orderService';
import { getErrorMessage } from '../services/apiClient';
import type { PaymentMethodConfig, PaymentMethodType } from '../types/order';
import { PageHeader } from '../components/common/PageHeader';
import { SectionCard } from '../components/common/SectionCard';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { PAYMENT_METHOD_META } from '../utils/orderFormat';

const METHODS: PaymentMethodType[] = ['BKASH', 'NAGAD', 'ROCKET'];
const ACCOUNT_TYPES = ['Personal', 'Agent', 'Merchant'];

export const PaymentSettings: React.FC = () => {
  const [configs, setConfigs] = useState<PaymentMethodConfig[] | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    setError('');
    try {
      setConfigs(await paymentMethodService.list());
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load payment methods'));
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Box>
      <PageHeader
        title="Payment methods"
        subtitle="Receiving accounts shown to customers at checkout. Inactive or empty methods are hidden."
      />
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}
      <Grid container spacing={2.5}>
        {METHODS.map((method) => (
          <Grid key={method} size={{ xs: 12, md: 6, lg: 4 }}>
            {configs === null ? (
              <Skeleton variant="rounded" height={360} sx={{ borderRadius: '16px' }} />
            ) : (
              <MethodCard
                method={method}
                config={configs.find((c) => c.method === method) || null}
                onChange={(updated) =>
                  setConfigs((prev) => {
                    const rest = (prev || []).filter((c) => c.method !== method);
                    return updated ? [...rest, updated] : rest;
                  })
                }
              />
            )}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

const MethodCard: React.FC<{
  method: PaymentMethodType;
  config: PaymentMethodConfig | null;
  onChange: (config: PaymentMethodConfig | null) => void;
}> = ({ method, config, onChange }) => {
  const meta = PAYMENT_METHOD_META[method];
  const initial = {
    accountNumber: config?.accountNumber || '',
    accountType: config?.accountType || 'Personal',
    instructions: config?.instructions || '',
    isActive: config?.isActive ?? true,
  };
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setForm({
      accountNumber: config?.accountNumber || '',
      accountType: config?.accountType || 'Personal',
      instructions: config?.instructions || '',
      isActive: config?.isActive ?? true,
    });
  }, [config]);

  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const validNumber = /^\+?[0-9]{7,15}$/.test(form.accountNumber.replace(/[\s-]/g, ''));

  const save = async () => {
    setSaving(true);
    try {
      const saved = await paymentMethodService.save(method, form);
      onChange(saved);
      toast.success(`${meta.label} saved`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await paymentMethodService.remove(method);
      onChange(null);
      setConfirmDelete(false);
      toast.success(`${meta.label} removed`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const status = !config ? (
    <Chip label="Not set up" size="small" variant="outlined" />
  ) : config.isActive ? (
    <Chip label="Live at checkout" size="small" color="success" variant="outlined" sx={{ fontWeight: 600 }} />
  ) : (
    <Chip label="Hidden" size="small" variant="outlined" />
  );

  return (
    <SectionCard
      title={
        <Box component="span" sx={{ color: meta.color }}>
          {meta.label}
        </Box>
      }
      icon={
        <Box
          sx={{
            display: 'flex',
            p: 0.75,
            borderRadius: '8px',
            color: meta.color,
            bgcolor: alpha(meta.color, 0.12),
          }}
        >
          <WalletIcon fontSize="small" />
        </Box>
      }
      action={status}
      sx={{ height: '100%' }}
    >
      <Stack spacing={2}>
        <TextField
          label="Account number"
          placeholder="01XXXXXXXXX"
          value={form.accountNumber}
          onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
          error={Boolean(form.accountNumber) && !validNumber}
          helperText={form.accountNumber && !validNumber ? 'Enter a valid phone number' : ' '}
          fullWidth
        />
        <TextField
          select
          label="Account type"
          value={form.accountType}
          onChange={(e) => setForm({ ...form, accountType: e.target.value })}
          fullWidth
        >
          {ACCOUNT_TYPES.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Instructions for customers"
          placeholder={`e.g. Use "Send Money" in the ${meta.label} app and enter the TrxID below.`}
          value={form.instructions}
          onChange={(e) => setForm({ ...form, instructions: e.target.value })}
          multiline
          minRows={3}
          fullWidth
        />
        <FormControlLabel
          control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />}
          label={
            <Typography variant="body2">
              Show at checkout
            </Typography>
          }
        />
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
          {config ? (
            <Button color="error" startIcon={<DeleteIcon />} onClick={() => setConfirmDelete(true)}>
              Remove
            </Button>
          ) : (
            <span />
          )}
          <Button
            variant="contained"
            onClick={save}
            disabled={saving || !validNumber || (!dirty && Boolean(config))}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
          >
            {config ? 'Save changes' : 'Set up'}
          </Button>
        </Box>
      </Stack>
      <ConfirmDialog
        open={confirmDelete}
        title={`Remove ${meta.label}?`}
        description="Customers will no longer see this payment option at checkout."
        confirmLabel="Remove"
        confirmColor="error"
        loading={deleting}
        onConfirm={remove}
        onClose={() => setConfirmDelete(false)}
      />
    </SectionCard>
  );
};
