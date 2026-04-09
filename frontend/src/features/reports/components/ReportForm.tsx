import { zodResolver } from '@hookform/resolvers/zod';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Alert, Box, Button, Chip, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useLanguage } from '../../../hooks/useLanguage';
import { Patient } from '../../../types';
import { ReportPayload, useUploadAttachments } from '../api';

interface ReportFormProps {
  patients: Patient[];
  defaultValues?: Partial<ReportPayload> & { attachmentsText?: string };
  onSubmit: (payload: ReportPayload) => Promise<void>;
  isSubmitting: boolean;
}

export const ReportForm = ({
  patients,
  defaultValues,
  onSubmit,
  isSubmitting
}: ReportFormProps) => {
  const { t } = useLanguage();
  const [uploadedAttachments, setUploadedAttachments] = useState<string[]>(defaultValues?.attachments || []);
  const schema = z.object({
    patientId: z.string().min(1, t('validation.patientRequired')),
    date: z.string().min(1, t('validation.dateRequired')),
    diagnosis: z.string().min(2, t('validation.diagnosisRequired')),
    treatmentPlan: z.string().min(2, t('validation.treatmentPlanRequired')),
    sessionNotes: z.string().min(2, t('validation.sessionNotesRequired')),
    progress: z.enum(['improving', 'stable', 'worse']),
    attachments: z.string().optional()
  });
  type FormValues = z.infer<typeof schema>;
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      patientId: defaultValues?.patientId || '',
      date: defaultValues?.date || new Date().toISOString().slice(0, 10),
      diagnosis: defaultValues?.diagnosis || '',
      treatmentPlan: defaultValues?.treatmentPlan || '',
      sessionNotes: defaultValues?.sessionNotes || '',
      progress: defaultValues?.progress || 'stable',
      attachments: defaultValues?.attachmentsText || ''
    }
  });
  const uploadMutation = useUploadAttachments();

  useEffect(() => {
    setUploadedAttachments(defaultValues?.attachments || []);
  }, [defaultValues?.attachments]);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(async (values) => {
        const manualAttachments = values.attachments
          ? values.attachments
              .split('\n')
              .map((value: string) => value.trim())
              .filter(Boolean)
          : [];

        await onSubmit({
          patientId: values.patientId,
          date: values.date,
          diagnosis: values.diagnosis,
          treatmentPlan: values.treatmentPlan,
          sessionNotes: values.sessionNotes,
          progress: values.progress,
          attachments: [...uploadedAttachments, ...manualAttachments]
        });
      })}
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="patientId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                fullWidth
                label={t('common.patient')}
                error={Boolean(errors.patientId)}
                helperText={errors.patientId?.message}
              >
                {patients.map((patient) => (
                  <MenuItem key={patient._id} value={patient._id}>
                    {patient.fullName}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                type="date"
                fullWidth
                label={t('common.date')}
                slotProps={{ inputLabel: { shrink: true } }}
                error={Boolean(errors.date)}
                helperText={errors.date?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Controller
            name="diagnosis"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('common.diagnosis')}
                error={Boolean(errors.diagnosis)}
                helperText={errors.diagnosis?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Controller
            name="treatmentPlan"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('common.treatmentPlan')}
                multiline
                minRows={3}
                error={Boolean(errors.treatmentPlan)}
                helperText={errors.treatmentPlan?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Controller
            name="sessionNotes"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('common.sessionNotes')}
                multiline
                minRows={4}
                error={Boolean(errors.sessionNotes)}
                helperText={errors.sessionNotes?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="progress"
            control={control}
            render={({ field }) => (
              <TextField {...field} select fullWidth label={t('common.progress')}>
                <MenuItem value="improving">{t('common.improving')}</MenuItem>
                <MenuItem value="stable">{t('common.stable')}</MenuItem>
                <MenuItem value="worse">{t('common.worse')}</MenuItem>
              </TextField>
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={1.5}>
            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadFileIcon />}
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? t('reportsPage.uploading') : t('reportsPage.uploadFiles')}
              <input
                hidden
                type="file"
                multiple
                onChange={async (event) => {
                  const files = Array.from(event.target.files || []);
                  if (!files.length) {
                    return;
                  }

                  const uploaded = await uploadMutation.mutateAsync(files);
                  setUploadedAttachments((current) => [
                    ...current,
                    ...uploaded.map((file) => file.url)
                  ]);
                  event.target.value = '';
                }}
              />
            </Button>

            {uploadMutation.isError ? (
              <Alert severity="error">
                {t('reportsPage.uploadFailed')}
              </Alert>
            ) : null}

            {uploadedAttachments.length ? (
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
                {uploadedAttachments.map((attachment) => (
                  <Chip
                    key={attachment}
                    label={attachment.split('/').pop()}
                    onDelete={() =>
                      setUploadedAttachments((current) =>
                        current.filter((item) => item !== attachment)
                      )
                    }
                  />
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t('reportsPage.uploadHint')}
              </Typography>
            )}
          </Stack>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="attachments"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('common.attachments')}
                multiline
                minRows={3}
                helperText={t('reportsPage.attachmentsHint')}
              />
            )}
          />
        </Grid>
      </Grid>

      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? t('common.saving') : t('common.saveReport')}
        </Button>
      </Stack>
    </Box>
  );
};
