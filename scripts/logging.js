 const logGreen = (text) => {
	console.log('\x1b[32m%s\x1b[0m', text);
}

const logRed = (text) => {
	console.log('\x1b[31m%s\x1b[0m', text);
}

exports.logGreen = logGreen;
exports.logRed = logRed;
