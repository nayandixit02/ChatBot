import { Box, Avatar, Typography } from "@mui/material";
import { useAuth } from "../../context/useAuth";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function extractCodeFromString(message: string) {
  if (message && message.includes("```")) {
    const blocks = message.split("```");
    return blocks;
  }
  return null;
}

function isCodeBlock(str: string) {
  if (!str) return false;
  if (
    str.includes("=") ||
    str.includes(";") ||
    str.includes("[") ||
    str.includes("]") ||
    str.includes("{") ||
    str.includes("}") ||
    str.includes("#") ||
    str.includes("//") ||
    str.includes("function") ||
    str.includes("const ") ||
    str.includes("let ") ||
    str.includes("import ")
  ) {
    return true;
  }
  return false;
}

const ChatItem = ({
  content,
  role,
}: {
  content: string;
  role: "user" | "assistant";
}) => {
  const messageBlocks = extractCodeFromString(content);
  const auth = useAuth();

  const userInitial1 = auth?.user?.name?.[0]?.toUpperCase() || "U";
  const userInitial2 = auth?.user?.name?.split(" ")?.[1]?.[0]?.toUpperCase() || "";

  return role === "assistant" ? (
    <Box
      sx={{
        display: "flex",
        p: 2,
        bgcolor: "#004d5612",
        gap: 2,
        borderRadius: 2,
        my: 1,
        border: "1px solid rgba(0, 255, 252, 0.1)",
      }}
    >
      <Avatar sx={{ ml: "0", bgcolor: "#00fffc", color: "black", fontWeight: 700 }}>
        <img
          src="/gemini.png"
          alt="gemini"
          width={"30px"}
          onError={(e) => {
            (e.target as HTMLElement).style.display = "none";
          }}
        />
        🤖
      </Avatar>
      <Box sx={{ width: "100%", overflowX: "auto" }}>
        {!messageBlocks && (
          <Typography sx={{ fontSize: "17px", whiteSpace: "pre-wrap", color: "white" }}>
            {content}
          </Typography>
        )}
        {messageBlocks &&
          messageBlocks.map((block, index) =>
            isCodeBlock(block) ? (
              <Box key={index} my={1}>
                <SyntaxHighlighter
                  style={coldarkDark}
                  language="javascript"
                  customStyle={{ borderRadius: "8px" }}
                >
                  {block.trim()}
                </SyntaxHighlighter>
              </Box>
            ) : (
              <Typography
                key={index}
                sx={{ fontSize: "17px", whiteSpace: "pre-wrap", color: "white" }}
              >
                {block}
              </Typography>
            )
          )}
      </Box>
    </Box>
  ) : (
    <Box
      sx={{
        display: "flex",
        p: 2,
        bgcolor: "#004d56",
        gap: 2,
        borderRadius: 2,
        my: 1,
      }}
    >
      <Avatar sx={{ ml: "0", bgcolor: "black", color: "white", fontWeight: 700 }}>
        {userInitial1}
        {userInitial2}
      </Avatar>
      <Box sx={{ width: "100%", overflowX: "auto" }}>
        {!messageBlocks && (
          <Typography sx={{ fontSize: "17px", whiteSpace: "pre-wrap", color: "white" }}>
            {content}
          </Typography>
        )}
        {messageBlocks &&
          messageBlocks.map((block, index) =>
            isCodeBlock(block) ? (
              <Box key={index} my={1}>
                <SyntaxHighlighter
                  style={coldarkDark}
                  language="javascript"
                  customStyle={{ borderRadius: "8px" }}
                >
                  {block.trim()}
                </SyntaxHighlighter>
              </Box>
            ) : (
              <Typography
                key={index}
                sx={{ fontSize: "17px", whiteSpace: "pre-wrap", color: "white" }}
              >
                {block}
              </Typography>
            )
          )}
      </Box>
    </Box>
  );
};

export default ChatItem;
