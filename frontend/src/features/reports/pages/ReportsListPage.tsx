import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Alert,
  Button,
  IconButton,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  TextField
} from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { DataTable } from '../../../components/DataTable';
import { EmptyState } from '../../../components/EmptyState';
import { LoadingScreen } from '../../../components/LoadingScreen';
import { PageHeader } from '../../../components/PageHeader';
import { useLanguage } from '../../../hooks/useLanguage';
import { downloadCsv, getCsvValue, parseCsv } from '../../../lib/csv';
import { formatDate, getErrorMessage } from '../../../lib/format';
import { Report } from '../../../types';
import { usePatients } from '../../patients/api';
import { ReportFilters, ReportPayload, createReportRequest, updateReportRequest, useDeleteReport, useReports } from '../api';

const reportCsvAliases = {
  reportId: ['Report ID', 'reportId', 'id', '_id', 'معرف التقرير', 'المعرف'],
  patientId: ['Patient ID', 'patientId', 'معرف المريض'],
  patient: ['Patient', 'patient', 'patientName', 'fullName', 'المريض', 'الاسم', 'الاسم الكامل'],
  date: ['Date', 'date', 'التاريخ'],
  diagnosis: ['Diagnosis', 'diagnosis', 'التشخيص'],
  treatmentPlan: ['Treatment Plan', 'treatmentPlan', 'الخطة العلاجية'],
  sessionNotes: ['Session Notes', 'sessionNotes', 'ملاحظات الجلسة'],
  progress: ['Progress', 'progress', 'التقدم'],
  attachments: ['Attachments', 'attachments', 'المرفقات']
} as const;

export const ReportsListPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ReportFilters>({
    patientId: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: 10
  });
  const { data, isLoading, isError, error } = useReports(filters);
  const patientsQuery = usePatients({
    search: '',
    page: 1,
    limit: 100,
    sortBy: 'fullName',
    sortOrder: 'asc'
  });
  const deleteMutation = useDeleteReport();
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const exportReports = () => {
    if (!data?.items.length) {
      return;
    }

    downloadCsv(
      'reports.csv',
      [
        t('common.reportId'),
        t('common.patientId'),
        t('common.patient'),
        t('common.date'),
        t('common.diagnosis'),
        t('common.treatmentPlan'),
        t('common.sessionNotes'),
        t('common.progress'),
        t('common.attachments')
      ],
      data.items.map((report) => [
        report._id,
        typeof report.patientId === 'string' ? '' : report.patientId._id,
        typeof report.patientId === 'string' ? report.patientId : report.patientId.fullName,
        formatDate(report.date),
        report.diagnosis,
        report.treatmentPlan,
        report.sessionNotes,
        t(`common.${report.progress}` as const),
        report.attachments?.join(' | ') || ''
      ])
    );
  };

  const downloadReportSample = () => {
    downloadCsv(
      'reports-sample.csv',
      [
        t('common.reportId'),
        t('common.patientId'),
        t('common.patient'),
        t('common.date'),
        t('common.diagnosis'),
        t('common.treatmentPlan'),
        t('common.sessionNotes'),
        t('common.progress'),
        t('common.attachments')
      ],
      [['', '', 'John Doe', '2026-04-09', 'Ankle sprain', 'Stretching and strengthening plan', 'Patient tolerated session well', t('common.improving'), 'https://example.com/report.pdf']]
    );
  };

  const importReports = async (file: File) => {
    try {
      const rows = parseCsv(await file.text());

      if (!rows.length) {
        setImportMessage({ type: 'error', text: t('common.importEmpty') });
        return;
      }

      const patientMap = new Map(
        (patientsQuery.data?.items || []).map((patient) => [patient.fullName.toLowerCase(), patient._id])
      );

      let imported = 0;

      for (const row of rows) {
        const patientId =
          getCsvValue(row, [...reportCsvAliases.patientId]) ||
          patientMap.get(getCsvValue(row, [...reportCsvAliases.patient]).toLowerCase());

        if (!patientId) {
          throw new Error('Patient not found for one or more report rows');
        }

        const progressValue = getCsvValue(row, [...reportCsvAliases.progress]).toLowerCase();
        const payload: ReportPayload = {
          patientId,
          date: getCsvValue(row, [...reportCsvAliases.date]),
          diagnosis: getCsvValue(row, [...reportCsvAliases.diagnosis]),
          treatmentPlan: getCsvValue(row, [...reportCsvAliases.treatmentPlan]),
          sessionNotes: getCsvValue(row, [...reportCsvAliases.sessionNotes]),
          progress:
            progressValue === 'worse' || progressValue === 'تدهور'
              ? 'worse'
              : progressValue === 'improving' || progressValue === 'تحسن'
                ? 'improving'
                : 'stable',
          attachments: getCsvValue(row, [...reportCsvAliases.attachments])
            ? getCsvValue(row, [...reportCsvAliases.attachments]).split('|').map((value: string) => value.trim()).filter(Boolean)
            : []
        };
        const reportId = getCsvValue(row, [...reportCsvAliases.reportId]);

        if (reportId) {
          await updateReportRequest(reportId, payload);
        } else {
          await createReportRequest(payload);
        }

        imported += 1;
      }

      await queryClient.invalidateQueries({ queryKey: ['reports'] });
      await queryClient.invalidateQueries({ queryKey: ['report'] });
      await queryClient.invalidateQueries({ queryKey: ['patients'] });
      await queryClient.invalidateQueries({ queryKey: ['patient'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setImportMessage({ type: 'success', text: t('common.importSuccess', { count: imported }) });
    } catch (importError) {
      setImportMessage({ type: 'error', text: getErrorMessage(importError) || t('common.importFailed') });
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError) {
    return <Alert severity="error">{getErrorMessage(error)}</Alert>;
  }

  return (
    <div>
      <PageHeader
        title={t('common.reports')}
        subtitle={t('reportsPage.subtitle')}
        action={
          <Stack
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                lg: 'repeat(4, max-content)'
              },
              gap: 1.25,
              width: '100%',
              justifyContent: { lg: 'flex-end' }
            }}
          >
            <Button component="label" variant="outlined" startIcon={<UploadFileIcon />} size="medium" sx={{ minHeight: 44 }}>
              {t('common.importCsv')}
              <input
                hidden
                type="file"
                accept=".csv,text/csv"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    await importReports(file);
                  }
                  event.target.value = '';
                }}
              />
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={exportReports}
              disabled={!data?.items.length}
              size="medium"
              sx={{ minHeight: 44 }}
            >
              {t('common.exportCsv')}
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={downloadReportSample} size="medium" sx={{ minHeight: 44 }}>
              {t('common.downloadSample')}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate({ to: '/reports/new', search: { patientId: '' } })}
              size="medium"
              sx={{ minHeight: 44 }}
            >
              {t('common.addReport')}
            </Button>
          </Stack>
        }
      />

      {importMessage ? <Alert severity={importMessage.type} sx={{ mb: 2 }}>{importMessage.text}</Alert> : null}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            select
            label={t('common.patient')}
            value={filters.patientId}
            onChange={(event) => setFilters((current) => ({ ...current, patientId: event.target.value, page: 1 }))}
            fullWidth
            helperText={t('common.uploadCsvHint')}
          >
            <MenuItem value="">{t('common.allPatients')}</MenuItem>
            {patientsQuery.data?.items.map((patient) => (
              <MenuItem key={patient._id} value={patient._id}>
                {patient.fullName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            type="date"
            label={t('common.dateFrom')}
            value={filters.dateFrom}
            onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value, page: 1 }))}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            type="date"
            label={t('common.dateTo')}
            value={filters.dateTo}
            onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value, page: 1 }))}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Stack>
      </Paper>

      {data?.items.length ? (
        <Stack spacing={2}>
          <DataTable<Report>
            rowKey={(row) => row._id}
            rows={data.items}
            columns={[
              {
                key: 'patient',
                header: t('common.patient'),
                render: (row) => (typeof row.patientId === 'string' ? row.patientId : row.patientId.fullName)
              },
              { key: 'date', header: t('common.date'), render: (row) => formatDate(row.date) },
              { key: 'diagnosis', header: t('common.diagnosis'), render: (row) => row.diagnosis },
              { key: 'progress', header: t('common.progress'), render: (row) => t(`common.${row.progress}` as const) },
              {
                key: 'actions',
                header: t('common.actions'),
                align: 'right',
                render: (row) => (
                  <Stack direction="row" justifyContent="flex-end">
                    <IconButton
                      onClick={() =>
                        navigate({
                          to: '/reports/$reportId',
                          params: { reportId: row._id }
                        })
                      }
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={async () => {
                        if (window.confirm(`${t('common.reports')}?`)) {
                          await deleteMutation.mutateAsync(row._id);
                        }
                      }}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Stack>
                )
              }
            ]}
          />
          <Stack direction="row" justifyContent="flex-end">
            <Pagination
              page={filters.page}
              count={data.pagination.totalPages || 1}
              onChange={(_, page) => setFilters((current) => ({ ...current, page }))}
            />
          </Stack>
        </Stack>
      ) : (
        <EmptyState
          title={t('reportsPage.noReportsTitle')}
          description={t('reportsPage.noReportsDescription')}
          actionLabel={t('common.addReport')}
          onAction={() => navigate({ to: '/reports/new', search: { patientId: '' } })}
        />
      )}
    </div>
  );
};
