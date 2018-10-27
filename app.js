// Random Notes
// Useful tutoriaL: https://medium.com/@Moonstrasse/how-to-make-a-basic-html-form-file-upload-using-multer-in-an-express-node-js-app-16dac2476610


// Set up parameters/plugins
const spawn = require('child_process').spawn;
var express = require('express');
var multer = require('multer');


// Configure Multer
const multerConfig = {

	storage: multer.diskStorage({
		destination: function(req, file, next) {
			next(null, 'uploads/');
		},

		filename: function(req, file, next) {
			console.log(file);
			const ext = file.mimetype.split('/')[1];
			next(null, file.fieldname + '_' + Date.now() + '.' + ext);
		}
	})
};

var upload = multer(multerConfig).single('pyfile')

// Set up app
var app = express();
app.set('view engine','ejs');


// Routing
// Index
app.get('/', function(req, res) {
	// Old code:
	// res.send('Hello World!');
	res.render('index');
});

// File upload page
app.get('/processor', function(req, res) {
	res.render('processor');
});

// Post action routing
app.post('/xlfile', multer(multerConfig).single('xl'), function(req, res, next) {
	console.log('File upload submitted');
	console.log(req.headers);

	res.send('Complete');
});

app.post('/csv', function(req, res, next) {	
	upload(req, res, function err() {
		if (err instanceof multer.MulterError) {
      		// A Multer error occurred when uploading.
      		console.log(err);
    	} else if (err) {
      		// An unknown error occurred when uploading.
      		console.log(err);
    	}

    	console.log('CSV File Upload:');

		// Fire up Python
		process_file = './uploads/' + req.file.filename
		const pyProcess = spawn('python', ['csvprocess.py', '' + process_file + '']);
		res.send('File and Python complete');

	});
});

// Run app
app.listen(3000, function () {
	console.log('Example app listening on port 3000')
	console.log('App running at:' + Date.now())
});