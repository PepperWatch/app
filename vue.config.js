// const version = require('./package.json').version;
const ReplaceInFileWebpackPlugin = require('replace-in-file-webpack-plugin');

module.exports = {
  pluginOptions: {
    quasar: {
      importStrategy: 'kebab',
      rtlSupport: false
    }
  },
  configureWebpack: {
    plugins: [
      new ReplaceInFileWebpackPlugin([{
                dir: 'dist',
                test: /\.js$/,
                rules: [{
                    search: /home[a-zA-Z0-9_]+node_modules_/ig,
                    replace: 'hiddenpath',
                },{
                    search: /home\/[^\\]+app/ig,
                    replace: 'hiddenpath2',
                }]
            }]),
    ]
  },
  transpileDependencies: [
    'quasar'
  ],
  chainWebpack: config => {

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
