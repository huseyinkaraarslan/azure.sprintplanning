module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: [
        'plugin:vue/essential',
        '@vue/standard',
        '@vue/typescript/recommended'
    ],
    parserOptions: {
        ecmaVersion: 2020
    },
    rules: {
        'newline-before-return': 'error',
        '@typescript/interface-name-prefix': 'off',
        'object-curly-spacing': [2, 'never'],
        'space-before-function-paren': ['error', {
            anonymous: 'never',
            named: 'never',
            asyncArrow: 'always'
        }],
        indent: [
            'error',
            4
        ],
        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        semi: 0,
        'vue/html-self-closing': [1, {
            'html': {
                'void': 'always',
                'normal': 'always',
                'component': 'always'
            },
            'svg': 'always',
            'math': 'always'
        }],
        "@typescript-eslint/no-explicit-any": "off",
        'vue/no-use-v-if-with-v-for': ['error', {
            'allowUsingIterationVar': false
        }]
    },
    overrides: [
        {
            files: [
                '**/__tests__/*.{j,t}s?(x)',
                '**/tests/unit/**/*.spec.{j,t}s?(x)'
            ]
        }
    ]
}
