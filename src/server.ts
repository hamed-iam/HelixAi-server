import { PORT } from "./config.js"
import ExpressConfig from "./Express/express.config.js"

const app = ExpressConfig()

app.listen(PORT, () => console.log("Server Running on Port " + PORT))