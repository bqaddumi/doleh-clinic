import { zodResolver } from '@hookform/resolvers/zod';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Alert, Box, Button, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material';
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

const formatDateValue = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const parseDateValue = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const getMonthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;

export const PublicReservationForm = ({ compact = false, mode = 'public', onSuccess }: PublicReservationFormProps) => {
  const { language, t } = useLanguage();
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const publicCreateReservation = usePublicCreateReservation();
  const adminCreateReservation = useCreateReservation();
  const createReservation = mode === 'admin' ? adminCreateReservation : publicCreateReservation;
  const [selectedDate, setSelectedDate] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const schema = z.object({
    fullName: z.string().min(2, t('validation.nameRequired')),
    phone: z.string().min(6, t('validation.phoneRequired')),
    age: z.number().int().min(0, t('validation.ageRequired')).max(120),
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
      age: 0,
      scheduledAt: '',
      notes: ''
    }
  });

  const timeOptions = useMemo(() => dateOptionsQuery.data?.slotTimes || [], [dateOptionsQuery.data?.slotTimes]);
  const dateOptions = useMemo(() => dateOptionsQuery.data?.options || [], [dateOptionsQuery.data?.options]);
  const availableDateSet = useMemo(() => new Set(dateOptions.filter((option) => option.isAvailable).map((option) => option.date)), [dateOptions]);
  const optionDateSet = useMemo(() => new Set(dateOptions.map((option) => option.date)), [dateOptions]);
  const firstOptionMonth = useMemo(() => (dateOptions[0]?.date ? parseDateValue(dateOptions[0].date) : null), [dateOptions]);
  const lastOptionMonth = useMemo(
    () => (dateOptions[dateOptions.length - 1]?.date ? parseDateValue(dateOptions[dateOptions.length - 1].date) : null),
    [dateOptions]
  );
  const isPreviousMonthDisabled = firstOptionMonth ? getMonthKey(calendarMonth) <= getMonthKey(firstOptionMonth) : true;
  const isNextMonthDisabled = false;

  const weekdayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(language === 'ar' ? 'ar' : 'en', { weekday: 'short' });
    return Array.from({ length: 7 }, (_, index) => formatter.format(new Date(2024, 0, index + 7)));
  }, [language]);

  const calendarDays = useMemo(() => {
    const monthStart = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    const gridStart = new Date(monthStart);
    gridStart.setDate(monthStart.getDate() - monthStart.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      const value = formatDateValue(date);

      return {
        date,
        value,
        isCurrentMonth: date.getMonth() === calendarMonth.getMonth(),
        isAvailable: availableDateSet.has(value),
        isSelectable: optionDateSet.has(value) && availableDateSet.has(value)
      };
    });
  }, [availableDateSet, calendarMonth, optionDateSet]);

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

  useEffect(() => {
    const monthDate = selectedDate ? parseDateValue(selectedDate) : firstOptionMonth;

    if (monthDate) {
      setCalendarMonth(new Date(monthDate.getFullYear(), monthDate.getMonth(), 1));
    }
  }, [firstOptionMonth, selectedDate]);

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
        name="age"
        control={form.control}
        render={({ field }) => (
          <TextField
            {...field}
            type="number"
            label={t('common.age')}
            value={field.value}
            onChange={(event) => field.onChange(Number(event.target.value))}
            error={Boolean(form.formState.errors.age)}
            helperText={form.formState.errors.age?.message}
            slotProps={{ htmlInput: { min: 0, max: 120 } }}
            fullWidth
          />
        )}
      />
      <Controller
        name="scheduledAt"
        control={form.control}
        render={({ field }) => (
          <Stack spacing={2}>
            <Box
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                p: 1.5
              }}
            >
              <Stack spacing={1.25}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle2">{t('common.date')}</Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <IconButton
                      size="small"
                      aria-label="Previous month"
                      onClick={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}
                      disabled={isPreviousMonthDisabled}
                    >
                      <ChevronLeftIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="body2" fontWeight={700} sx={{ minWidth: 128, textAlign: 'center' }}>
                      {new Intl.DateTimeFormat(language === 'ar' ? 'ar' : 'en', { month: 'long', year: 'numeric' }).format(calendarMonth)}
                    </Typography>
                    <IconButton
                      size="small"
                      aria-label="Next month"
                      onClick={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}
                      disabled={isNextMonthDisabled}
                    >
                      <ChevronRightIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                    gap: 0.2
                  }}
                >
                  {weekdayLabels.map((day) => (
                    <Typography key={day} variant="caption" color="text.secondary" textAlign="left" fontWeight={700}>
                      {day}
                    </Typography>
                  ))}
                  {calendarDays.map((day) => (
                    <Button
                      key={day.value}
                      variant={selectedDate === day.value ? 'contained' : 'text'}
                      color={selectedDate === day.value ? 'primary' : 'inherit'}
                      size="small"
                      disabled={!day.isSelectable || dateOptionsQuery.isLoading}
                      onClick={() => {
                        setSelectedDate(day.value);
                        field.onChange('');
                      }}
                      sx={{
                        width:"30px",
                        height:"30px",
                        minWidth: 0,
                        aspectRatio: '1 / 1',
                        p: 0,
                        color: day.isCurrentMonth ? undefined : 'text.disabled',
                        fontWeight: selectedDate === day.value ? 800 : 600
                      }}
                    >
                      {day.date.getDate()}
                    </Button>
                  ))}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {t('reservationsPage.dateAvailabilityHint')}
                </Typography>
              </Stack>
            </Box>
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
              {timeOptions.map((time) =>!unavailableTimes.has(time) && (
                
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
