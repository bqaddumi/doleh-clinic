import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, MenuItem, Stack, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useLanguage } from '../../../hooks/useLanguage';
import { getErrorMessage } from '../../../lib/format';
import { ReservationPayload, useCreateReservation, usePublicCreateReservation, useReservationAvailability, useReservationDateOptions } from '../api';
import { useEffect, useMemo, useState } from 'react';

interface PublicReservationFormProps {
  compact?: boolean;
  mode?: 'public' | 'admin';
  onSuccess?: () => void;
}

export const PublicReservationForm = ({ compact = false, mode = 'public', onSuccess }: PublicReservationFormProps) => {
  const { t } = useLanguage();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const publicCreateReservation = usePublicCreateReservation();
  const adminCreateReservation = useCreateReservation();
  const createReservation = mode === 'admin' ? adminCreateReservation : publicCreateReservation;
  const [selectedDate, setSelectedDate] = useState('');
  const schema = z.object({
    fullName: z.string().min(2, t('validation.nameRequired')),
    phone: z.string().min(6, t('validation.phoneRequired')),
    scheduledAt: z.string().min(1, t('validation.dateRequired')),
    notes: z.string().max(2000).optional()
  });
  const availabilityQuery = useReservationAvailability(selectedDate);
  const dateOptionsQuery = useReservationDateOptions();

  const form = useForm<ReservationPayload>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      phone: '',
      scheduledAt: '',
      notes: ''
    }
  });

  const timeOptions = useMemo(() => dateOptionsQuery.data?.slotTimes || [], [dateOptionsQuery.data?.slotTimes]);

  const unavailableTimes = useMemo(() => {
    if (!selectedDate || !availabilityQuery.data) {
      return new Set<string>();
    }

    const gapMs = availabilityQuery.data.gapMinutes * 60 * 1000;
    const reservedTimes = availabilityQuery.data.reservedSlots.map((slot) => new Date(slot).getTime());
    const now = new Date();

    return new Set(
      timeOptions.filter((time) => {
        const slotDate = new Date(`${selectedDate}T${time}`);
        const slotTime = slotDate.getTime();

        if (slotDate <= now) {
          return true;
        }

        return reservedTimes.some((reservedTime) => Math.abs(reservedTime - slotTime) < gapMs);
      })
    );
  }, [availabilityQuery.data, selectedDate, timeOptions]);

  useEffect(() => {
    if (!selectedDate) {
      form.setValue('scheduledAt', '');
    }
  }, [form, selectedDate]);

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      setFeedback(null);
      await createReservation.mutateAsync(values);
      form.reset();
      setSelectedDate('');
      setFeedback({ type: 'success', text: t('reservationsPage.createSuccess') });
      onSuccess?.();
    } catch (error) {
      setFeedback({ type: 'error', text: getErrorMessage(error) });
    }
  });

  return (
    <Stack spacing={2}>
      {feedback ? <Alert severity={feedback.type}>{feedback.text}</Alert> : null}
      <Controller
        name="fullName"
        control={form.control}
        render={({ field }) => (
          <TextField
            {...field}
            label={t('patientsPage.fullName')}
            error={Boolean(form.formState.errors.fullName)}
            helperText={form.formState.errors.fullName?.message}
            fullWidth
          />
        )}
      />
      <Controller
        name="phone"
        control={form.control}
        render={({ field }) => (
          <TextField
            {...field}
            label={t('common.phone')}
            error={Boolean(form.formState.errors.phone)}
            helperText={form.formState.errors.phone?.message}
            fullWidth
          />
        )}
      />
      <Controller
        name="scheduledAt"
        control={form.control}
        render={({ field }) => (
          <Stack spacing={2}>
            <TextField
              select
              label={t('common.date')}
              value={selectedDate}
              onChange={(event) => {
                const value = event.target.value;
                setSelectedDate(value);
                field.onChange('');
              }}
              helperText={t('reservationsPage.dateAvailabilityHint')}
              fullWidth
            >
              {(dateOptionsQuery.data?.options || []).map((option) => (
                <MenuItem key={option.date} value={option.date} disabled={!option.isAvailable}>
                  {option.date}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label={t('common.time')}
              value={field.value ? field.value.slice(11, 16) : ''}
              onChange={(event) => field.onChange(selectedDate ? `${selectedDate}T${event.target.value}` : '')}
              error={Boolean(form.formState.errors.scheduledAt)}
              helperText={
                form.formState.errors.scheduledAt?.message ||
                (selectedDate ? t('reservationsPage.timeGapHint') : t('reservationsPage.selectDateFirst'))
              }
              fullWidth
              disabled={!selectedDate || availabilityQuery.isLoading}
            >
              {timeOptions.map((time) => (
                <MenuItem key={time} value={time} disabled={unavailableTimes.has(time)}>
                  {time}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        )}
      />
      {!compact ? (
        <Controller
          name="notes"
          control={form.control}
          render={({ field }) => <TextField {...field} label={t('common.notes')} multiline minRows={3} fullWidth />}
        />
      ) : null}
      <Button variant="contained" size={compact ? 'medium' : 'large'} onClick={handleSubmit} disabled={createReservation.isPending}>
        {createReservation.isPending ? t('common.saving') : t('reservationsPage.requestReservation')}
      </Button>
    </Stack>
  );
};
