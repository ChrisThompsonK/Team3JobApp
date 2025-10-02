import type { NextFunction, Request, Response } from "express";
import { HttpError, HttpStatusCode } from "../models/errors.js";

/**
 * Not found middleware - throws HttpError instead of direct response
 */
export const notFoundHandler = (
	req: Request,
	_res: Response,
	next: NextFunction,
): void => {
	const error = new HttpError(
		`Cannot ${req.method} ${req.path}`,
		HttpStatusCode.NOT_FOUND,
	);
	next(error);
};
