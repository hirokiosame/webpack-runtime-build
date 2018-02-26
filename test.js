const RuntimeWebpack = require('./RuntimeWebpack');

// (async function () {

// 	const rw = new RuntimeWebpack([
// 		{
// 			name: 'index.js',
// 			content: `
// 				console.log('Hello World');
// 			`,
// 		},
// 	]);

// 	const result = await rw.build();

// 	console.assert(result.length > 0, 'No result');
// })();

// (async function () {

// 	const rw = new RuntimeWebpack([
// 		{
// 			name: 'index.js',
// 			content: `
// 				const str = require('./string');
// 				console.log(str);
// 			`,
// 		},
// 		{
// 			name: 'string.js',
// 			content: `
// 				module.exports = 'Hello World';
// 			`,
// 		}
// 	]);

// 	const result = await rw.build();

// 	console.log(result);
// })();




// (async function () {

// 	const rw = new RuntimeWebpack([
// 		{
// 			name: 'index.js',
// 			content: `
// 				const str = require('./Test.vue');
// 				console.log(str);
// 			`,
// 		},
// 		{
// 			name: 'Test.vue',
// 			content: `
// <template>
// 	<div>
// 		hello World
// 	</div>
// </template>
// 			`,
// 		},
// 	]);

// 	rw.addLoader({
// 		test: /\.vue$/,
// 		loader: require.resolve('vue-loader'),
// 		options: {
// 			cssModules: {
// 				localIdentName: (Math.random().toString(36).slice(2)) + '[local]_-_[hash:base64:5]',
// 			},
// 		},
// 	});

// 	const result = await rw.build();

// 	console.log(result);
// })();



(async function () {

	const rw = new RuntimeWebpack([
		{
			name: 'index.js',
			content: `
				const str = require('./string.txt');
				console.log(str);
			`,
		},
		{
			name: 'string.txt',
			content: `Hello World`,
		}
	]);



	rw.addLoader({
		test: /\.txt$/,
		loader: require.resolve('raw-loader'),
	});

	const result = await rw.build();

	console.log(result);
})();


