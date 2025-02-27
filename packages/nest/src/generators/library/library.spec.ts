import type { Tree } from '@nx/devkit';
import * as devkit from '@nx/devkit';
import { readJson, readProjectConfiguration } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { libraryGenerator } from './library';

describe('lib', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    jest.clearAllMocks();
  });

  describe('not nested', () => {
    it('should update project configuration', async () => {
      await libraryGenerator(tree, {
        name: 'myLib',
        projectNameAndRootFormat: 'as-provided',
      });

      const config = readProjectConfiguration(tree, 'my-lib');
      expect(config.root).toEqual(`my-lib`);
      expect(config.targets.build).toBeUndefined();
      expect(config.targets.lint).toEqual({
        executor: '@nx/linter:eslint',
        outputs: ['{options.outputFile}'],
        options: {
          lintFilePatterns: [`my-lib/**/*.ts`],
        },
      });
      expect(config.targets.test).toEqual({
        executor: '@nx/jest:jest',
        outputs: [`{workspaceRoot}/coverage/{projectRoot}`],
        options: {
          jestConfig: `my-lib/jest.config.ts`,
          passWithNoTests: true,
        },
        configurations: {
          ci: {
            ci: true,
            codeCoverage: true,
          },
        },
      });
    });

    it('should include a controller', async () => {
      await libraryGenerator(tree, {
        name: 'myLib',
        controller: true,
        projectNameAndRootFormat: 'as-provided',
      });

      expect(tree.exists(`my-lib/src/lib/my-lib.controller.ts`)).toBeTruthy();
    });

    it('should include a service', async () => {
      await libraryGenerator(tree, {
        name: 'myLib',
        service: true,
        projectNameAndRootFormat: 'as-provided',
      });

      expect(tree.exists(`my-lib/src/lib/my-lib.service.ts`)).toBeTruthy();
    });

    it('should add the @Global decorator', async () => {
      await libraryGenerator(tree, {
        name: 'myLib',
        global: true,
        projectNameAndRootFormat: 'as-provided',
      });

      expect(
        tree.read(`my-lib/src/lib/my-lib.module.ts`, 'utf-8')
      ).toMatchSnapshot();
    });

    it('should remove the default file from @nx/node:lib', async () => {
      await libraryGenerator(tree, {
        name: 'myLib',
        global: true,
        projectNameAndRootFormat: 'as-provided',
      });

      expect(tree.exists(`my-lib/src/lib/my-lib.spec.ts`)).toBeFalsy();
      expect(tree.exists(`my-lib/src/lib/my-lib.ts`)).toBeFalsy();
    });

    it('should provide the controller and service', async () => {
      await libraryGenerator(tree, {
        name: 'myLib',
        controller: true,
        service: true,
        projectNameAndRootFormat: 'as-provided',
      });

      expect(
        tree.read(`my-lib/src/lib/my-lib.module.ts`, 'utf-8')
      ).toMatchSnapshot();
      expect(
        tree.read(`my-lib/src/lib/my-lib.controller.ts`, 'utf-8')
      ).toMatchSnapshot();
      expect(tree.read(`my-lib/src/index.ts`, 'utf-8')).toMatchSnapshot();
    });

    it('should update tags', async () => {
      await libraryGenerator(tree, {
        name: 'myLib',
        tags: 'one,two',
        projectNameAndRootFormat: 'as-provided',
      });

      const projects = Object.fromEntries(devkit.getProjects(tree));
      expect(projects).toEqual({
        ['my-lib']: expect.objectContaining({
          tags: ['one', 'two'],
        }),
      });
    });

    it('should update root tsconfig.json', async () => {
      await libraryGenerator(tree, {
        name: 'myLib',
        projectNameAndRootFormat: 'as-provided',
      });

      const tsconfigJson = readJson(tree, '/tsconfig.base.json');
      expect(tsconfigJson.compilerOptions.paths[`@proj/my-lib`]).toEqual([
        `my-lib/src/index.ts`,
      ]);
    });

    it('should create a local tsconfig.json', async () => {
      await libraryGenerator(tree, {
        name: 'myLib',
        projectNameAndRootFormat: 'as-provided',
      });

      const tsconfigJson = readJson(tree, `my-lib/tsconfig.json`);
      expect(tsconfigJson).toMatchSnapshot();
    });

    it('should extend the local tsconfig.json with tsconfig.spec.json', async () => {
      await libraryGenerator(tree, {
        name: 'myLib',
        projectNameAndRootFormat: 'as-provided',
      });

      const tsconfigJson = readJson(tree, `my-lib/tsconfig.spec.json`);
      expect(tsconfigJson.extends).toEqual('./tsconfig.json');
    });

    it('should extend the local tsconfig.json with tsconfig.lib.json', async () => {
      await libraryGenerator(tree, {
        name: 'myLib',
        projectNameAndRootFormat: 'as-provided',
      });

      const tsconfigJson = readJson(tree, `my-lib/tsconfig.lib.json`);
      expect(tsconfigJson.extends).toEqual('./tsconfig.json');
      expect(tsconfigJson.exclude).toEqual([
        'jest.config.ts',
        'src/**/*.spec.ts',
        'src/**/*.test.ts',
      ]);
    });

    it('should generate files', async () => {
      await libraryGenerator(tree, {
        name: 'myLib',
        projectNameAndRootFormat: 'as-provided',
      });

      expect(tree.exists(`my-lib/jest.config.ts`)).toBeTruthy();
      expect(tree.exists(`my-lib/src/index.ts`)).toBeTruthy();
      expect(tree.exists(`my-lib/src/lib/my-lib.spec.ts`)).toBeFalsy();
      expect(readJson(tree, `my-lib/.eslintrc.json`)).toMatchSnapshot();
    });
  });

  describe('nested', () => {
    it('should update tags', async () => {
      await libraryGenerator(tree, {
        name: 'myLib',
        directory: 'my-dir/my-lib',
        tags: 'one,two',
        projectNameAndRootFormat: 'as-provided',
      });

      const projects = Object.fromEntries(devkit.getProjects(tree));
      expect(projects).toEqual({
        [`my-lib`]: expect.objectContaining({
          tags: ['one', 'two'],
        }),
      });
    });

    it('should generate files', async () => {
      await libraryGenerator(tree, {
        name: 'myLib',
        directory: 'my-dir/my-lib',
        projectNameAndRootFormat: 'as-provided',
      });

      expect(tree.exists(`my-dir/my-lib/jest.config.ts`)).toBeTruthy();
      expect(tree.exists(`my-dir/my-lib/src/index.ts`)).toBeTruthy();
      expect(tree.exists(`my-dir/my-lib/src/lib/my-lib.spec.ts`)).toBeFalsy();
    });

    it('should update workspace.json', async () => {
      await libraryGenerator(tree, {
        name: 'myLib',
        directory: 'my-dir/my-lib',
        projectNameAndRootFormat: 'as-provided',
      });

      const project = readProjectConfiguration(tree, `my-lib`);
      expect(project.root).toEqual(`my-dir/my-lib`);
      expect(project.targets.lint).toEqual({
        executor: '@nx/linter:eslint',
        outputs: ['{options.outputFile}'],
        options: {
          lintFilePatterns: [`my-dir/my-lib/**/*.ts`],
        },
      });
    });

    it('should update tsconfig.json', async () => {
      await libraryGenerator(tree, {
        name: 'myLib',
        directory: 'my-dir/my-lib',
        projectNameAndRootFormat: 'as-provided',
      });

      const tsconfigJson = readJson(tree, '/tsconfig.base.json');
      expect(tsconfigJson.compilerOptions.paths[`@proj/my-lib`]).toEqual([
        `my-dir/my-lib/src/index.ts`,
      ]);
      expect(tsconfigJson.compilerOptions.paths[`my-lib/*`]).toBeUndefined();
    });

    it('should create a local tsconfig.json', async () => {
      await libraryGenerator(tree, {
        name: 'myLib',
        directory: 'my-dir/my-lib',
        projectNameAndRootFormat: 'as-provided',
      });

      expect(readJson(tree, `my-dir/my-lib/tsconfig.json`)).toMatchSnapshot();
    });
  });

  describe('--strict', () => {
    it('should update the projects tsconfig with strict true', async () => {
      await libraryGenerator(tree, {
        name: 'myLib',
        strict: true,
        projectNameAndRootFormat: 'as-provided',
      });

      const tsConfig = readJson(tree, `/my-lib/tsconfig.lib.json`);
      expect(tsConfig.compilerOptions.strictNullChecks).toBeTruthy();
      expect(tsConfig.compilerOptions.noImplicitAny).toBeTruthy();
      expect(tsConfig.compilerOptions.strictBindCallApply).toBeTruthy();
      expect(
        tsConfig.compilerOptions.forceConsistentCasingInFileNames
      ).toBeTruthy();
      expect(tsConfig.compilerOptions.noFallthroughCasesInSwitch).toBeTruthy();
    });
  });

  describe('--unit-test-runner none', () => {
    it('should not generate test configuration', async () => {
      await libraryGenerator(tree, {
        name: 'myLib',
        unitTestRunner: 'none',
        projectNameAndRootFormat: 'as-provided',
      });

      expect(tree.exists(`my-lib/tsconfig.spec.json`)).toBeFalsy();
      expect(tree.exists(`my-lib/jest.config.ts`)).toBeFalsy();
      expect(tree.exists(`my-lib/lib/my-lib.spec.ts`)).toBeFalsy();
      expect(readJson(tree, `my-lib/tsconfig.json`)).toMatchSnapshot();
      const project = readProjectConfiguration(tree, 'my-lib');
      expect(project.targets.test).toBeUndefined();
      expect(project.targets.lint).toMatchSnapshot();
    });
  });

  describe('publishable package', () => {
    it('should update package.json', async () => {
      const importPath = `@proj/myLib`;

      await libraryGenerator(tree, {
        name: 'myLib',
        publishable: true,
        importPath,
        projectNameAndRootFormat: 'as-provided',
      });

      const packageJson = readJson(tree, `my-lib/package.json`);
      expect(packageJson.name).toEqual(importPath);
    });
  });

  describe('compiler options target', () => {
    it('should set target to es6 in tsconfig.lib.json by default', async () => {
      await libraryGenerator(tree, {
        name: 'myLib',
        projectNameAndRootFormat: 'as-provided',
      });

      const tsconfigJson = readJson(tree, `my-lib/tsconfig.lib.json`);
      expect(tsconfigJson.compilerOptions.target).toEqual('es6');
    });

    it('should set target to es2021 in tsconfig.lib.json', async () => {
      await libraryGenerator(tree, {
        name: 'myLib',
        target: 'es2021',
        projectNameAndRootFormat: 'as-provided',
      });

      const tsconfigJson = readJson(tree, `my-lib/tsconfig.lib.json`);
      expect(tsconfigJson.compilerOptions.target).toEqual('es2021');
    });
  });

  describe('--skipFormat', () => {
    it('should format files by default', async () => {
      jest.spyOn(devkit, 'formatFiles');

      await libraryGenerator(tree, {
        name: 'myLib',
        projectNameAndRootFormat: 'as-provided',
      });

      expect(devkit.formatFiles).toHaveBeenCalled();
    });

    it('should not format files when --skipFormat=true', async () => {
      jest.spyOn(devkit, 'formatFiles');

      await libraryGenerator(tree, {
        name: 'myLib',
        skipFormat: true,
        projectNameAndRootFormat: 'as-provided',
      });

      expect(devkit.formatFiles).not.toHaveBeenCalled();
    });
  });

  describe('--testEnvironment', () => {
    it('should set target jest testEnvironment to node by default', async () => {
      await libraryGenerator(tree, {
        name: 'myLib',
        projectNameAndRootFormat: 'as-provided',
      });

      expect(tree.read(`my-lib/jest.config.ts`, 'utf-8')).toMatchSnapshot();
    });

    it('should set target jest testEnvironment to jsdom', async () => {
      await libraryGenerator(tree, {
        name: 'myLib',
        testEnvironment: 'jsdom',
        projectNameAndRootFormat: 'as-provided',
      });

      expect(tree.read(`my-lib/jest.config.ts`, 'utf-8')).toMatchSnapshot();
    });
  });

  describe('--simpleName', () => {
    it('should generate a library with a simple name', async () => {
      await libraryGenerator(tree, {
        name: 'myLib',
        simpleName: true,
        directory: 'api/my-lib',
        service: true,
        controller: true,
        projectNameAndRootFormat: 'as-provided',
      });

      const indexFile = tree.read('api/my-lib/src/index.ts', 'utf-8');

      expect(indexFile).toContain(`export * from './lib/my-lib.module';`);
      expect(indexFile).toContain(`export * from './lib/my-lib.service';`);
      expect(indexFile).toContain(`export * from './lib/my-lib.controller';`);

      expect(tree.exists('api/my-lib/src/lib/my-lib.module.ts')).toBeTruthy();

      expect(tree.exists('api/my-lib/src/lib/my-lib.service.ts')).toBeTruthy();

      expect(
        tree.exists('api/my-lib/src/lib/my-lib.service.spec.ts')
      ).toBeTruthy();

      expect(
        tree.exists('api/my-lib/src/lib/my-lib.controller.ts')
      ).toBeTruthy();

      expect(
        tree.exists('api/my-lib/src/lib/my-lib.controller.spec.ts')
      ).toBeTruthy();
    });
  });
});
