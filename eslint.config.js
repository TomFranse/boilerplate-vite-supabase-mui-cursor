import gtsConfig from './node_modules/gts/build/src/index.js';
import ignores from './eslint.ignores.js';
import {defineConfig} from 'eslint/config';
import sonarjs from 'eslint-plugin-sonarjs';

export default defineConfig([
  {
    ignores: [
      ...ignores,
      'eslint.config.js', // Ignore config files
      'eslint.ignores.js',
    ],
  },
  ...gtsConfig,
  {
    plugins: {
      sonarjs,
    },
    languageOptions: {
      parserOptions: {
        // Only use tsconfig.app.json - it's the actual app config
        // Using both tsconfig files causes duplicate parsing and slows down linting
        project: ['./tsconfig.app.json'],
      },
    },
    rules: {
      // Override GTS's quote rule to match Prettier (double quotes)
      // GTS defaults to single quotes, but Prettier is configured for double quotes
      // This ensures ESLint doesn't conflict with Prettier's formatting
      quotes: ['warn', 'double', { avoidEscape: true }],
      // Disable React import requirement (using new JSX transform with jsx: "react-jsx")
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      // Complexity rules - set to warn for existing code
      complexity: ['warn', { max: 10 }],
      'max-depth': ['warn', { max: 4 }],
      'max-lines-per-function': ['warn', { max: 100, skipBlankLines: true, skipComments: true }],
      'max-statements': ['warn', { max: 15 }], // Increased to accommodate standard async patterns with error handling
      'max-params': ['warn', { max: 3 }],
      'sonarjs/cognitive-complexity': ['warn', 15],
    },
  },
  // Prevent feature components from importing hooks or services
  {
    files: ['src/features/**/components/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@features/*/hooks', '@features/*/services'],
              message:
                'Components cannot import from hooks or services. Use hooks instead.',
            },
          ],
        },
      ],
    },
  },
  // Prevent hooks from importing components
  {
    files: ['src/features/**/hooks/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@features/*/components'],
              message: 'Hooks cannot import from components.',
            },
          ],
        },
      ],
    },
  },
  // Prevent common components from importing features
  {
    files: ['src/common/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@features/**'],
              message: 'Common components cannot import from features.',
            },
          ],
        },
      ],
    },
  },
]);

