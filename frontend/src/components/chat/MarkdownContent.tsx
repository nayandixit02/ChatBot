import React, { useState } from "react";
import { Box, Typography, IconButton, Tooltip } from "@mui/material";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  atomDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { IoCopyOutline, IoCheckmarkOutline } from "react-icons/io5";
import { useThemeMode } from "../../context/ThemeContext";

interface MarkdownContentProps {
  content: string;
}

const CodeBlock = ({
  language,
  code,
  isDark,
}: {
  language: string;
  code: string;
  isDark: boolean;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box
      sx={{
        my: 2,
        borderRadius: 2,
        overflow: "hidden",
        border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}`,
        bgcolor: isDark ? "#0d1520" : "#f1f5f9",
        boxShadow: isDark
          ? "0 4px 20px rgba(0,0,0,0.4)"
          : "0 2px 10px rgba(0,0,0,0.06)",
      }}
    >
      {/* Code Header Bar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
          py: 0.8,
          bgcolor: isDark ? "#09101a" : "#e2e8f0",
          borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
        }}
      >
        <Typography
          sx={{
            fontSize: "12px",
            fontFamily: "monospace",
            fontWeight: 700,
            textTransform: "uppercase",
            color: isDark ? "#38bdf8" : "#0284c7",
            letterSpacing: "0.5px",
          }}
        >
          {language || "code"}
        </Typography>

        <Tooltip title={copied ? "Copied!" : "Copy Code"}>
          <IconButton
            size="small"
            onClick={handleCopy}
            sx={{
              color: copied ? "#10b981" : isDark ? "#94a3b8" : "#64748b",
              p: 0.5,
              fontSize: "16px",
              "&:hover": {
                color: isDark ? "#ffffff" : "#0f172a",
                bgcolor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
              },
            }}
          >
            {copied ? <IoCheckmarkOutline /> : <IoCopyOutline />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Syntax Highlighted Code */}
      <SyntaxHighlighter
        language={language || "javascript"}
        style={isDark ? atomDark : oneLight}
        customStyle={{
          margin: 0,
          padding: "16px",
          fontSize: "14px",
          backgroundColor: isDark ? "#0d1520" : "#f8fafc",
          fontFamily: "'Fira Code', 'Consolas', 'Courier New', monospace",
          lineHeight: 1.5,
        }}
      >
        {code.trim()}
      </SyntaxHighlighter>
    </Box>
  );
};

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {
  const { isDark } = useThemeMode();

  if (!content) return null;

  // Split content by fenced code blocks ```lang ... ```
  const parts = content.split(/(```[\s\S]*?```)/g);

  const formatInlineText = (text: string): React.ReactNode => {
    // Split by inline code `...`
    const inlineParts = text.split(/(`[^`]+`)/g);

    return inlineParts.map((sub, i) => {
      if (sub.startsWith("`") && sub.endsWith("`")) {
        const inlineCode = sub.slice(1, -1);
        return (
          <Box
            component="span"
            key={i}
            sx={{
              fontFamily: "monospace",
              px: 0.8,
              py: 0.2,
              mx: 0.3,
              borderRadius: "4px",
              fontSize: "0.9em",
              bgcolor: isDark
                ? "rgba(56, 189, 248, 0.15)"
                : "rgba(2, 132, 199, 0.12)",
              color: isDark ? "#38bdf8" : "#0284c7",
              fontWeight: 600,
            }}
          >
            {inlineCode}
          </Box>
        );
      }

      // Handle bold **text**
      const boldParts = sub.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bChunk, bi) => {
        if (bChunk.startsWith("**") && bChunk.endsWith("**")) {
          return (
            <Box
              component="strong"
              key={bi}
              sx={{
                fontWeight: 700,
                color: isDark ? "#ffffff" : "#0f172a",
              }}
            >
              {bChunk.slice(2, -2)}
            </Box>
          );
        }

        // Handle italic *text* or _text_
        const italicParts = bChunk.split(/(\*[^*]+\*)/g);
        return italicParts.map((iChunk, ii) => {
          if (
            iChunk.startsWith("*") &&
            iChunk.endsWith("*") &&
            iChunk.length > 2
          ) {
            return (
              <Box component="em" key={ii} sx={{ fontStyle: "italic" }}>
                {iChunk.slice(1, -1)}
              </Box>
            );
          }
          return iChunk;
        });
      });
    });
  };

  const renderTextParagraphs = (rawText: string, keyPrefix: number) => {
    const lines = rawText.split("\n");

    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Heading level 3: ###
      if (trimmed.startsWith("### ")) {
        return (
          <Typography
            key={`${keyPrefix}-${idx}`}
            component="h4"
            sx={{
              fontSize: "1.15rem",
              fontWeight: 700,
              mt: 2,
              mb: 0.8,
              color: isDark ? "#38bdf8" : "#0369a1",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {formatInlineText(trimmed.slice(4))}
          </Typography>
        );
      }

      // Heading level 2: ##
      if (trimmed.startsWith("## ")) {
        return (
          <Typography
            key={`${keyPrefix}-${idx}`}
            component="h3"
            sx={{
              fontSize: "1.3rem",
              fontWeight: 800,
              mt: 2.5,
              mb: 1,
              color: isDark ? "#00fffc" : "#0284c7",
              borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
              pb: 0.5,
            }}
          >
            {formatInlineText(trimmed.slice(3))}
          </Typography>
        );
      }

      // Heading level 1: #
      if (trimmed.startsWith("# ")) {
        return (
          <Typography
            key={`${keyPrefix}-${idx}`}
            component="h2"
            sx={{
              fontSize: "1.45rem",
              fontWeight: 800,
              mt: 3,
              mb: 1.5,
              color: isDark ? "#ffffff" : "#0f172a",
            }}
          >
            {formatInlineText(trimmed.slice(2))}
          </Typography>
        );
      }

      // Bullet List Item: * or -
      if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
        return (
          <Box
            key={`${keyPrefix}-${idx}`}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              my: 0.5,
              pl: 1.5,
              gap: 1.2,
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: isDark ? "#38bdf8" : "#0284c7",
                mt: "8px",
                flexShrink: 0,
              }}
            />
            <Typography
              component="div"
              sx={{
                fontSize: "15.5px",
                lineHeight: 1.65,
                color: isDark ? "#e2e8f0" : "#334155",
              }}
            >
              {formatInlineText(trimmed.slice(2))}
            </Typography>
          </Box>
        );
      }

      // Numbered List Item: e.g. 1. or 2.
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <Box
            key={`${keyPrefix}-${idx}`}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              my: 0.6,
              pl: 1,
              gap: 1,
            }}
          >
            <Typography
              component="span"
              sx={{
                fontWeight: 700,
                color: isDark ? "#38bdf8" : "#0284c7",
                fontSize: "15px",
                minWidth: "20px",
                flexShrink: 0,
              }}
            >
              {numMatch[1]}.
            </Typography>
            <Typography
              component="div"
              sx={{
                fontSize: "15.5px",
                lineHeight: 1.65,
                color: isDark ? "#e2e8f0" : "#334155",
              }}
            >
              {formatInlineText(numMatch[2])}
            </Typography>
          </Box>
        );
      }

      // Empty line / break
      if (!trimmed) {
        return <Box key={`${keyPrefix}-${idx}`} sx={{ height: "8px" }} />;
      }

      // Normal paragraph
      return (
        <Typography
          key={`${keyPrefix}-${idx}`}
          sx={{
            fontSize: "15.5px",
            lineHeight: 1.7,
            my: 0.5,
            color: isDark ? "#e2e8f0" : "#1e293b",
          }}
        >
          {formatInlineText(line)}
        </Typography>
      );
    });
  };

  return (
    <Box sx={{ width: "100%", overflowWrap: "break-word" }}>
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const match = part.match(/^```([a-zA-Z0-9_-]*)\n([\s\S]*?)```$/);
          const lang = match ? match[1] : "";
          const code = match ? match[2] : part.slice(3, -3);
          return (
            <CodeBlock
              key={index}
              language={lang || "typescript"}
              code={code}
              isDark={isDark}
            />
          );
        }
        return (
          <Box key={index} sx={{ my: 0.5 }}>
            {renderTextParagraphs(part, index)}
          </Box>
        );
      })}
    </Box>
  );
};

export default MarkdownContent;
