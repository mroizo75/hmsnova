module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    // Forhindre dupliserte funksjoner
    'no-duplicate-imports': 'error',
    
    // Sikre type-sikkerhet
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'error',
    
    // Forhindre ubrukt kode
    'no-unused-vars': 'error',
    
    // Sikre konsistent koding
    'import/order': ['error', {
      'groups': ['builtin', 'external', 'internal'],
      'newlines-between': 'always',
      'alphabetize': { 'order': 'asc' }
    }]
  }
} 