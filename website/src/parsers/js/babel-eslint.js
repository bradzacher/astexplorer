import defaultParserInterface from './utils/defaultESTreeParserInterface';
import pkg from '@babel/parser/package.json';

const ID = '@babel/parser';

const availablePlugins = [
  // From https://babeljs.io/docs/en/next/babel-parser.html

  // Miscellaneous
  'estree',

  // Language extensions
  'flow',
  'flowComments',
  'jsx',
  'typescript',
  'v8intrinsic',

  // ECMAScript Proposals
  'classProperties',
  'classPrivateProperties',
  'classPrivateMethods',
  'decorators',
  'doExpressions',
  'exportDefaultFrom',
  'functionBind',
  'functionSent',
  'importMeta',
  'logicalAssignment',
  'numericSeparator',
  'partialApplication',
  'pipelineOperator',
  'recordAndTuple',
  'throwExpressions',
  'topLevelAwait',
];

export const defaultOptions = {
  sourceType: 'module',
  allowImportExportEverywhere: false,
  ranges: false,
  tokens: false,
  plugins: [
    'classProperties',
    'classPrivateProperties',
    'classPrivateMethods',
    'decorators',
    'doExpressions',
    'exportDefaultFrom',
    'typescript',
    'estree',
    'functionSent',
    'functionBind',
    'jsx',
    'logicalAssignment',
    'numericSeparator',
  ],
};

export const parserSettingsConfiguration = {
  fields: [
    ['sourceType', ['module', 'script', 'unambiguous']],
    'allowImportExportEverywhere',
    'ranges',
    'tokens',
    {
      key: 'plugins',
      title: 'Plugins',
      fields: availablePlugins,
      settings: settings => settings.plugins || defaultOptions.plugins,
      values: plugins => availablePlugins.reduce(
        (obj, name) => ((obj[name] = plugins.indexOf(name) > -1), obj),
        {},
      ),
    },
    ['pipelineProposal', ['minimal', 'smart', 'fsharp']],
  ],
};

export default {
  ...defaultParserInterface,

  id: ID,
  displayName: '@babel/parser',
  version: pkg.version,
  homepage: pkg.homepage,
  locationProps: new Set(['range', 'loc', 'start', 'end']),
  _ignoredProperties: new Set(['extra']),

  loadParser(callback) {
    require(['@babel/parser'], callback);
  },

  parse(parser, code, options) {
    // TODO: Make decoratorsBeforeExport settable through settings somehow
    // TODO: Make pipelineOperator.proposal settable through settings somehow
    // TODO: Make recordAndTuple.syntaxType settable through settings somehow
    options.plugins = options.plugins.map(plugin => {
      switch (plugin) {
        case 'decorators':
          return ['decorators', {decoratorsBeforeExport: false}];
        case 'pipelineOperator':
          return ['pipelineOperator', {proposal: options.pipelineProposal}];
        case 'recordAndTuple':
          return ['recordAndTuple', { syntaxType: 'hash' }];
        default:
          return plugin;
      }
    });
    return parser.parse(code, options).program;
  },

  getNodeName(node) {
    switch (typeof node.type) {
      case 'string':
        return node.type;
      case 'object': return `Token (${node.type.label})`;
    }
  },

  nodeToRange(node) {
    if (typeof node.start !== 'undefined') {
      return [node.start, node.end];
    }
  },

  getDefaultOptions() {
    return defaultOptions;
  },

  _getSettingsConfiguration() {
    return parserSettingsConfiguration;
  },
};
