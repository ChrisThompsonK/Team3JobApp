import express from "express";
import nunjucks from "nunjucks";
import { config } from "./config/index.js";
import { errorHandler, notFoundHandler, requestLogger } from "./middleware/index.js";
import routes from "./routes/index.js";

/**
 * Create and configure the Express application
 */
export const createApp = (): express.Application => {
	const app = express();

	// Configure Nunjucks template engine
	nunjucks.configure(config.paths.views, {
		autoescape: config.template.autoescape,
		express: app,
		watch: config.template.watch,
	});

	// Set template engine
	app.set("view engine", config.template.engine);
	app.set("views", config.paths.views);

	// Middleware setup
	app.use(requestLogger);
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	// Serve static files
	app.use(express.static(config.paths.public));

	// Routes
	app.use("/", routes);

	// Error handling
	app.use(notFoundHandler);
	app.use(errorHandler);

	return app;
};

/**
 * Start the server
 */
export const startServer = async (app: express.Application): Promise<void> => {
	try {
		console.log(`🚀 ${config.app.name} is starting...`);

		const server = app.listen(config.server.port, () => {
			console.log(`✅ Server running on http://${config.server.host}:${config.server.port}`);
			console.log(
				`📊 Health check available at http://${config.server.host}:${config.server.port}/health`,
			);
			console.log(`🏗️  Environment: ${config.env.nodeEnv}`);
		});

		// Graceful shutdown
		process.on("SIGTERM", () => {
			console.log("🛑 SIGTERM received, shutting down gracefully");
			server.close(() => {
				console.log("✅ Process terminated");
				process.exit(0);
			});
		});

		process.on("SIGINT", () => {
			console.log("🛑 SIGINT received, shutting down gracefully");
			server.close(() => {
				console.log("✅ Process terminated");
				process.exit(0);
			});
		});
	} catch (error) {
		console.error("❌ Error starting server:", error);
		process.exit(1);
	}
};
