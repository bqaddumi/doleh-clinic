import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Grid, MenuItem, Stack, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useLanguage } from '../../../hooks/useLanguage';
import { PatientPayload } from '../api';

interface PatientFormProps {
  defaultValues?: Partial<PatientPayload>;
  onSubmit: (values: PatientPayload) => Promise<void>;
  isSubmitting: boolean;
}

export const PatientForm = ({
  defaultValues,
  onSubmit,
  isSubmitting
}: PatientFormProps) => {
  const { t } = useLanguage();
  const schema = z.object({
    fullName: z.string().min(2, t('validation.nameRequired')),
    phone: z.string().min(6, t('validation.phoneRequired')),
    age: z.number().min(0, t('validation.ageRequired')).max(120),
    gender: z.enum(['male', 'female']),
    address: z.string().optional(),
    condition: z.string().min(2, t('validation.conditionRequired')),
    notes: z.string().optional()
  });
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<PatientPayload>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: defaultValues?.fullName || '',
      phone: defaultValues?.phone || '',
      age: defaultValues?.age || 0,
      gender: defaultValues?.gender || 'male',
      address: defaultValues?.address || '',
      condition: defaultValues?.condition || '',
      notes: defaultValues?.notes || ''
    }
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="fullName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('patientsPage.fullName')}
                error={Boolean(errors.fullName)}
                helperText={errors.fullName?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <TextField {...field} fullWidth label={t('common.phone')} error={Boolean(errors.phone)} helperText={errors.phone?.message} />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="age"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label={t('common.age')}
                value={field.value}
                onChange={(event) => field.onChange(Number(event.target.value))}
                error={Boolean(errors.age)}
                helperText={errors.age?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <TextField {...field} select fullWidth label={t('common.gender')}>
                <MenuItem value="male">{t('common.male')}</MenuItem>
                <MenuItem value="female">{t('common.female')}</MenuItem>
              </TextField>
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Controller
            name="condition"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('common.condition')}
                error={Boolean(errors.condition)}
                helperText={errors.condition?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Controller
            name="address"
            control={control}
            render={({ field }) => <TextField {...field} fullWidth label={t('common.address')} />}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => <TextField {...field} fullWidth label={t('common.notes')} multiline minRows={4} />}
          />
        </Grid>
      </Grid>

      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? t('common.saving') : t('common.savePatient')}
        </Button>
      </Stack>
    </Box>
  );
};
