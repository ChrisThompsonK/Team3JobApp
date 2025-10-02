import type { Request, Response } from "express";
import { AppService } from "../services/app-service.js";

/**
 * Home Controller
 * Handles presentation logic for home-related routes
 */
export const HomeController = {
	/**
	 * Render the home page
	 */
	index(req: Request, res: Response): void {
		try {
			const userName = typeof req.query["user"] === "string" ? req.query["user"] : "Developer";
			const appInfo = AppService.getAppInfo(userName);

			res.render("index", appInfo);
		} catch (error) {
			console.error("Error in HomeController.index:", error);
			const nodeEnv = process.env["NODE_ENV"];
			res.status(500).render("error", {
				message: "Internal Server Error",
				error: nodeEnv === "development" ? error : {},
			});
		}
	},

	/**
	 * Render the DaisyUI component test page
	 */
	daisyuiTest(_req: Request, res: Response): void {
		try {
			res.render("daisyui-test");
		} catch (error) {
			console.error("Error in HomeController.daisyuiTest:", error);
			const nodeEnv = process.env["NODE_ENV"];
			res.status(500).render("error", {
				message: "Internal Server Error",
				error: nodeEnv === "development" ? error : {},
			});
		}
	},
} as const;
