/**
 * Neon PostgreSQL Database Connection Layer
 * Connects to Neon PostgreSQL serverless database using DATABASE_URL.
 * Integrates connection pooling, parameterized queries, transaction runner,
 * and seamless fallback persistence.
 */
import "dotenv/config";
import {
    pool,
    query,
    getClient,
    withTransaction,
    getDbEngine,
    checkPostgresHealth,
    testDirectPostgresConnection,
    initDatabaseSchema
} from "../db/index.js";

export {
    pool,
    query,
    getClient,
    withTransaction,
    getDbEngine,
    checkPostgresHealth,
    testDirectPostgresConnection,
    initDatabaseSchema
};

export default {
    pool,
    query,
    getClient,
    withTransaction,
    getDbEngine,
    checkPostgresHealth,
    testDirectPostgresConnection,
    initDatabaseSchema
};

