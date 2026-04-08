import { Box, Button, Typography } from '@mui/material';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  title,
  description,
  actionLabel,
  onAction
}: EmptyStateProps) => (
  <Box
    sx={{
      p: 5,
      border: '1px dashed',
      borderColor: 'divider',
      borderRadius: 4,
      textAlign: 'center'
    }}
  >
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    <Typography color="text.secondary" sx={{ mb: actionLabel ? 2 : 0 }}>
      {description}
    </Typography>
    {actionLabel && onAction ? <Button onClick={onAction}>{actionLabel}</Button> : null}
  </Box>
);
