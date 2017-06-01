module.exports = (modV) => {
	require('./button-control')(modV);
	require('./checkbox-control')(modV);
	require('./color-control')(modV);
	require('./composite-operation-control')(modV);
	require('./custom-control')(modV);
	require('./image-control')(modV);
	require('./palette-control')(modV);
	require('./range-control')(modV);
	require('./select-control')(modV);
	require('./text-control')(modV);
	require('./video-control')(modV);
};