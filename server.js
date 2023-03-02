import "express-async-errors";

// other packages

import connectDB from "./db/connect.js";
import createServer from "./utils/createServer.js";

const app = createServer();

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, async () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
