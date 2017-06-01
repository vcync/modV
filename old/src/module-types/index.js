module.exports = (modV) => {
	require('./module-2d')(modV);
	require('./module-3d')(modV);
	require('./module-script')(modV);
	require('./module-shader')(modV);
};