import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
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
import { useState } from 'react';
import { DataTable } from '../../../components/DataTable';
import { EmptyState } from '../../../components/EmptyState';
import { LoadingScreen } from '../../../components/LoadingScreen';
import { PageHeader } from '../../../components/PageHeader';
import { useLanguage } from '../../../hooks/useLanguage';
import { formatDate, getErrorMessage } from '../../../lib/format';
import { Report } from '../../../types';
import { usePatients } from '../../patients/api';
import { ReportFilters, useDeleteReport, useReports } from '../api';

export const ReportsListPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate({ to: '/reports/new', search: { patientId: '' } })}
          >
            {t('common.addReport')}
          </Button>
        }
      />

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            select
            label={t('common.patient')}
            value={filters.patientId}
            onChange={(event) => setFilters((current) => ({ ...current, patientId: event.target.value, page: 1 }))}
            fullWidth
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
