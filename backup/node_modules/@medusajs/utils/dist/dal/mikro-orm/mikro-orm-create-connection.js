"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomTsMigrationGenerator = void 0;
exports.mikroOrmCreateConnection = mikroOrmCreateConnection;
const migrations_1 = require("@mikro-orm/migrations");
const common_1 = require("../../common");
const utils_1 = require("../utils");
class CustomTsMigrationGenerator extends migrations_1.TSMigrationGenerator {
    createStatement(sql, padLeft) {
        if ((0, common_1.isString)(sql)) {
            sql = (0, utils_1.normalizeMigrationSQL)(sql);
        }
        return super.createStatement(sql, padLeft);
    }
}
exports.CustomTsMigrationGenerator = CustomTsMigrationGenerator;
async function mikroOrmCreateConnection(database, entities, pathToMigrations) {
    let schema = database.schema || "public";
    let driverOptions = database.driverOptions ?? {
        connection: { ssl: false },
    };
    let clientUrl = database.clientUrl;
    if (database.connection) {
        // Reuse already existing connection
        // It is important that the knex package version is the same as the one used by MikroORM knex package
        driverOptions = database.connection;
        clientUrl =
            database.connection.context?.client?.config?.connection?.connectionString;
        schema = database.connection.context?.client?.config?.searchPath;
    }
    const { MikroORM } = await import("@mikro-orm/postgresql");
    return await MikroORM.init({
        discovery: { disableDynamicFileAccess: true, warnWhenNoEntities: false },
        entities,
        debug: database.debug ?? process.env.NODE_ENV?.startsWith("dev") ?? false,
        baseDir: process.cwd(),
        clientUrl,
        schema,
        driverOptions,
        tsNode: process.env.APP_ENV === "development",
        type: "postgresql",
        filters: database.filters ?? {},
        migrations: {
            disableForeignKeys: false,
            path: pathToMigrations,
            generator: CustomTsMigrationGenerator,
            silent: !(database.debug ??
                process.env.NODE_ENV?.startsWith("dev") ??
                false),
        },
        schemaGenerator: {
            disableForeignKeys: false,
        },
        pool: {
            min: 2,
            ...database.pool,
        },
    });
}
//# sourceMappingURL=mikro-orm-create-connection.js.map