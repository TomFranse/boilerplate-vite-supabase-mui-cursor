import { TextField, TextFieldProps } from "@mui/material";

export type InputProps = TextFieldProps;

export const Input = ({ ...props }: InputProps) => {
  return <TextField {...props} />;
};
