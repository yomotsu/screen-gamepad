import stylistic from '@stylistic/eslint-plugin';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
	{
		ignores: [ 'dist/**', 'node_modules/**' ],
	},
	{
		files: [ '**/*.ts' ],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
			globals: {
				...globals.browser,
				...globals.node,
				console: 'writable',
				THREE: 'readonly',
			},
		},
		plugins: {
			'@stylistic': stylistic,
			'@typescript-eslint': typescriptPlugin,
		},
		rules: {
			'@stylistic/array-bracket-spacing': [ 'error', 'always', { singleValue: true, arraysInArrays: false } ],
			'@stylistic/block-spacing': [ 'error', 'always' ],
			'@stylistic/brace-style': [ 'error', '1tbs', { allowSingleLine: true } ],
			'@stylistic/comma-spacing': [ 'error', { before: false, after: true } ],
			'@stylistic/comma-style': [ 'error', 'last' ],
			'@stylistic/computed-property-spacing': [ 'error', 'always' ],
			'@stylistic/eol-last': [ 'error', 'always' ],
			'@stylistic/function-call-spacing': [ 'error', 'never' ],
			'@stylistic/indent': [ 'error', 'tab', { SwitchCase: 1, flatTernaryExpressions: true } ],
			'@stylistic/key-spacing': 'off',
			'@stylistic/new-parens': 'error',
			'@stylistic/no-extra-semi': 'warn',
			'@stylistic/no-multi-spaces': 'off',
			'@stylistic/no-trailing-spaces': 'error',
			'@stylistic/no-whitespace-before-property': 'error',
			'@stylistic/object-curly-spacing': [ 'error', 'always' ],
			'@stylistic/padded-blocks': [ 'error', { blocks: 'always', switches: 'always', classes: 'always' } ],
			'@stylistic/padding-line-between-statements': [ 'error', { blankLine: 'always', prev: 'block-like', next: '*' } ],
			'@stylistic/semi': [ 'error', 'always', { omitLastInOneLineBlock: true } ],
			'@stylistic/semi-spacing': [ 'error', { before: false, after: true } ],
			'@stylistic/space-before-blocks': [ 'error', { functions: 'always', keywords: 'always', classes: 'always' } ],
			'@stylistic/space-before-function-paren': [ 'error', { anonymous: 'always', named: 'never', asyncArrow: 'ignore' } ],
			'@stylistic/space-in-parens': [ 'error', 'always' ],
			'@stylistic/space-infix-ops': 'error',
			'@stylistic/space-unary-ops': [ 'error', { words: true, nonwords: true } ],
			'@typescript-eslint/no-unused-vars': 'warn',
			'no-undef': 'off',
			'no-unused-vars': 'off',
		},
	},
];
