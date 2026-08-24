import TextField from "@mui/material/TextField";
import { useThemeMode } from "../../context/ThemeContext";

type Props = {
  name: string;
  type: string;
  label: string;
};

const CustomizedInput = (props: Props) => {
  const { isDark } = useThemeMode();

  return (
    <TextField
      margin="normal"
      name={props.name}
      label={props.label}
      type={props.type}
      InputLabelProps={{
        style: {
          color: isDark ? "#94a3b8" : "#64748b",
          fontFamily: "inherit",
        },
      }}
      InputProps={{
        style: {
          width: "100%",
          maxWidth: "400px",
          borderRadius: 12,
          fontSize: 16,
          color: isDark ? "#f8fafc" : "#0f172a",
          backgroundColor: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.02)",
        },
      }}
      sx={{
        width: "100%",
        maxWidth: "400px",
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)",
          },
          "&:hover fieldset": {
            borderColor: isDark ? "#00fffc" : "#0284c7",
          },
          "&.Mui-focused fieldset": {
            borderColor: isDark ? "#00fffc" : "#0284c7",
            borderWidth: "1.5px",
          },
        },
      }}
    />
  );
};

export default CustomizedInput;
