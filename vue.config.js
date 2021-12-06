const version = require('./package.json').version;

module.exports = {
  pluginOptions: {
    quasar: {
      importStrategy: 'kebab',
      rtlSupport: false
    }
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
