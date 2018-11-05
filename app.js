// Random Notes
// Useful tutoriaL: https://medium.com/@Moonstrasse/how-to-make-a-basic-html-form-file-upload-using-multer-in-an-express-node-js-app-16dac2476610

// Set up spawn for Python
const spawn = require('child_process').spawn;

// Bring in libraries
var express = require('express');
var multer = require('multer');
var request = require('request');
var http = require('http');
var qs = require('querystring');

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

// MapRisk Page
app.get('/maprisk_req', function(req, res) {
	res.render('maprisk');
	// next();
});

app.post('/maprisk_api', function(req, res, next) {
	console.log(' ==> MapRisk API Called')

	var options = {
		uri: 'http://staging.maprisk.com/reports',
		headers: {
			'x-auth-key': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiI1YWI1NWNkOTY1MTA3MDAxYmM0ZmVhZmEiLCJleHAiOm51bGx9.LURAjucAQ269BzsxWcUp2PysqCZBNOam8oA39fjV-m4'
		},
		qs: {
			'reportList': 'floodRiskScore',
			'addressLine': '817 Southwest 12 Street, Fort Lauderdale, FL 33315'
		},
		method: 'GET'
	};

	console.log(options);

	function callback(error, response, body) {
  		if (!error && response.statusCode == 200) {
		    var info = JSON.parse(body);
			
			var v1 = null;
			var v2 = null;
			var v3 = null;
			// console.log(info);
			// console.log(info.urllink);
			Object.entries(info)[2].forEach((el) => {
				let v1 = el[0];
				let v2 = el[1];
				let v3 = el[2];
			});

			console.log(v1);
			console.log(v2);
		
		}
  		else {
  			console.log(error);
  		}
  	}

  	request(options, callback);
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