import { Alert, Box, Button, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../../hooks/useLanguage';
import { formatDateValue, getUnavailableTimes, parseDateValue } from '../../../lib/slots';
import { useReservationAvailability, useReservationDateOptions } from '../../reservations/api';
import { Reveal } from './Reveal';
import { Section, SectionHeading } from './ServicesSection';

const VISIBLE_DAYS = 7;

interface AvailabilitySectionProps {
  selectedSlot: { date: string; time: string } | null;
  onSelectSlot: (date: string, time: string) => void;
}

export const AvailabilitySection = ({ selectedSlot, onSelectSlot }: AvailabilitySectionProps) => {
  const { t, language } = useLanguage();
  const locale = language === 'ar' ? 'ar' : 'en';
  const dateOptionsQuery = useReservationDateOptions();
  const [selectedDay, setSelectedDay] = useState('');

  const days = useMemo(
    () => (dateOptionsQuery.data?.options || []).filter((option) => option.isAvailable).slice(0, VISIBLE_DAYS),
    [dateOptionsQuery.data?.options]
  );
  const slotTimes = useMemo(() => dateOptionsQuery.data?.slotTimes || [], [dateOptionsQuery.data?.slotTimes]);
  const availabilityQuery = useReservationAvailability(selectedDay);

  useEffect(() => {
    if (!selectedDay && days.length) {
      setSelectedDay(days[0].date);
    }
  }, [days, selectedDay]);

  const freeTimes = useMemo(() => {
    if (!selectedDay || !availabilityQuery.data) {
      return [];
    }

    const unavailable = getUnavailableTimes(selectedDay, slotTimes, availabilityQuery.data);
    return slotTimes.filter((time) => !unavailable.has(time));
  }, [availabilityQuery.data, selectedDay, slotTimes]);

  const todayValue = formatDateValue(new Date());
  const tomorrowValue = formatDateValue(new Date(Date.now() + 24 * 60 * 60 * 1000));

  const formatDay = (value: string) => {
    const date = parseDateValue(value);
    return {
      top:
        value === todayValue
          ? t('landingPage.today')
          : value === tomorrowValue
            ? t('landingPage.tomorrow')
            : new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date),
      bottom: new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(date)
    };
  };

  return (
    <Section id="availability">
      <SectionHeading title={t('landingPage.availabilityTitle')} subtitle={t('landingPage.availabilitySubtitle')} />
      <Reveal>
        <Box
          sx={{
            maxWidth: 960,
            mx: 'auto',
            p: { xs: 2.5, md: 4 },
            borderRadius: 5,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 12px 40px rgba(31,111,139,0.12)'
          }}
        >
          {dateOptionsQuery.isLoading ? (
            <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : !days.length ? (
            <Alert severity="info">{t('landingPage.noDaysAvailable')}</Alert>
          ) : (
            <Stack spacing={3}>
              <Stack direction="row" spacing={1.5} sx={{ overflowX: 'auto', pb: 1 }}>
                {days.map((day) => {
                  const label = formatDay(day.date);
                  const active = day.date === selectedDay;

                  return (
                    <Button
                      key={day.date}
                      variant={active ? 'contained' : 'outlined'}
                      onClick={() => setSelectedDay(day.date)}
                      sx={{ flexShrink: 0, minWidth: 92, py: 1.25, flexDirection: 'column', lineHeight: 1.3 }}
                    >
                      <Typography component="span" variant="body2" fontWeight={800}>
                        {label.top}
                      </Typography>
                      <Typography component="span" variant="caption" sx={{ opacity: 0.85 }}>
                        {label.bottom}
                      </Typography>
                    </Button>
                  );
                })}
              </Stack>

              <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                <Typography color="text.secondary">{t('landingPage.tapToBook')}</Typography>
                {availabilityQuery.data ? (
                  <Chip color={freeTimes.length ? 'success' : 'default'} label={t('landingPage.freeTimes', { count: freeTimes.length })} />
                ) : null}
              </Stack>

              {availabilityQuery.isLoading ? (
                <Box sx={{ display: 'grid', placeItems: 'center', py: 4 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : freeTimes.length ? (
                <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))' }}>
                  {freeTimes.map((time) => {
                    const chosen = selectedSlot?.date === selectedDay && selectedSlot.time === time;

                    return (
                      <Button
                        key={time}
                        variant={chosen ? 'contained' : 'outlined'}
                        color={chosen ? 'success' : 'primary'}
                        onClick={() => onSelectSlot(selectedDay, time)}
                        sx={{ py: 1.1, fontWeight: 700, transition: 'transform 150ms ease', '&:hover': { transform: 'scale(1.06)' } }}
                      >
                        {time}
                      </Button>
                    );
                  })}
                </Box>
              ) : (
                <Alert severity="warning">{t('landingPage.noFreeTimes')}</Alert>
              )}
            </Stack>
          )}
        </Box>
      </Reveal>
    </Section>
  );
};
