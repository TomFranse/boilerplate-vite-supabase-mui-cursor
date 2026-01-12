import { Card as MuiCard, CardProps as MuiCardProps } from "@mui/material";

export interface CardProps extends MuiCardProps {
  /**
   * Whether the card should have hover elevation effect
   * @default true
   */
  hoverable?: boolean;
  /**
   * Base elevation level
   * @default 1
   */
  baseElevation?: number;
  /**
   * Elevation level on hover (only applies if hoverable is true)
   * @default 6
   */
  hoverElevation?: number;
}

export const Card = ({
  children,
  hoverable = true,
  baseElevation = 1,
  hoverElevation = 6,
  elevation = baseElevation,
  sx,
  ...props
}: CardProps) => {
  return (
    <MuiCard
      elevation={elevation}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        maxWidth: 400,
        width: "100%",
        borderRadius: 4,
        transition: "box-shadow 0.2s ease-in-out",
        "& .MuiCardHeader-root": {
          padding: 3,
        },
        "& .MuiCardContent-root": {
          padding: 3,
        },
        "& .MuiCardActions-root": {
          padding: 3,
        },
        ...(hoverable && {
          "&:hover": {
            boxShadow: hoverElevation,
          },
        }),
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiCard>
  );
};
