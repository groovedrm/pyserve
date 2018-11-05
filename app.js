// Random Notes
// Useful tutoriaL: https://medium.com/@Moonstrasse/how-to-make-a-basic-html-form-file-upload-using-multer-in-an-express-node-js-app-16dac2476610

// Set up spawn for Python
const spawn = require('child_process').spawn;

// Bring in libraries
var express = require('express');
var multer = require('multer');
var request = require('request');
var qs = require('querystring');
var bodyParser = require('body-parser');

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
app.use(bodyParser.urlencoded( {extended: true}));


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
	// console.log(req.body.user_address);
	console.log(" ======================================== ");

	var options = {
		uri: 'http://staging.maprisk.com/reports',
		headers: {
			'x-auth-key': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiI1YWI1NWNkOTY1MTA3MDAxYmM0ZmVhZmEiLCJleHAiOm51bGx9.LURAjucAQ269BzsxWcUp2PysqCZBNOam8oA39fjV-m4'
		},
		qs: {
			'reportList': 'floodRiskScore',
			'addressLine': req.body.user_address
		},
		method: 'GET'
	};

	// console.log(options);

	function callback(error, response, body) {
  		if (!error && response.statusCode == 200) {
			var resp = JSON.parse(body);
			var params = resp['request'];
			var data = resp['response']['reportResults'];
		
			/*
			// Tests For Data Access
			console.log(params['poi']);
			console.log(" ==================== ");
			console.log(data['floodRiskScore']);
			*/

			var score = "The geocoded address is " 
				+ params['poi']['street']
				+ " and the 100 yr flood depth is: "
				+ data['floodRiskScore']['waterDepth100Year'];

			console.log(score);
		
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