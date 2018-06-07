const path = require('path');
const webpack = require('webpack');
const BundleTracker = require('webpack-bundle-tracker');
const merge = require('webpack-merge');  // merge webpack configs
const CleanWebpackPlugin = require('clean-webpack-plugin');  // clean build dir before building
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const DEBUG = (process.env.NODE_ENV !== "production");

const development = require('./dev.config');
const production = require('./prod.config');
const TARGET = process.env.npm_lifecycle_event;

process.env.BABEL_ENV = process.env.NODE_ENV;

const APP_VERSION = "v2";

const __srcdir = path.join(__dirname, `../src/${APP_VERSION}`);
const __nodemodulesdir = path.join(__dirname, '../node_modules');
let __bundlesdir = path.join(__dirname, `../assets/${APP_VERSION}/dist/js`);

// All dependencies will be copied to path, relative to bundles output
const STATIC_PATH = path.join('/static/', __bundlesdir);
const STATIC_URL = path.join('/static/');

const PATHS = {
    common: path.join(__srcdir, '/js/main.js'),
};

const common = {
    context: __srcdir,

    entry: {
        common: [
            '@babel/polyfill',
            'jquery',
            'popper.js',
            'fontfaceobserver',
        ],
        main: PATHS.common,
    },

    output: {
        filename: '[name]-[hash].js',
        path: __bundlesdir,
    },

    externals: {},

    resolve: {
        extensions: ['.jsx', '.js'],
        modules: [
            path.join(__srcdir, '/js'),
            __nodemodulesdir
        ],
        symlinks: false
    },

    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                include: path.resolve(__srcdir, "js"),
                use: [
                    {
                        loader: 'babel-loader',
                    }
                ]
            },
            {
                test: /\.js$/,
                include: path.resolve(__nodemodulesdir, "bootstrap"),
                use: [{
                    loader: 'babel-loader',
                    options: {
                        babelrc: false,
                        cacheDirectory: true,
                        plugins: [
                            "@babel/plugin-proposal-object-rest-spread"
                        ]
                    }
                }]
            },
            {
                test: /\.s?[ac]ss$/,
                exclude: __nodemodulesdir,
                use: [
                    DEBUG ? 'style-loader' : MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader', // translates CSS into CommonJS modules
                        options: {
                            minimize: !DEBUG,
                            sourceMap: DEBUG,
                        }
                    },
                    {
                        loader: 'postcss-loader', // Run post css actions
                        options: {
                            // See `postcss.config.js` for details
                            sourceMap: DEBUG,
                        }
                    },
                    {
                        loader: 'sass-loader', // compiles SASS to CSS
                        options: {
                            sourceMap: DEBUG,
                            outputStyle: 'expanded',
                            includePaths: [__nodemodulesdir,]
                        }
                    },
                ],
            },
            {
                test: /\.woff2?$|\.ttf$|\.eot$|\.svg|\.png|\.jpg$/,
                exclude: __nodemodulesdir,
                use: [{
                    loader: "file-loader",
                    options: {
                        // context: __nodemodulesdir,
                        name: '[path][name].[ext]',
                        emitFile: false, // since all images are in assets/img dir, do not copy paste it, use publicPath instead
                        publicPath: STATIC_URL
                    }
                }]
            },
            {
                test: /\.swf$/,
                include: __nodemodulesdir,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            context: __nodemodulesdir,
                            publicPath: STATIC_PATH,
                            name: '[path][name].[ext]'
                        }
                    }
                ],
            },
        ]
    },

    plugins: [
        new BundleTracker({filename: './webpack-stats-v2.json'}),
        // Fixes warning in moment-with-locales.min.js
        //   Module not found: Error: Can't resolve './locale' in ...
        new webpack.IgnorePlugin(/^\.\/locale$/),
        // TODO: Prevent autoload jquery for now
        // new webpack.ProvidePlugin({
        //     '$': 'jquery',
        //     'jQuery': 'jquery',
        //     'window.jQuery': 'jquery'
        // }),
        new CleanWebpackPlugin([__bundlesdir], {
            verbose: true,
            exclude: ['.gitattributes'],
            root: process.cwd()
        }),
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: DEBUG ? '[name].css' : '[name].[hash].css',
            chunkFilename: DEBUG ? '[id].css' : '[id].[hash].css',
        })
    ],

    optimization: {
        splitChunks: {
            chunks: "async",
            minSize: 30000,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 3,
            automaticNameDelimiter: '~',
            name: true,
            cacheGroups: {
                common: {
                    chunks: "all",
                    test: "common",
                    name: "common",
                    enforce: true
                },
                // react: {
                //     chunks: "all",
                //     test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                //     name: "react",
                //     enforce: true,
                // },
                vendors: {
                    // chunks: "all",
                    minChunks: 2,
                    test: /[\\/]node_modules[\\/]/,
                    priority: -10,
                    // reuseExistingChunk: true
                },
                // default: {
                //     minChunks: 2,
                //     priority: -20,
                //     reuseExistingChunk: true
                // }
            }
        }
    }

};

let appConfig;
if (['dev2', 'start'].includes(TARGET) || !TARGET) {
    appConfig = merge(common, development);
}
if (TARGET === 'prod2' || !TARGET) {
    appConfig = merge(common, production);
}

module.exports = appConfig;