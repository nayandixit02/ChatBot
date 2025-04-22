// import dotenv from "dotenv";
// dotenv.config();

// import app from "./app.js";
// import { connectToDatabase } from "./db/connections.js";

// //connections and listeners
// const PORT = process.env.PORT || 5000;
// connectToDatabase()
//   .then(() => {
//     app.listen(PORT, () => console.log("Server Open & connected to Database"));
//   })
//   .catch((err) => console.log(err));

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import app from "./app.js";
import { connectToDatabase } from "./db/connections.js";

// Serve frontend static files in production
if (process.env.NODE_ENV === "production") {
  const __dirname = path.resolve();
  app.use(express.static(path.join(__dirname, "public")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "public", "index.html"));
  });
}

// Database connection and server start
const PORT = process.env.PORT || 5000;
connectToDatabase()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`✅ Server running on port ${PORT} & connected to DB`)
    );
  })
  .catch((err) => console.log("❌ DB Connection Failed:", err));
