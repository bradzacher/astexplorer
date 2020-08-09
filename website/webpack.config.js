const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

const DEV = process.env.NODE_ENV !== 'production';
const CACHE_BREAKER = Number(
  fs.readFileSync(path.join(__dirname, 'CACHE_BREAKER')),
);

const plugins = [
  new webpack.DefinePlugin({
    'process.env.API_HOST': JSON.stringify(process.env.API_HOST || ''),
  }),
  new webpack.IgnorePlugin(/\.md$/),
  new webpack.IgnorePlugin(/node\/nodeLoader.js/),
  // Usually babel-eslint tries to patch eslint, but we are using "parseNoPatch",
  // so that code patch will never be executed.
  new webpack.IgnorePlugin(/^eslint$/, /babel-eslint/),

  // eslint //

  // Shim ESLint stuff that's only relevant for Node.js
  new webpack.NormalModuleReplacementPlugin(
    /(cli-engine|testers\/rule-tester)/,
    'node-libs-browser/mock/empty'
  ),

  // More shims

  // Hack to disable Webpack dynamic requires in ESLint, so we don't end up
  // bundling the entire ESLint directory including files we don't even need.
  // https://github.com/webpack/webpack/issues/198
  new webpack.ContextReplacementPlugin(/eslint/, /NEVER_MATCH^/),

  new MiniCssExtractPlugin({
    filename: DEV ? '[name].css' : `[name]-[contenthash]-${CACHE_BREAKER}.css`,
    allChunks: true,
  }),

  new HtmlWebpackPlugin({
    favicon: './favicon.png',
    inject: 'body',
    filename: 'index.html',
    template: './index.ejs',
    chunksSortMode: 'id',
  }),

  // Inline runtime and manifest into the HTML. It's small and changes after every build.
  new InlineManifestWebpackPlugin(),
  DEV ? new webpack.NamedModulesPlugin() : new webpack.HashedModuleIdsPlugin(),
  new ProgressBarPlugin(),
];

module.exports = Object.assign(
  {
    optimization: {
      runtimeChunk: 'single',
      splitChunks: {
        cacheGroups: {
          parsermeta: {
            priority: 10,
            test: /\/package\.json$/,
            chunks(chunk) {
              return chunk.name === 'app';
            },
            minChunks: 1,
            minSize: 1,
          },
          vendors: {
            chunks(chunk) {
              return chunk.name === 'app';
            },
          },
        },
      },
      minimizer: [
        // new TerserPlugin({
        //   terserOptions: {
        //     keep_fnames: true,
        //   },
        // }),
      ],
    },

  module: {
    rules: [
      {
        test: /\.txt$/,
        exclude: /node_modules/,
        loader: 'raw-loader',
      },
      {
        test: /\.(jsx?|mjs)$/,
        type: 'javascript/auto',
        include: [
          path.join(__dirname, 'node_modules', '@babel/parser'),
          path.join(__dirname, 'node_modules', '@babel/core'),
          path.join(__dirname, 'node_modules', 'babel-plugin-macros'),
          path.join(__dirname, 'node_modules', 'eslint', 'lib'),
          path.join(__dirname, 'node_modules', 'react-redux', 'es'),
          path.join(__dirname, 'node_modules', 'redux', 'es'),
          path.join(__dirname, 'node_modules', 'redux-saga', 'es'),
          path.join(__dirname, 'src'),
        ],
        loader: 'babel-loader',
        options: {
          babelrc: false,
          presets: [
            [
              require.resolve('@babel/preset-env'),
              {
                targets: {
                  browsers: ['defaults'],
                },
                modules: 'commonjs',
                },
              ],
              require.resolve('@babel/preset-react'),
            ],
            plugins: [require.resolve('@babel/plugin-transform-runtime')],
          },
        },
        {
          test: /\.css$/,
          use: [
            DEV ? 'style-loader' : MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: { importLoaders: 1 },
            },
            'postcss-loader',
          ],
        },
        {
          test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: 'url-loader?limit=10000&mimetype=application/font-woff',
        },
        {
          test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          loader: 'file-loader',
        },
      ],

      noParse: [
        /typescript\/lib/,
      ],
    },

    node: {
      child_process: 'empty',
      fs: 'empty',
      module: 'empty',
      net: 'empty',
      readline: 'empty',
    },

    plugins: plugins,

    entry: {
      app: './src/app.js',
    },

    output: {
      path: path.resolve(__dirname, '../out'),
      filename: DEV ? '[name].js' : `[name]-[contenthash]-${CACHE_BREAKER}.js`,
      chunkFilename: DEV
        ? '[name].js'
        : `[name]-[contenthash]-${CACHE_BREAKER}.js`,
    },
  },

  DEV
    ? {
        devtool: 'eval',
      }
    : {},
);
