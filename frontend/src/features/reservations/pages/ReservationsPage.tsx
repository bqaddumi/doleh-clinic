import { zodResolver } from '@hookform/resolvers/zod';
import AddIcon from '@mui/icons-material/Add';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { AppDialog } from '../../../components/AppDialog';
import { DataTable } from '../../../components/DataTable';
import { EmptyState } from '../../../components/EmptyState';
import { LoadingScreen } from '../../../components/LoadingScreen';
import { PageHeader } from '../../../components/PageHeader';
import { useAuth } from '../../../hooks/useAuth';
import { useLanguage } from '../../../hooks/useLanguage';
import { formatDateTime, getErrorMessage } from '../../../lib/format';
import { Reservation, ReservationStatus } from '../../../types';
import {
  ReservationAdminPayload,
  ReservationFilters,
  useReservations,
  useUpdateReservationByAdmin
} from '../api';
import { PublicReservationForm } from '../components/PublicReservationForm';

const statusColorMap: Record<ReservationStatus, 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  accepted: 'success',
  rejected: 'error'
};

const toDateTimeInputValue = (value?: string | null) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
};

export const ReservationsPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isAdmin = user?.role === 'admin';
  const [filters, setFilters] = useState<ReservationFilters>({
    status: '',
    date: '',
    page: 1,
    limit: 10
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const reservationsQuery = useReservations(filters);
  const updateReservation = useUpdateReservationByAdmin();
  const adminSchema = z.object({
    scheduledAt: z.string().min(1, t('validation.dateRequired')),
    status: z.enum(['pending', 'accepted', 'rejected']),
    adminNotes: z.string().max(2000).optional()
  });

  const adminForm = useForm<ReservationAdminPayload>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      scheduledAt: '',
      status: 'pending',
      adminNotes: ''
    }
  });

  const openAdminDialog = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    adminForm.reset({
      scheduledAt: toDateTimeInputValue(reservation.scheduledAt),
      status: reservation.status,
      adminNotes: reservation.adminNotes || ''
    });
  };

  const handleAdminSave = adminForm.handleSubmit(async (values) => {
    if (!selectedReservation) {
      return;
    }

    try {
      setFeedback(null);
      await updateReservation.mutateAsync({
        reservationId: selectedReservation._id,
        payload: values
      });
      setSelectedReservation(null);
      setFeedback({ type: 'success', text: t('reservationsPage.updateSuccess') });
    } catch (error) {
      setFeedback({ type: 'error', text: getErrorMessage(error) });
    }
  });

  const handleQuickStatusChange = async (reservation: Reservation, status: ReservationStatus) => {
    try {
      setFeedback(null);
      await updateReservation.mutateAsync({
        reservationId: reservation._id,
        payload: {
          scheduledAt: toDateTimeInputValue(reservation.scheduledAt),
          status,
          adminNotes: reservation.adminNotes || ''
        }
      });
      setFeedback({ type: 'success', text: t('reservationsPage.updateSuccess') });
    } catch (error) {
      setFeedback({ type: 'error', text: getErrorMessage(error) });
    }
  };

  if (reservationsQuery.isLoading) {
    return <LoadingScreen />;
  }

  if (reservationsQuery.isError) {
    return <Alert severity="error">{getErrorMessage(reservationsQuery.error)}</Alert>;
  }

  const rows = reservationsQuery.data?.items || [];

  return (
    <Box>
      <PageHeader
        title={t('common.reservations')}
        subtitle={isAdmin ? t('reservationsPage.adminSubtitle') : t('reservationsPage.patientSubtitle')}
        action={
          isAdmin ? (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)}>
              {t('reservationsPage.addReservation')}
            </Button>
          ) : null
        }
      />

      {feedback ? <Alert severity={feedback.type} sx={{ mb: 2 }}>{feedback.text}</Alert> : null}

      {isAdmin ? (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              label={t('common.status')}
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as ReservationFilters['status'], page: 1 }))}
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="">{t('reservationsPage.allStatuses')}</MenuItem>
              <MenuItem value="pending">{t('common.pending')}</MenuItem>
              <MenuItem value="accepted">{t('common.accepted')}</MenuItem>
              <MenuItem value="rejected">{t('common.rejected')}</MenuItem>
            </TextField>
            <TextField
              type="date"
              label={t('common.date')}
              value={filters.date}
              onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value, page: 1 }))}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 220 }}
            />
          </Stack>
        </Paper>
      ) : (
        <Card id="reservation-form" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('reservationsPage.newReservationTitle')}
            </Typography>
            <PublicReservationForm />
          </CardContent>
        </Card>
      )}

      {rows.length ? (
        <Stack spacing={2}>
          <DataTable<Reservation>
            rowKey={(row) => row._id}
            rows={rows}
            columns={
              isAdmin
                ? [
                    {
                      key: 'patient',
                      header: t('common.patient'),
                      render: (row) => (
                        <Stack spacing={0.25}>
                          <Typography>{row.fullName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {row.phone}
                          </Typography>
                        </Stack>
                      )
                    },
                    { key: 'scheduledAt', header: t('reservationsPage.reservationDateTime'), render: (row) => formatDateTime(row.scheduledAt) },
                    {
                      key: 'status',
                      header: t('common.status'),
                      render: (row) => <Chip size="small" color={statusColorMap[row.status]} label={t(`common.${row.status}` as const)} />
                    },
                    { key: 'notes', header: t('common.notes'), render: (row) => row.notes || t('common.notAvailable') },
                    { key: 'adminNotes', header: t('reservationsPage.adminNotes'), render: (row) => row.adminNotes || t('common.notAvailable') },
                    {
                      key: 'actions',
                      header: t('reservationsPage.quickActions'),
                      render: (row) =>
                        row.status === 'pending' ? (
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => void handleQuickStatusChange(row, 'accepted')}
                              disabled={updateReservation.isPending}
                            >
                              {t('common.accept')}
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => void handleQuickStatusChange(row, 'rejected')}
                              disabled={updateReservation.isPending}
                            >
                              {t('common.reject')}
                            </Button>
                          </Stack>
                        ) : (
                          <Typography color="text.secondary">-</Typography>
                        )
                    },
                    {
                      key: 'manage',
                      header: t('common.actions'),
                      render: (row) => (
                        <Button variant="outlined" startIcon={<EditCalendarIcon />} onClick={() => openAdminDialog(row)}>
                          {t('reservationsPage.manageReservation')}
                        </Button>
                      )
                    }
                  ]
                : [
                    { key: 'scheduledAt', header: t('reservationsPage.reservationDateTime'), render: (row) => formatDateTime(row.scheduledAt) },
                    {
                      key: 'status',
                      header: t('common.status'),
                      render: (row) => <Chip size="small" color={statusColorMap[row.status]} label={t(`common.${row.status}` as const)} />
                    },
                    { key: 'notes', header: t('common.notes'), render: (row) => row.notes || t('common.notAvailable') },
                    { key: 'adminNotes', header: t('reservationsPage.adminNotes'), render: (row) => row.adminNotes || t('common.notAvailable') },
                    { key: 'reviewedAt', header: t('reservationsPage.reviewedAt'), render: (row) => formatDateTime(row.reviewedAt) }
                  ]
            }
          />

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography color="text.secondary">
              {t('reservationsPage.totalReservations', { count: reservationsQuery.data?.pagination.total || 0 })}
            </Typography>
            <Pagination
              page={filters.page}
              count={reservationsQuery.data?.pagination.totalPages || 1}
              onChange={(_, page) => setFilters((current) => ({ ...current, page }))}
            />
          </Stack>
        </Stack>
      ) : (
        <EmptyState
          title={isAdmin ? t('reservationsPage.noReservationsTitle') : t('reservationsPage.noOwnReservationsTitle')}
          description={isAdmin ? t('reservationsPage.noReservationsDescription') : t('reservationsPage.noOwnReservationsDescription')}
        />
      )}

      <AppDialog open={Boolean(selectedReservation)} title={t('reservationsPage.manageReservation')} onClose={() => setSelectedReservation(null)}>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Controller
            name="scheduledAt"
            control={adminForm.control}
            render={({ field }) => (
              <TextField
                {...field}
                type="datetime-local"
                label={t('reservationsPage.reservationDateTime')}
                slotProps={{ inputLabel: { shrink: true } }}
                error={Boolean(adminForm.formState.errors.scheduledAt)}
                helperText={adminForm.formState.errors.scheduledAt?.message}
                fullWidth
              />
            )}
          />
          <Controller
            name="status"
            control={adminForm.control}
            render={({ field }) => (
              <TextField {...field} select label={t('common.status')} fullWidth>
                <MenuItem value="pending">{t('common.pending')}</MenuItem>
                <MenuItem value="accepted">{t('common.accepted')}</MenuItem>
                <MenuItem value="rejected">{t('common.rejected')}</MenuItem>
              </TextField>
            )}
          />
          <Controller
            name="adminNotes"
            control={adminForm.control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t('reservationsPage.adminNotes')}
                multiline
                minRows={3}
                fullWidth
              />
            )}
          />
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button onClick={() => setSelectedReservation(null)}>{t('common.cancel')}</Button>
            <Button variant="contained" onClick={handleAdminSave} disabled={updateReservation.isPending}>
              {updateReservation.isPending ? t('common.saving') : t('common.save')}
            </Button>
          </Stack>
        </Stack>
      </AppDialog>

      <AppDialog open={createDialogOpen} title={t('reservationsPage.addReservation')} onClose={() => setCreateDialogOpen(false)}>
        <Box sx={{ pt: 1 }}>
          <PublicReservationForm mode="admin" onSuccess={() => setCreateDialogOpen(false)} />
        </Box>
      </AppDialog>
    </Box>
  );
};
