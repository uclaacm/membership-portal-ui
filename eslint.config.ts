import nextConfig from 'eslint-config-next';

const config = [
  ...nextConfig,
  {
    rules: {
      'no-restricted-syntax': ['error', {
        selector: "AssignmentExpression[left.type='MemberExpression'][left.property.name='defaultProps']",
        message: 'React 19 ignores defaultProps on function components. Use default parameters, or `static defaultProps` in a class.',
      }],
      // A `= []` / `= {}` default is a new object every render; hoist it to a module constant.
      'react/no-object-type-as-default-prop': 'error',
    },
  },
  {
    // Playwright fixtures call `use()`, which the React hooks rule mistakes for a hook.
    files: ['e2e/**'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
    },
  },
  {
    ignores: ['node_modules', '.next', 'build', 'dist', '.git', 'coverage', 'e2e/report', 'e2e/test-results']
  }
];

export default config;
