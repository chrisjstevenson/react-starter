process.chdir(__dirname);

require('./src/server/server').run(function (err) {
	if(err) process.exit(10);
});