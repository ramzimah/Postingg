const express = require("express");
const app = express();
const connectdb = require("./config/db");
connectdb();
const port = process.env.PORT || 8000;
app.use(express.json());
app.use("/api/user", require("./routes/user"));
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
