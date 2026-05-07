import EditIcon from "@mui/icons-material/Edit";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LoadingScreen } from "../../../components/LoadingScreen";
import { PageHeader } from "../../../components/PageHeader";
import { useLanguage } from "../../../hooks/useLanguage";
import { formatDate, getErrorMessage } from "../../../lib/format";
import { useReportDetails } from "../api";

const getAttachmentName = (attachment: string) => {
  try {
    const url = new URL(attachment);
    return decodeURIComponent(
      url.pathname.split("/").filter(Boolean).pop() || attachment
    );
  } catch {
    return attachment.split("/").filter(Boolean).pop() || attachment;
  }
};

const getAttachmentExtension = (attachment: string) => {
  const path = attachment.split("?")[0].split("#")[0];
  return path.split(".").pop()?.toLowerCase() || "";
};

const isImageAttachment = (attachment: string) =>
  ["apng", "avif", "gif", "jpg", "jpeg", "png", "svg", "webp"].includes(
    getAttachmentExtension(attachment)
  );

const isPdfAttachment = (attachment: string) =>
  getAttachmentExtension(attachment) === "pdf";

const AttachmentGallery = ({
  attachments,
  originalLabel,
}: {
  attachments: string[];
  originalLabel: string;
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedAttachment = attachments[selectedIndex] || attachments[0];
  const selectedName = getAttachmentName(selectedAttachment);
  const selectedIsImage = isImageAttachment(selectedAttachment);
  const selectedIsPdf = isPdfAttachment(selectedAttachment);

  useEffect(() => {
    setSelectedIndex(0);
  }, [attachments]);

  const goToPrevious = () =>
    setSelectedIndex((current) =>
      current === 0 ? attachments.length - 1 : current - 1
    );
  const goToNext = () =>
    setSelectedIndex((current) =>
      current === attachments.length - 1 ? 0 : current + 1
    );

  return (
    <Stack spacing={1.5} sx={{ mt: 1 }}>
      <Box
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
          sx={{ p: 1.25, borderBottom: 1, borderColor: "divider" }}
        >
          <Typography fontWeight={700} noWrap title={selectedName}>
            {selectedName}
          </Typography>
          <Button
            href={selectedAttachment}
            target="_blank"
            rel="noreferrer"
            variant="outlined"
            size="small"
            endIcon={<OpenInNewIcon fontSize="small" />}
            sx={{ flexShrink: 0 }}
          >
            {originalLabel}
          </Button>
        </Stack>
        <Box
          sx={{
            position: "relative",
            minHeight: { xs: 320, md: 620 },
            bgcolor: "background.default",
          }}
        >
          {attachments.length > 1 ? (
            <>
              <IconButton
                aria-label="Previous attachment"
                onClick={goToPrevious}
                sx={{
                  position: "absolute",
                  zIndex: 2,
                  top: "50%",
                  left: 12,
                  transform: "translateY(-50%)",
                  bgcolor: "background.paper",
                  boxShadow: 2,
                  "&:hover": { bgcolor: "background.paper" },
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
              <IconButton
                aria-label="Next attachment"
                onClick={goToNext}
                sx={{
                  position: "absolute",
                  zIndex: 2,
                  top: "50%",
                  right: 12,
                  transform: "translateY(-50%)",
                  bgcolor: "background.paper",
                  boxShadow: 2,
                  "&:hover": { bgcolor: "background.paper" },
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </>
          ) : null}
          {selectedIsImage ? (
            <>
              <img
                id="hereimg1"
                // component="img"
                src={selectedAttachment}
                alt={selectedName}
                style={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                  // objectFit: 'contain'
                }}
              />
            </>
          ) : (
            <Box
              component="iframe"
              src={selectedAttachment}
              title={selectedName}
              sx={{
                display: "block",
                width: "100%",
                height: selectedIsPdf
                  ? { xs: 420, md: 680 }
                  : { xs: 320, md: 620 },
                border: 0,
              }}
            />
          )}
        </Box>
      </Box>

      {attachments.length > 1 ? (
        <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 0.5 }}>
          {attachments.map((attachment, index) => {
            const name = getAttachmentName(attachment);
            const isImage = isImageAttachment(attachment);
            const isPdf = isPdfAttachment(attachment);
            const isSelected = index === selectedIndex;

            return (
              <Box
                component="button"
                key={attachment}
                type="button"
                onClick={() => setSelectedIndex(index)}
                title={name}
                sx={{
                  width: 104,
                  height: 80,
                  flex: "0 0 auto",
                  p: 0,
                  border: 2,
                  borderColor: isSelected ? "primary.main" : "divider",
                  borderRadius: 1.5,
                  overflow: "hidden",
                  bgcolor: "background.paper",
                  cursor: "pointer",
                }}
              >
                {isImage ? (
                  <>
                    
                    <img
                      id="hereimg2"
                      src={attachment}
                      alt={name}
                      style={{
                        display: "block",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </>
                ) : (
                  <Stack
                    alignItems="center"
                    justifyContent="center"
                    spacing={0.5}
                    sx={{ width: "100%", height: "100%", px: 1 }}
                  >
                    {isPdf ? (
                      <PictureAsPdfIcon color="error" />
                    ) : (
                      <InsertDriveFileIcon color="action" />
                    )}
                    <Typography
                      variant="caption"
                      noWrap
                      sx={{ maxWidth: "100%" }}
                    >
                      {name}
                    </Typography>
                  </Stack>
                )}
              </Box>
            );
          })}
        </Stack>
      ) : null}
    </Stack>
  );
};

export const ReportDetailsPage = ({ reportId }: { reportId: string }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { data, isLoading, isError, error } = useReportDetails(reportId);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isError || !data) {
    return <Alert severity="error">{getErrorMessage(error)}</Alert>;
  }

  const patient = typeof data.patientId === "string" ? null : data.patientId;

  return (
    <div>
      <PageHeader
        title={t("reportsPage.detailsTitle")}
        subtitle={t("reportsPage.sessionDate", { date: formatDate(data.date) })}
        action={
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() =>
              navigate({
                to: "/reports/$reportId/edit",
                params: { reportId: data._id },
              })
            }
          >
            {t("common.editReport")}
          </Button>
        }
      />

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography>
              <strong>{t("reportsPage.detailsPatient")}:</strong>{" "}
              {patient?.fullName || t("common.unknownPatient")}
            </Typography>
            <Typography>
              <strong>{t("reportsPage.detailsDiagnosis")}:</strong>{" "}
              {data.diagnosis}
            </Typography>
            <Typography>
              <strong>{t("reportsPage.detailsTreatment")}:</strong>{" "}
              {data.treatmentPlan}
            </Typography>
            <Typography>
              <strong>{t("reportsPage.detailsSessionNotes")}:</strong>{" "}
              {data.sessionNotes}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography>
                <strong>{t("reportsPage.detailsProgress")}:</strong>
              </Typography>
              <Chip
                label={t(`common.${data.progress}` as const)}
                color="primary"
                variant="outlined"
              />
            </Stack>
            <div>
              <Typography fontWeight={700}>
                {t("common.attachments")}
              </Typography>
              {data.attachments?.length ? (
                <AttachmentGallery
                  attachments={data.attachments}
                  originalLabel={t("common.view")}
                />
              ) : (
                <Typography color="text.secondary">
                  {t("common.noAttachments")}
                </Typography>
              )}
            </div>
          </Stack>
        </CardContent>
      </Card>
    </div>
  );
};
