const app = require("./app");
const config = require("./app/config");
const MongoDB = require("./app/utils/mongodb.util");

async function startServer() {
    try {
        await MongoDB.connect(config.db.uri);
        console.log("Connected to Database");

        const PORT = config.app.port;
        app.listen(PORT, () => {
            console.log(`Server is serving on port ${PORT}`);
        });
    } catch(error) {
        console.log("Cannot connect to Database", error);
        process.exit();
    }
}

startServer();
