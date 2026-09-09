/**
 * Standardized HTTP response utilities for GraminSarthi-AI backend
 */
import type { ServerResponse } from "node:http";

const FRONTEND_URL = process.env.FRONTEND_URL || process.env.FRONTEND_ORIGIN || "http://localhost:3000";

export function setCorsHeaders(res: ServerResponse) {
    res.setHeader("Access-Control-Allow-Origin", FRONTEND_URL);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
}

export function sendJson(res: ServerResponse, status: number, body: unknown) {
    setCorsHeaders(res);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.statusCode = status;
    res.end(JSON.stringify(body));
}

export function sendSuccess(res: ServerResponse, data: unknown, status = 200) {
    sendJson(res, status, { success: true, data });
}

export function sendList(res: ServerResponse, data: any[], status = 200) {
    sendJson(res, status, { success: true, data, count: data.length });
}

export function sendError(res: ServerResponse, message: string, status = 400) {
    sendJson(res, status, { success: false, message });
}