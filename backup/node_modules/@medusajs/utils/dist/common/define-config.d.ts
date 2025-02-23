import { ConfigModule, ExternalModuleDeclaration, InternalModuleDeclaration } from "@medusajs/types";
export declare const DEFAULT_STORE_RESTRICTED_FIELDS: string[];
type InternalModuleDeclarationOverride = InternalModuleDeclaration & {
    /**
     * Optional key to be used to identify the module, if not provided, it will be inferred from the module joiner config service name.
     */
    key?: string;
    /**
     * By default, modules are enabled, if provided as true, this will disable the module entirely.
     */
    disable?: boolean;
};
type ExternalModuleDeclarationOverride = ExternalModuleDeclaration & {
    /**
     * key to be used to identify the module, if not provided, it will be inferred from the module joiner config service name.
     */
    key: string;
    /**
     * By default, modules are enabled, if provided as true, this will disable the module entirely.
     */
    disable?: boolean;
};
type Config = Partial<Omit<ConfigModule, "admin" | "modules"> & {
    admin: Partial<ConfigModule["admin"]>;
    modules: Partial<InternalModuleDeclarationOverride | ExternalModuleDeclarationOverride>[]
    /**
     * @deprecated use the array instead
     */
     | ConfigModule["modules"];
}>;
/**
 * The "defineConfig" helper can be used to define the configuration
 * of a medusa application.
 *
 * The helper under the hood merges your config with a set of defaults to
 * make an application work seamlessly, but still provide you the ability
 * to override configuration as needed.
 */
export declare function defineConfig(config?: Config): ConfigModule;
export {};
//# sourceMappingURL=define-config.d.ts.map