const webpack = require('webpack');
const MemoryFS = require('memory-fs');
const path = require('path');
const fs = require('fs');

class RuntimeWebpack {

	constructor({ files, config }, entry) {
		this._setupMfs();
		files.forEach(file => this.addFile(path.join('/src', file.name), file.content));
		this.configCb = config;
		this.entry = entry;
	}

	_setupMfs() {
		const mfs = new MemoryFS();

		this.mfs = mfs;
		this.loaders = [];

		['readFileSync', 'statSync', 'readlinkSync'].forEach((method) => {
			const fn = this.mfs[method];

			this.mfs[method] = (...args) => {
				let result;
				try {
					result = fn.apply(this.mfs, args);
				} catch(e) {
					const [reqPath] = args;
					const inCwd = reqPath.startsWith(path.resolve('node_modules'));
					const inRelDir = reqPath.startsWith(path.resolve(__dirname, 'node_modules'));

					if (inCwd || inRelDir) {
						result = fs[method].apply(fs, args);
					} else {
						throw e;
					}
				}

				return result;
			};
		});
	}


	addLoader(loaderConfig) {
		this.loaders.push(loaderConfig);
	}

	addFile(filePath, fileContent) {
		const dirPath = path.dirname(filePath);
		this.mfs.mkdirpSync(dirPath);
		this.mfs.writeFileSync(filePath, fileContent);
	}

	_webpack(config) {
		return new Promise((resolve, reject) => {
			const compiler = webpack(config);

			compiler.inputFileSystem = this.mfs;
			compiler.resolvers.normal.fileSystem = compiler.inputFileSystem;
			compiler.resolvers.context.fileSystem = compiler.inputFileSystem;

			compiler.outputFileSystem = this.mfs;

			compiler.run((err, stats) => {

				if (err) {
					console.error(err.stack || err);
					if (err.details) {
						console.error(err.details);
					}
					return;
				}

				const info = stats.toJson();

				if (stats.hasErrors()) {
					return reject(info.errors[0]);
				}

				if (stats.hasWarnings()) {
					console.warn(info.warnings);
				}

				resolve();
			});
		});
	}

	_wpConfig() {
		const webpackConfig = {
			mode: 'development',
			context: '/src',
			entry: this.entry || './index.js',
			output: {
				filename: '[name].js',
				path: '/dist',
			},
			devtool: 'inline-source-map',
			resolve: {
				// symlinks: false,
				modules: [path.resolve('node_modules')],
			},
			resolveLoader: {
				modules: [path.resolve('node_modules')],
			},
			module: {
				rules: [
					...this.loaders,
				],
			},
			plugins: [],
		};

		return webpackConfig;
	}

	async build(entry) {

		const config = this._wpConfig();

		if (typeof this.configCb === 'function') {
			this.configCb(config);
		}

		await this._webpack(config);

		const result = this.mfs.readFileSync('/dist/main.js');

		return result.toString();
	}
}

module.exports = RuntimeWebpack;
