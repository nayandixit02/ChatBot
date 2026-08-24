import { TypeAnimation } from "react-type-animation";
import { useThemeMode } from "../../context/ThemeContext";

const TypingAnim = () => {
  const { isDark } = useThemeMode();

  return (
    <TypeAnimation
      sequence={[
        "Chat With Your OWN AI",
        1000,
        "Powered by Google Gemini 🌟",
        2000,
        "Your Own Customized Gemini Bot 💻",
      ]}
      speed={50}
      style={{
        fontSize: "clamp(28px, 5vw, 56px)",
        fontWeight: 800,
        color: isDark ? "#ffffff" : "#0f172a",
        display: "inline-block",
        textAlign: "center",
        textShadow: isDark
          ? "0 0 30px rgba(0, 255, 252, 0.3)"
          : "0 2px 10px rgba(0, 0, 0, 0.08)",
        transition: "color 0.3s ease",
      }}
      repeat={Infinity}
    />
  );
};

export default TypingAnim;
