const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors())

const {userRoutes} = require("./routes/allroutes")

app.use(express.json());

app.use(userRoutes)







app.listen(3000)