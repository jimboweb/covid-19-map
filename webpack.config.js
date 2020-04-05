const path = require("path");
const webpack = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// module.exports is NodeJS's way of exporting code from a file,
// so that it can be made available in other files. It's what
// enables Webpack to read our configuration from a .js file.
module.exports = (env, argv) => {
  // whether or not we're in development mode
  // this affects how some of the config options are set
  const devMode = argv.env.NODE_ENV !== "production";

  if (argv.mode === "development") {
    console.log("webpack is in dev mode");
  } else if (argv.mode === "production") {
    console.log("webpack is in production mode");
  } else {
    console.log("webpack has no mode defined");
  }

  // this defines a configuration object that NodeJS can pass to Webpack
  const config = {
    // specify Webpack's "mode" as "development";
    // we can also specify "production" for a production optimized build
    // mode: argv.mode,

    // "entry" points to our source file(s) which is used to create Webpack's dependency tree
    entry: {
      index: "./src/index.js"
    },

    // "output" specifies where our processed files will end up
    output: {
      // "[name]" tells webpack to use the same name as the key from "entry" above
      // "[chunkhash]" gives the output file(s) a "hash", which will help with cache-busing browsers
      filename: devMode ? "[name].js" : "[name].[contenthash].js",

      // tell webpack to put our processed files in a directory called "dist"
      path: path.resolve(__dirname, "dist")
    },

    // "devtool" tells webpack what type of source maps to use
    devtool: devMode ? "source-map" : "cheap-source-map",

    // configuration for webpack's development server
    devServer: {
      contentBase: "./dist",
      // use webpack's hot module replacement
      // see: https://webpack.js.org/guides/hot-module-replacement/
      hot: true
    },

    // "module" is where we tell webpack how to handle our various modules / files
    module: {
      // "rules" tells webpack how it should handle file types
      rules: [
        // this "rule" tells webpack what "loaders" to use to process our CSS
        {
          // use a Regular Expression to tell webpack what type of file(s) this rule targets
          test: /\.css$/,
          // tell webpack what "loaders" to use to process this file type
          use: [
            {
              // use the  MiniCssExtractPlugin's loader
              loader: MiniCssExtractPlugin.loader,
              options: {
                // enables hot module replacement for css files
                hmr: devMode,
                // fallback to a full page reload if hmr is not present
                reloadAll: true
              }
            },
            "css-loader"
          ]
        },

        // this "rule" tells webpack what "loader(s)" to use to process our JS
        {
          // only target .js files
          test: /\.js$/,

          // tell webpack to ignore the node_modules directory for this rule
          exclude: /node_modules/,

          // many options in webpack's config can take a value as an array or object
          // here we're specify an object with additonal properties, such as
          // plugins for babel to use
          use: {
            loader: "babel-loader",
            options: {
              presets: [
                [
                  "@babel/preset-env",
                  {
                    useBuiltIns: "entry",
                    targets: "> 0.25%, not dead",
                    corejs: { version: 3, proposals: true }
                  }
                ]
              ],
              plugins: ["@babel/plugin-proposal-object-rest-spread"]
            }
          }
        }
      ]
    },

    // "optimization" specifies how webpack should handle code optimization when it's being transpiled
    // for example, we can split our source code from our "vendor" dependencies
    optimization: {
      moduleIds: "hashed",
      runtimeChunk: "single",
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all"
          },
          styles: {
            name: "styles",
            test: /\.css$/,
            chunks: "all",
            enforce: true
          }
        }
      }
    },

    // what plugins Webpack should use for advanced functionality
    plugins: [
      // makes sure our output folder is cleaned before adding new files to it
      new CleanWebpackPlugin(),

      // handles HTML files
      new HtmlWebpackPlugin({ template: "./public/index.html" }),

      // handles copying files that aren't "imported" into our JS to the output directory
      new CopyPlugin([
        "./data/states.geojson",
        { from: "public/assets/mapIcons", to: "assets/mapIcons" }
      ]),

      // handles extracting our CSS into a file(s)
      new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // all options are optional
        filename: devMode ? "[name].css" : "[name].[contenthash].css",
        chunkFilename: devMode ? "[id].css" : "[id].[contenthash].css",
        ignoreOrder: false // Enable to remove warnings about conflicting order
      }),

      // allows for variables to be available in our app code
      // helpful for enabling certain things when in development that you might not
      // want in production, such as logging
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(argv.env.NODE_ENV)
      })
    ]
  };

  return config;
};
