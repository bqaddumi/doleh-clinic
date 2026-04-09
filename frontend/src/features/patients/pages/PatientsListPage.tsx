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
  TextField,
  Typography
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
import { Patient } from '../../../types';
import { PatientFilters, PatientPayload, createPatientRequest, updatePatientRequest, useDeletePatient, usePatients } from '../api';

const patientCsvAliases = {
  id: ['ID', 'id', '_id', 'معرف'],
  fullName: ['Full Name', 'Name', 'fullName', 'name', 'الاسم الكامل', 'الاسم'],
  phone: ['Phone', 'phone', 'الهاتف'],
  age: ['Age', 'age', 'العمر'],
  gender: ['Gender', 'gender', 'الجنس'],
  address: ['Address', 'address', 'العنوان'],
  condition: ['Condition', 'condition', 'الحالة'],
  notes: ['Notes', 'notes', 'ملاحظات']
} as const;

export const PatientsListPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<PatientFilters>({
    search: '',
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const { data, isLoading, isError, error } = usePatients(filters);
  const deleteMutation = useDeletePatient();
  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const exportPatients = () => {
    if (!data?.items.length) {
      return;
    }

    downloadCsv(
      'patients.csv',
      [
        t('common.id'),
        t('patientsPage.fullName'),
        t('common.phone'),
        t('common.age'),
        t('common.gender'),
        t('common.address'),
        t('common.condition'),
        t('common.notes'),
        t('common.lastVisit')
      ],
      data.items.map((patient) => [
        patient._id,
        patient.fullName,
        patient.phone,
        patient.age,
        t(`common.${patient.gender}` as const),
        patient.address || '',
        patient.condition,
        patient.notes || '',
        formatDate(patient.lastVisit)
      ])
    );
  };

  const downloadPatientSample = () => {
    downloadCsv(
      'patients-sample.csv',
      [
        t('common.id'),
        t('patientsPage.fullName'),
        t('common.phone'),
        t('common.age'),
        t('common.gender'),
        t('common.address'),
        t('common.condition'),
        t('common.notes'),
        t('common.lastVisit')
      ],
      [['', 'John Doe', '+970599123456', 32, t('common.male'), 'Ramallah', 'Lower back pain', 'Initial evaluation', '']]
    );
  };

  const importPatients = async (file: File) => {
    try {
      const rows = parseCsv(await file.text());

      if (!rows.length) {
        setImportMessage({ type: 'error', text: t('common.importEmpty') });
        return;
      }

      let imported = 0;

      for (const row of rows) {
        const genderValue = getCsvValue(row, [...patientCsvAliases.gender]).toLowerCase();
        const payload: PatientPayload = {
          fullName: getCsvValue(row, [...patientCsvAliases.fullName]),
          phone: getCsvValue(row, [...patientCsvAliases.phone]),
          age: Number(getCsvValue(row, [...patientCsvAliases.age])),
          gender: genderValue === 'female' || genderValue === 'أنثى' ? 'female' : 'male',
          address: getCsvValue(row, [...patientCsvAliases.address]) || '',
          condition: getCsvValue(row, [...patientCsvAliases.condition]),
          notes: getCsvValue(row, [...patientCsvAliases.notes]) || ''
        };
        const patientId = getCsvValue(row, [...patientCsvAliases.id]);

        if (patientId) {
          await updatePatientRequest(patientId, payload);
        } else {
          await createPatientRequest(payload);
        }

        imported += 1;
      }

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
        title={t('common.patients')}
        subtitle={t('patientsPage.subtitle')}
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
                    await importPatients(file);
                  }
                  event.target.value = '';
                }}
              />
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={exportPatients}
              disabled={!data?.items.length}
              size="medium"
              sx={{ minHeight: 44 }}
            >
              {t('common.exportCsv')}
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />} onClick={downloadPatientSample} size="medium" sx={{ minHeight: 44 }}>
              {t('common.downloadSample')}
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate({ to: '/patients/new' })} size="medium" sx={{ minHeight: 44 }}>
              {t('common.addPatient')}
            </Button>
          </Stack>
        }
      />

      {importMessage ? <Alert severity={importMessage.type} sx={{ mb: 2 }}>{importMessage.text}</Alert> : null}

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label={t('common.search')}
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value, page: 1 }))}
            fullWidth
            helperText={t('common.uploadCsvHint')}
          />
          <TextField
            select
            label={t('common.sortBy')}
            value={filters.sortBy}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                sortBy: event.target.value as PatientFilters['sortBy']
              }))
            }
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="createdAt">{t('common.createdDate')}</MenuItem>
            <MenuItem value="fullName">{t('common.name')}</MenuItem>
            <MenuItem value="age">{t('common.age')}</MenuItem>
            <MenuItem value="condition">{t('common.condition')}</MenuItem>
            <MenuItem value="lastVisit">{t('common.lastVisit')}</MenuItem>
          </TextField>
          <TextField
            select
            label={t('common.order')}
            value={filters.sortOrder}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                sortOrder: event.target.value as PatientFilters['sortOrder']
              }))
            }
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="desc">{t('common.descending')}</MenuItem>
            <MenuItem value="asc">{t('common.ascending')}</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      {data?.items.length ? (
        <Stack spacing={2}>
          <DataTable<Patient>
            rowKey={(row) => row._id}
            rows={data.items}
            columns={[
              { key: 'name', header: t('common.name'), render: (row) => row.fullName },
              { key: 'phone', header: t('common.phone'), render: (row) => row.phone },
              { key: 'age', header: t('common.age'), render: (row) => row.age },
              { key: 'condition', header: t('common.condition'), render: (row) => row.condition },
              { key: 'lastVisit', header: t('common.lastVisit'), render: (row) => formatDate(row.lastVisit) },
              {
                key: 'actions',
                header: t('common.actions'),
                align: 'right',
                render: (row) => (
                  <Stack direction="row" justifyContent="flex-end">
                    <IconButton
                      color="primary"
                      onClick={() =>
                        navigate({
                          to: '/patients/$patientId',
                          params: { patientId: row._id }
                        })
                      }
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={async () => {
                        if (window.confirm(t('patientsPage.deleteConfirm', { name: row.fullName }))) {
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

          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography color="text.secondary">
              {t('patientsPage.foundCount', { count: data.pagination.total })}
            </Typography>
            <Pagination
              page={filters.page}
              count={data.pagination.totalPages || 1}
              onChange={(_, page) => setFilters((current) => ({ ...current, page }))}
            />
          </Stack>
        </Stack>
      ) : (
        <EmptyState
          title={t('patientsPage.noPatientsTitle')}
          description={t('patientsPage.noPatientsDescription')}
          actionLabel={t('common.addPatient')}
          onAction={() => navigate({ to: '/patients/new' })}
        />
      )}
    </div>
  );
};
