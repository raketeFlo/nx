import { dirname, join } from 'path';
import { existsSync } from 'fs';

import { readJsonFile } from '../utils/fileutils';
import { workspaceRoot } from '../utils/workspace-root';
import { PackageManager } from '../utils/package-manager';
import {
  InputDefinition,
  TargetConfiguration,
  TargetDependencyConfig,
} from './workspace-json-project-json';

export type ImplicitDependencyEntry<T = '*' | string[]> = {
  [key: string]: T | ImplicitJsonSubsetDependency<T>;
};

export interface ImplicitJsonSubsetDependency<T = '*' | string[]> {
  [key: string]: T | ImplicitJsonSubsetDependency<T>;
}

export interface NxAffectedConfig {
  /**
   * Default based branch used by affected commands.
   */
  defaultBase?: string;
}

export type TargetDefaults = Record<string, Partial<TargetConfiguration>>;

export type TargetDependencies = Record<
  string,
  (TargetDependencyConfig | string)[]
>;

export interface NrwlJsPluginConfig {
  analyzeSourceFiles?: boolean;
  analyzePackageJson?: boolean;
  analyzeLockfile?: boolean;
}

interface NxInstallationConfiguration {
  /**
   * Version used for Nx
   */
  version: string;
  /**
   * Record<pluginPackageName, pluginVersion>. e.g.
   * plugins: { '@nx/angular': '1.0.0' }
   */
  plugins?: Record<string, string>;
}

/**
 * Nx.json configuration
 *
 * @note: when adding properties here add them to `allowedWorkspaceExtensions` in adapter/compat.ts
 */
export interface NxJsonConfiguration<T = '*' | string[]> {
  /**
   * Optional (additional) Nx.json configuration file which becomes a base for this one
   */
  extends?: string;
  /**
   * Map of files to projects that implicitly depend on them
   * @deprecated use {@link namedInputs} instead. For more information see https://nx.dev/deprecated/global-implicit-dependencies#global-implicit-dependencies
   */
  implicitDependencies?: ImplicitDependencyEntry<T>;
  /**
   * Named inputs targets can refer to reduce duplication
   */
  namedInputs?: { [inputName: string]: (string | InputDefinition)[] };
  /**
   * Dependencies between different target names across all projects
   */
  targetDefaults?: TargetDefaults;
  /**
   * @deprecated This is inferred from the package.json in the workspace root. Please use {@link getNpmScope} instead.
   * NPM Scope that the workspace uses
   */
  npmScope?: string;
  /**
   * Default options for `nx affected`
   */
  affected?: NxAffectedConfig;
  /**
   * Where new apps + libs should be placed
   */
  workspaceLayout?: {
    libsDir: string;
    appsDir: string;
  };
  /**
   * Available Task Runners
   */
  tasksRunnerOptions?: {
    [tasksRunnerName: string]: {
      /**
       * Path to resolve the runner
       */
      runner: string;
      /**
       * Default options for the runner
       */
      options?: any;
    };
  };
  /**
   * List of default values used by generators.
   *
   * These defaults are global. They are used when no other defaults are configured.
   *
   * Example:
   *
   * ```
   * {
   *   "@nx/react": {
   *     "library": {
   *       "style": "scss"
   *     }
   *   }
   * }
   * ```
   */
  generators?: { [collectionName: string]: { [generatorName: string]: any } };

  /**
   * Default generator collection. It is used when no collection is provided.
   */
  cli?: {
    packageManager?: PackageManager;

    /**
     * @deprecated - defaultCollection is deprecated and will be removed
     */
    defaultCollection?: string;
    defaultProjectName?: string;
  };
  /**
   * Plugins for extending the project graph
   */
  plugins?: string[];

  /**
   * Configuration for Nx Plugins
   */
  pluginsConfig?: Record<string, unknown>;

  /**
   * Default project. When project isn't provided, the default project
   * will be used. Convenient for small workspaces with one main application.
   */
  defaultProject?: string;

  /**
   * Configures the Nx installation for a repo. Useful for maintaining  a separate
   * set of dependencies for Nx + Plugins compared to the base package.json, but also
   * useful for workspaces that don't have a root package.json + node_modules.
   */
  installation?: NxInstallationConfiguration;
}

export function readNxJson(root: string = workspaceRoot): NxJsonConfiguration {
  const nxJson = join(root, 'nx.json');
  if (existsSync(nxJson)) {
    const nxJsonConfiguration = readJsonFile<NxJsonConfiguration>(nxJson);
    if (nxJsonConfiguration.extends) {
      const extendedNxJsonPath = require.resolve(nxJsonConfiguration.extends, {
        paths: [dirname(nxJson)],
      });
      const baseNxJson = readJsonFile<NxJsonConfiguration>(extendedNxJsonPath);
      return {
        ...baseNxJson,
        ...nxJsonConfiguration,
      };
    } else {
      return nxJsonConfiguration;
    }
  } else {
    try {
      return readJsonFile(join(__dirname, '..', '..', 'presets', 'core.json'));
    } catch (e) {
      return {};
    }
  }
}

export function hasNxJson(root: string): boolean {
  const nxJson = join(root, 'nx.json');
  return existsSync(nxJson);
}
