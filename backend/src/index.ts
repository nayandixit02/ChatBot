import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectToDatabase } from "./db/connections.js";

//connections and listeners
const PORT = process.env.PORT || 5000;
connectToDatabase()
  .then(() => {
    app.listen(PORT, () => console.log("Server Open & connected to Database"));
  })
  .catch((err) => console.log(err));
