import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Alert, Button, Chip, IconButton, Stack } from '@mui/material';
import { useState } from 'react';
import { AppDialog } from '../../../components/AppDialog';
import { DataTable } from '../../../components/DataTable';
import { EmptyState } from '../../../components/EmptyState';
import { LoadingScreen } from '../../../components/LoadingScreen';
import { PageHeader } from '../../../components/PageHeader';
import { useLanguage } from '../../../hooks/useLanguage';
import { getErrorMessage } from '../../../lib/format';
import { Banner } from '../../../types';
import { BannerForm } from '../components/BannerForm';
import { BannerPayload, useBanners, useCreateBanner, useDeleteBanner, useUpdateBanner } from '../api';

export const BannersPage = () => {
  const { t } = useLanguage();
  const { data, isLoading, isError, error } = useBanners();
  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();
  const deleteMutation = useDeleteBanner();
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const mutation = editingBanner ? updateMutation : createMutation;

  const openCreateDialog = () => {
    setEditingBanner(null);
    setDialogOpen(true);
  };

  const openEditDialog = (banner: Banner) => {
    setEditingBanner(banner);
    setDialogOpen(true);
  };

  const handleSubmit = async (values: BannerPayload) => {
    if (editingBanner) {
      await updateMutation.mutateAsync({ bannerId: editingBanner._id, payload: values });
    } else {
      await createMutation.mutateAsync(values);
    }
    setDialogOpen(false);
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
        title={t('common.banners')}
        subtitle={t('bannersPage.subtitle')}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
            {t('bannersPage.addBanner')}
          </Button>
        }
      />

      {data?.length ? (
        <DataTable<Banner>
          rowKey={(row) => row._id}
          rows={data}
          columns={[
            { key: 'messageEn', header: t('bannersPage.messageEn'), render: (row) => row.messageEn },
            { key: 'messageAr', header: t('bannersPage.messageAr'), render: (row) => row.messageAr },
            { key: 'order', header: t('bannersPage.order'), render: (row) => row.order },
            {
              key: 'status',
              header: t('common.status'),
              render: (row) => (
                <Chip
                  size="small"
                  color={row.isActive ? 'success' : 'default'}
                  label={row.isActive ? t('bannersPage.active') : t('bannersPage.inactive')}
                />
              )
            },
            {
              key: 'actions',
              header: t('common.actions'),
              align: 'right',
              render: (row) => (
                <Stack direction="row" justifyContent="flex-end">
                  <IconButton color="primary" onClick={() => openEditDialog(row)}>
                    <EditOutlinedIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={async () => {
                      if (window.confirm(t('bannersPage.deleteConfirm'))) {
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
      ) : (
        <EmptyState
          title={t('bannersPage.noBannersTitle')}
          description={t('bannersPage.noBannersDescription')}
          actionLabel={t('bannersPage.addBanner')}
          onAction={openCreateDialog}
        />
      )}

      <AppDialog
        open={dialogOpen}
        title={editingBanner ? t('bannersPage.editBanner') : t('bannersPage.addBanner')}
        onClose={() => setDialogOpen(false)}
      >
        {mutation.isError ? <Alert severity="error" sx={{ mb: 2 }}>{getErrorMessage(mutation.error)}</Alert> : null}
        <BannerForm
          defaultValues={editingBanner || undefined}
          onSubmit={handleSubmit}
          isSubmitting={mutation.isPending}
        />
      </AppDialog>
    </div>
  );
};
