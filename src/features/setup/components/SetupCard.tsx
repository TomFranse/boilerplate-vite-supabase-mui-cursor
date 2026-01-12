import {
  CardHeader,
  CardContent,
  CardActions,
  Button,
  Typography,
  Chip,
  Avatar,
} from "@mui/material";
import { CheckCircle, SkipNext, HourglassEmpty, RadioButtonUnchecked } from "@mui/icons-material";
import { Card } from "@/components/common/Card";
import type { SetupStatus } from "@utils/setupUtils";

interface SetupCardProps {
  title: string;
  description: string;
  status: SetupStatus;
  onClick: () => void;
}

const statusConfig: Record<
  SetupStatus,
  {
    icon: React.ReactNode;
    color: "default" | "primary" | "success" | "warning";
    label: string;
    buttonText: string;
    avatarColor: string;
  }
> = {
  "not-started": {
    icon: <RadioButtonUnchecked />,
    color: "default",
    label: "Not Started",
    buttonText: "Configure",
    avatarColor: "grey.400",
  },
  "in-progress": {
    icon: <HourglassEmpty />,
    color: "primary",
    label: "In Progress",
    buttonText: "Continue",
    avatarColor: "primary.main",
  },
  completed: {
    icon: <CheckCircle />,
    color: "success",
    label: "Completed",
    buttonText: "View Configuration",
    avatarColor: "success.main",
  },
  skipped: {
    icon: <SkipNext />,
    color: "default",
    label: "Skipped",
    buttonText: "Configure",
    avatarColor: "grey.400",
  },
};

export const SetupCard = ({ title, description, status, onClick }: SetupCardProps) => {
  const config = statusConfig[status];
  const isCompleted = status === "completed";
  const isSkipped = status === "skipped";
  const baseElevation = isCompleted ? 4 : 1;

  return (
    <Card
      baseElevation={baseElevation}
      hoverElevation={6}
      sx={{
        opacity: isSkipped ? 0.7 : 1,
      }}
    >
      <CardHeader
        avatar={
          <Avatar
            sx={{
              bgcolor: config.avatarColor,
              width: (theme) => theme.spacing(5),
              height: (theme) => theme.spacing(5),
            }}
          >
            {config.icon}
          </Avatar>
        }
        title={
          <Typography variant="h6" component="h3">
            {title}
          </Typography>
        }
        action={
          <Chip
            label={config.label}
            size="small"
            color={config.color}
            icon={config.icon as React.ReactElement}
            variant={isCompleted ? "filled" : "outlined"}
          />
        }
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          variant={isCompleted ? "outlined" : "contained"}
          color={isCompleted ? "success" : "primary"}
          fullWidth
          onClick={onClick}
          sx={{ mx: 1, mb: 1 }}
        >
          {config.buttonText}
        </Button>
      </CardActions>
    </Card>
  );
};
