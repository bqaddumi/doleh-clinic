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
  TextField,
  Typography
} from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { DataTable } from '../../../components/DataTable';
import { EmptyState } from '../../../components/EmptyState';
import { LoadingScreen } from '../../../components/LoadingScreen';
import { PageHeader } from '../../../components/PageHeader';
import { useLanguage } from '../../../hooks/useLanguage';
import { formatDate, getErrorMessage } from '../../../lib/format';
import { Patient } from '../../../types';
import { PatientFilters, useDeletePatient, usePatients } from '../api';

export const PatientsListPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [filters, setFilters] = useState<PatientFilters>({
    search: '',
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const { data, isLoading, isError, error } = usePatients(filters);
  const deleteMutation = useDeletePatient();

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
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate({ to: '/patients/new' })}>
            {t('common.addPatient')}
          </Button>
        }
      />

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label={t('common.search')}
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value, page: 1 }))}
            fullWidth
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
