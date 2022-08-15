// const version = require('./package.json').version;
const webpack = require('webpack');
const ReplaceInFileWebpackPlugin = require('replace-in-file-webpack-plugin');
const zlib = require("zlib");
const CompressionPlugin = require('compression-webpack-plugin');
const path = require('path');

const isProd = process.env.NODE_ENV === 'production';
const prefixed = process.env.BUILD_PREFIXED;

module.exports = {
  productionSourceMap: !isProd,
  publicPath: ((isProd && prefixed ) ? ('/'+prefixed) : undefined),
  filenameHashing: false,
  pluginOptions: {
    quasar: {
      importStrategy: 'kebab',
      rtlSupport: false
    }
  },
  configureWebpack: {
    resolve: {
      alias: {
        components: path.join(__dirname, 'src/components'),
        forms: path.join(__dirname, 'src/forms'),
        classes: path.join(__dirname, 'src/classes'),
        shared: path.join(__dirname, '../shared'),
      },
      extensions: ['.vue', '.js'],
    },
    // output: {
    //   filename: '[name].js',
    //   chunkFilename: '[name].js',
    // },
    output: {
      // chunkFilename: `[name].js`,
    },
    plugins: (isProd ? ([
      new ReplaceInFileWebpackPlugin([{
                dir: 'dist',
                test: /\.js$/,
                rules: [{
                    search: /home[a-zA-Z0-9_]+node_modules_/ig,
                    replace: 'hiddenpath',
                },{
                    search: /home\/[a-zA-Z0-9/]+app/ig,
                    replace: 'hiddenpath2',
                }]
            }]),
      new CompressionPlugin({
        filename: "[path][base].br",
        algorithm: "brotliCompress",
        test: [
                /(\?.*)?\.(js|css|html|svg|woff|woff2)$/,
                /(js|css|html|svg|woff|woff2)$/,
              ],
        compressionOptions: {
          params: {
            [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
          },
        },
        threshold: 0,
        minRatio: 55,
        deleteOriginalAssets: false,
      }),
      new webpack.DefinePlugin({
        'process.env': {
          BUILD_PREFIXED: JSON.stringify(process.env.BUILD_PREFIXED),
          API_URL: JSON.stringify(process.env.API_URL),
        }
      }),
    ]) : [
      new webpack.DefinePlugin({
        'process.env': {
          BUILD_PREFIXED: JSON.stringify(process.env.BUILD_PREFIXED),
          API_URL: JSON.stringify(process.env.API_URL),
        }
      }),
    ])
  },
  transpileDependencies: [
    'quasar'
  ],
  chainWebpack: config => {

    // console.log(config.output);

    // config
    //   .plugin('output')
    //   .tap(args => {
    //     console.log(args);
    // //   });
    // config.output.filename = '[name].js';
    // config.output.chunkFilename = '[name].js';

    if (isProd) {
      config
        .output
        .filename('js/[name].js?_hash=[contenthash:8]')
        .chunkFilename('js/[name].js?_hash=[contenthash:8]');
    }

    config.plugins.store.delete('prefetch');
    config.plugins.store.delete('preload');
    // console.log(config);
	// https://forum.vuejs.org/t/how-to-append-a-text-in-bundle-files-generated/47222
  //
    config
      .plugin('html')
      .tap(args => {
        args[0].hash = true;
        return args;
      })

  //   config
  //     .plugin('prefetch')
  //     .tap(args => {
  //   console.log(args);
  //       args[0].include = 'none';
  //       args[0].rel = 'prefetch';
  //       if (args[0].fileBlacklist) {
  //         args[0].fileBlacklist.push(/\.js$/);
  //       }
  //   console.log(args);
  //       return args;
  //     })

  //   config
  //     .plugin('preload')
  //     .tap(args => {
		// console.log(args);
  //       args[0].include = 'none';
  //       args[0].rel = 'prefetch';
  //       if (args[0].fileBlacklist) {
  //         args[0].fileBlacklist.push(/\.js$/);
  //       }

		// console.log(args);
  //       return args;
  //     })
  }
}
