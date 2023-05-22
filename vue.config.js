// vue.config.js
const { defineConfig } = require('@vue/cli-service');
const path = require('path');
const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const zlib = require("zlib");

const isProd = process.env.NODE_ENV === 'production';
const prefixed = process.env.BUILD_PREFIXED;
const part = process.env.PART || 'admin';

const buildDir = (part === 'admin' ? 'admin/dist' : 'frontend/dist');

module.exports = defineConfig({
	productionSourceMap: !isProd,
	publicPath: ((isProd && prefixed ) ? ('/'+prefixed) : undefined),
	outputDir: buildDir,
	pluginOptions: {
		quasar: {
			importStrategy: 'kebab',
			rtlSupport: false,
		},
	},
	transpileDependencies: [
		'quasar',
	],
	configureWebpack: {
		resolve: {
			alias: (part === 'admin' ? ({
					components: path.join(__dirname, 'admin/src/components'),
					forms: path.join(__dirname, 'admin/src/forms'),
					classes: path.join(__dirname, 'admin/src/classes'),
					shared: path.join(__dirname, 'shared'),
				}) : ({
					components: path.join(__dirname, 'frontend/src/components'),
					forms: path.join(__dirname, 'frontend/src/forms'),
					classes: path.join(__dirname, 'frontend/src/classes'),
					shared: path.join(__dirname, 'shared'),
				})
			),
			extensions: ['.vue', '.js'],
			fallback: {
				fs: false,
				net: false,
			},
		},
		plugins: (isProd ? ([
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
					},
				}),
			]) : [
				new webpack.DefinePlugin({
					'process.env': {
						BUILD_PREFIXED: JSON.stringify(process.env.BUILD_PREFIXED),
						API_URL: JSON.stringify(process.env.API_URL),
					},
				}),
			]
		),
	},
    chainWebpack: config => {
		config.plugin('polyfills').use(NodePolyfillPlugin)
    },
})