const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge'); // merge webpack configs
const Dotenv = require('dotenv-webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const DEVELOPMENT = process.env.NODE_ENV === 'development';

process.env.BABEL_ENV = process.env.NODE_ENV;

const APP_VERSION = 'v1';

const __srcdir = path.join(__dirname, `../src/${APP_VERSION}`);
const __nodemodulesdir = path.join(__dirname, '../node_modules');

// All dependencies will be copied to path, relative to bundles output
const STATIC_URL = path.join('/static/');

const common = {
  context: __srcdir,

  entry: {
    vendor: [
      'core-js/stable',
      'regenerator-runtime/runtime',
      path.join(__srcdir, '/js/components/editor')
    ],
    main: path.join(__srcdir, '/js/main.js'),
    // TODO: use 1 entry
    admission: path.join(__srcdir, '/js/admission/index.js'),
    teaching: path.join(__srcdir, '/js/teaching/index.js'),
    stats: path.join(__srcdir, '/js/stats/main.js'),
    supervising: path.join(__srcdir, '/js/supervising/index.js')
  },

  externals: {
    jquery: 'jQuery',
    // Note: EpicEditor is a dead library.
    EpicEditor: 'EpicEditor'
  },

  resolve: {
    extensions: ['.jsx', '.js'],
    modules: [path.join(__srcdir, '/js'), __nodemodulesdir],
    symlinks: false
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: [
          {
            loader: 'babel-loader'
          }
        ],
        include: path.resolve(__srcdir, 'js')
      },
      {
        test: /\.(js|jsx|ts|tsx)$/,
        include: [path.resolve(__nodemodulesdir, 'ky')],
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: false
            }
          }
        ]
      },
      {
        test: /\.s?[ac]ss$/,
        exclude: __nodemodulesdir,
        use: [
          DEVELOPMENT ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader', // translates CSS into CommonJS modules
          'postcss-loader',
          {
            loader: 'sass-loader', // compiles SASS to CSS
            options: {
              sassOptions: {
                outputStyle: 'expanded',
                // precision: 8,
                includePaths: [__nodemodulesdir]
              }
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          DEVELOPMENT ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      // Static in a project source directory
      {
        test: /\.woff2?$|\.ttf$|\.eot$|\.svg$|\.png$|\.jpg$|\.swf$/,
        exclude: __nodemodulesdir,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',
              emitFile: false, // since all images are in assets/img dir, do not copy paste it, use publicPath instead
              // FIXME: replace with __webpack_public_path__
              publicPath: STATIC_URL
            }
          }
        ]
      },
      // Serve static in node_modules/
      {
        test: /\.woff2?$|\.ttf$|\.eot$|\.svg$|\.png$|\.jpg$|\.swf$/,
        include: __nodemodulesdir,
        use: [
          {
            loader: 'file-loader',
            options: {
              context: __nodemodulesdir,
              name: file => {
                if (process.env.NODE_ENV === 'development') {
                  return `[path][name].[ext]`;
                }

                return '[path][contenthash].[ext]';
              },
              outputPath: 'assets',
              publicPath: (url, resourcePath, context) => {
                // `resourcePath` is original absolute path to asset
                // `context` is a directory where asset is stored (`rootContext` or `context` option)
                if (process.env.NODE_ENV === 'development') {
                  return `node_modules/${url}`;
                }
                return `assets/${url}`;
              },
              postTransformPublicPath: p => `__webpack_public_path__ + ${p}`,
              emitFile: !DEVELOPMENT
            }
          }
        ]
      }
    ]
  },

  plugins: [
    new Dotenv({
      path: path.join(__dirname, '.env'),
      silent: true
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: DEVELOPMENT ? '[name].css' : '[name].[hash].css',
      chunkFilename: DEVELOPMENT
        ? '[id].[name].css'
        : '[name]-[contenthash].css'
    })
  ],

  optimization: {
    splitChunks: {
      minChunks: 2,
      cacheGroups: {
        vendor: {
          name: 'vendor',
          test: 'vendor',
          enforce: true
        },
        forms: {
          name: 'forms',
          test: 'components/forms',
          enforce: true
        }
      }
    }
  }
};

let appConfig;
if (DEVELOPMENT) {
  appConfig = merge(common, require('./dev.config'));
} else {
  appConfig = merge(common, require('./prod.config'));
}

module.exports = appConfig;
