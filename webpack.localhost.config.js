var webpack = require('webpack');
require("expose-loader");
var Dotenv = require('dotenv-webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

var coreConfig = {
  devtool: "source-map",

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js", ".json", ".png"]
  },

  plugins: [
    new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify('localhost'),
          'REACT_APP_CHATBOT_API_BASE_URL': JSON.stringify('https://5c0608b5.ngrok.io'),
          'REACT_APP_CID': JSON.stringify('utilityco-utilitygo')
        }
    }),
    new CopyWebpackPlugin([{ from: 'src/assets', to: 'built/assets' }])
  ],

  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {
        enforce: "pre",
        test: /\.js$/,
        loader: "source-map-loader",
        exclude: [/node_modules/]
      },
      {
        test: require.resolve('adaptivecards'),
        use: [{ loader: 'expose-loader', options: 'AdaptiveCards' }]
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: [
          'url-loader?limit=1000000',
          'img-loader'
        ]
      }
    ]
  }
  /*,
  plugins: [
    new Dotenv({
      path: '.env',
      systemvars: true
    })
  ]*/
};

var chatConfig = {
  entry: "./src/BotChat.ts",
  output: {
    libraryTarget: "umd",
    library: "BotChat",
    filename: "./botchat.js"
  }
}

// Config for addon features
var featureConfig = {
  entry: {
    CognitiveServices: "./src/CognitiveServices/lib.ts"
  },
  output: {
    libraryTarget: "umd",
    library: "[name]",
    filename: "./[name].js",
  }
}

module.exports = [Object.assign(chatConfig, coreConfig), Object.assign(featureConfig, coreConfig)];
