const mongoose = require("mongoose");
const { resourceLimits } = require("worker_threads");

mongoose.connect("mongodb://localhost:27017/Registration", {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() => console.log("Connection Successfull.."))
  .catch((err) => console.log(err));