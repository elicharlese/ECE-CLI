module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    '@typescript-eslint/ban-ts-comment': 'off',
    'react/no-unescaped-entities': 'off',
  },
  overrides: [
    {
      files: ['src/app/api/orders/webhook/route.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
      }
    }
  ]
};
