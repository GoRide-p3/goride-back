import "dotenv/config";
import { app } from "./app.js";
import { createServer } from "http";
import { initSocketIO } from "./lib/socket.js";

const port = Number(process.env.PORT ?? 3000);

const httpServer = createServer(app);
initSocketIO(httpServer);
httpServer.listen(port, () => {
 console.log(`GoRide API running at http://localhost:${port}`);
});
