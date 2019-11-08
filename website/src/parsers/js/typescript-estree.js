import defaultParserInterface from './utils/defaultESTreeParserInterface';
import pkg from '@typescript-eslint/typescript-estree/package.json';

const ID = '@typescript-eslint/typescript-estree';

export default {
  ...defaultParserInterface,

  id: ID,
  displayName: ID,
  version: pkg.version,
  homepage: pkg.homepage || 'https://typescript-eslint.io/',
  locationProps: new Set(['loc', 'start', 'end', 'range']),

  loadParser(callback) {
    require(['@typescript-eslint/typescript-estree'], callback);
  },

  parse(parser, code, options) {
    return parser.parse(code, options);
  },

  getDefaultOptions() {
    return {
      comment: false,
      createDefaultProgram: true,
      errorOnTypeScriptSyntacticAndSemanticIssues: false,
      errorOnUnknownASTType: false,
      extraFileExtensions: [],
      jsx: true,
      loc: false,
      preserveNodeMaps: false,
      project: undefined,
      range: true,
      sourceType: 'module',
      tokens: false,
      useJSXTextNode: false,
    };
  },

  _getSettingsConfiguration() {
    return {
      fields: [
        'comment',
        'jsx',
        'loc',
        'range',
        'tokens',
        'useJSXTextNode',
      ],
    };
  },
};
