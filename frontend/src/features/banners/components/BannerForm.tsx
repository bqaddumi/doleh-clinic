import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, FormControlLabel, Grid, Stack, Switch, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useLanguage } from '../../../hooks/useLanguage';
import { BannerPayload } from '../api';

interface BannerFormProps {
  defaultValues?: Partial<BannerPayload>;
  onSubmit: (values: BannerPayload) => Promise<void>;
  isSubmitting: boolean;
}

export const BannerForm = ({ defaultValues, onSubmit, isSubmitting }: BannerFormProps) => {
  const { t } = useLanguage();
  const schema = z.object({
    messageEn: z.string().min(1, t('validation.messageEnRequired')),
    messageAr: z.string().min(1, t('validation.messageArRequired')),
    isActive: z.boolean(),
    order: z.number().min(0)
  });
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<BannerPayload>({
    resolver: zodResolver(schema),
    defaultValues: {
      messageEn: defaultValues?.messageEn || '',
      messageAr: defaultValues?.messageAr || '',
      isActive: defaultValues?.isActive ?? true,
      order: defaultValues?.order ?? 0
    }
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Controller
            name="messageEn"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                minRows={2}
                label={t('bannersPage.messageEn')}
                error={Boolean(errors.messageEn)}
                helperText={errors.messageEn?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Controller
            name="messageAr"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                multiline
                minRows={2}
                dir="rtl"
                label={t('bannersPage.messageAr')}
                error={Boolean(errors.messageAr)}
                helperText={errors.messageAr?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="order"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                type="number"
                label={t('bannersPage.order')}
                value={field.value}
                onChange={(event) => field.onChange(Number(event.target.value))}
                error={Boolean(errors.order)}
                helperText={errors.order?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch checked={field.value} onChange={(event) => field.onChange(event.target.checked)} />}
                label={t('bannersPage.active')}
              />
            )}
          />
        </Grid>
      </Grid>

      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? t('common.saving') : t('common.save')}
        </Button>
      </Stack>
    </Box>
  );
};
