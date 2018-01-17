
var   express 	= require('express');
var   bodyParser= require('body-parser');
var   Q = require('q');
var   http = require('http');
var   path = require('path');
const util = require('util');
const assert = require('assert');
var   f = require('util').format;
var   fs = require('fs');


var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//ROUTES FOR OUR API
var router = express.Router(); 
router.use(bodyParser.urlencoded({ extended: true }));


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api  --> http://localhost:9300/
app.use('/', router);


var _mongodb ;
var  MongoClient = require('mongodb').MongoClient;  

var dbUrl;
var dbConnection ;

var dbName = 'payment' ;
var paymentCollection = 'payments' ;


// Get cfenv and ask it to parse the environment variable
var cfenv = require('cfenv'); 				//Cloud Foundry Environment Variables
var appEnv = cfenv.getAppEnv(); 			// Grab environment variables


if (appEnv.isLocal) {
    require('dotenv').load();   //Not using env for localhost as this is single file Node service
	var sessionDB = process.env.LOCAL_MONGODB_URL;
	//var sessionDB = 'mongodb://localhost:2500/'
	console.log(sessionDB);;
	dbUrl = sessionDB ; // please change it to env variable
}


// Cloud Env DB connection
if(!appEnv.isLocal) {
	
	 // Within the application environment (appenv) there's a services object
    var services = appEnv.services;
    var mongodb_services = services["compose-for-mongodb"];
    // This check ensures there is a services for MongoDB databases
    assert(!util.isUndefined(mongodb_services), "Must be bound to compose-for-mongodb services");
   // We now take the first bound MongoDB service and extract it's credentials object
    var credentials = mongodb_services[0].credentials;   
    // Within the credentials, an entry ca_certificate_base64 contains the SSL pinning key
    // We convert that from a string into a Buffer entry in an array which we use when
    // connecting.
    var ca = [new Buffer(credentials.ca_certificate_base64, 'base64')];
    // This is a global variable we'll use for handing the MongoDB client around
    var mongodb;
    // This is the MongoDB connection. From the application environment, we got the
    // credentials and the credentials contain a URI for the database. Here, we
    // connect to that URI, and also pass a number of SSL settings to the
    // call. Among those SSL settings is the SSL CA, into which we pass the array
    // wrapped and now decoded ca_certificate_base64,
    MongoClient.connect(credentials.uri, {
        mongos: {
            ssl: true,
            sslValidate: true,
            sslCA: ca,
            poolSize: 1,
            reconnectTries: 1
        }
    },
    function(err, db) {
        // Here we handle the async response. This is a simple example and
        // we're not going to inject the database connection into the
        // middleware, just save it in a global variable, as long as there
        // isn't an error.
        if (err) {
            console.log(err);
        } else {
            // Although we have a connection, it's to the "admin" database
            // of MongoDB deployment. In this example, we want the
            // "examples" database so what we do here is create that
            // connection using the current connection.
            mongodb = db.db(dbName);
			_mongodb = mongodb;
    
      // Response handling
    let response = {
        status: 200,
        data: [],
        message: null
    };    
	}});
       
}


if(appEnv.isLocal){
	
	dbConnection = function(){
						var deffered = Q.defer();
						MongoClient.connect(dbUrl, {native_parser: true}, function(err, database) {  
						if (err) 
							deffered.reject(err);
						var db = database.db(dbName);
						console.log('DB Connected at ' + dbUrl);
						deffered.resolve(db);			
						});  
						
						return deffered.promise;
					}					
}



//ROUTES FOR OUR API
var router = express.Router(); 
router.use(bodyParser.urlencoded({ extended: true }));


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
//http://localhost:9300/api/
app.use('/', router);





GetPaymentDetail=function(req,res){
	console.log("------------------------------------------------------");
	console.log("");
	console.log('GetPaymentDetail  ' + req.url );
	console.log(req.body);
	console.log("");
	
	if(appEnv.isLocal) {
			dbConnection().then(function(db){
				
				db.collection(paymentCollection).find({userid:req.params.userid}).toArray(function(err, xuser) {
						
						if (err) {
								throw err;
								res.json({status:false, message:'Node error', userid:req.body.userid});  
						}
							
						if(JSON.stringify(xuser) === '[]')
							res.json({status:false, message:'No record Found', userid:req.body.userid});
						else
							//res.json({status:true, message:'OK', userid:req.body.userid, bankname:xuser[0].bankname, actnumber:xuser[0].actnumber, expirydate:xuser[0].expirydate, cvv:xuser[0].cvv, acttype:xuser[0].acttype});
						    res.json(xuser)  ;
				});
			}).catch(function(error){
				console.log(error);
			});
	}
	
	if(!appEnv.isLocal) {	
			_mongodb.collection(paymentCollection).find({userid:req.params.userid}).toArray(function(err, xuser) {
						
						if (err) {
								throw err;
								res.json({status:false, message:'Node error', userid:req.body.userid});  
						}
							
						if(JSON.stringify(xuser) === '[]')
							res.json({status:false, message:'User not Found', userid:req.body.userid});
						else
							//res.json({status:true, message:'OK', userid:req.body.userid, bankname:xuser[0].bankname, actnumber:xuser[0].actnumber, expirydate:xuser[0].expirydate, cvv:xuser[0].cvv, acttype:xuser[0].acttype});
							res.json(xuser)  ;
				});
	
	}
	
}

GetAllPaymentDetail=function(req,res){
	
	console.log("------------------------------------------------------");
	console.log("");
	console.log('GetAllPaymentDetail  ' + req.url );
	console.log(req.body);
	console.log("");
	
	if(appEnv.isLocal) {
		
			dbConnection().then(function(db){
					
				db.collection(paymentCollection).find({}).toArray(function(err, xusers) {
						
						if (err) {
								throw err;
								res.json({status:false, message:'Node error', userid:req.params.userid});  
						}
							
						if(JSON.stringify(xusers) === '[]')
							res.json({status:false, message:'Data not Found', userid:req.params.userid});
						else
							res.json(xusers);
				});
			}).catch(function(error){
					console.log(error);
			});			
	}
	if(!appEnv.isLocal) {	
	
			_mongodb.collection(paymentCollection).find({}).toArray(function(err, xusers) {
							
					if (err) {
							throw err;
							res.json({status:false, message:'Node error', userid:req.params.userid});  
					}
						
					if(JSON.stringify(xusers) === '[]')
						res.json({status:false, message:'Data not Found', userid:req.params.userid});
					else
						res.json(xusers);
			});
	
	}
}




UpdatePaymentDetail=function(req,res){
	
	console.log("------------------------------------------------------");
	console.log("");
	console.log('UpdatePaymentDetail  ' + req.url );
	console.log(req.body);
	console.log("");
		
	if(appEnv.isLocal) {	
				dbConnection().then(function(db){		
						db.collection(paymentCollection).update({userid:req.body.userid},{$set:{bankname:req.body.bankname, ccnumber:req.body.ccnumber, expirydate:req.body.expirydate,	cvv:req.body.cvv, banktype:req.body.banktype }}, function(err, result){
								
								if (err) {
									throw err;
									console.log('Record Update Failed');
									res.json({status:false, message: 'Failed'});  
								}
								if (result) {
									console.log('Record Updated Successfully!');
									res.json({status:true, message: 'Success'});  
								}		
						});		
						
				}).catch(function(error){
					console.log(error);
				});
	}
	if(!appEnv.isLocal) {
		
				_mongodb.collection(paymentCollection).update({userid:req.body.userid},{$set:{bankname:req.body.bankname, ccnumber:req.body.ccnumber, expirydate:req.body.expirydate,	cvv:req.body.cvv, banktype:req.body.banktype }}, function(err, result){
								
								if (err) {
									throw err;
									console.log('Record Update Failed');
									res.json({status:false, message: 'Failed'});  
								}
								if (result) {
									console.log('Record Updated Successfully!');
									res.json({status:true, message: 'Success'});  
								}	
				});	
	}
} 

AddPaymentDetail=function(req,res){
	
	console.log("------------------------------------------------------");
	console.log("");
	console.log('AddPaymentDetail  ' + req.url );
	console.log(req.body);
	console.log("");
	
	var newData = req.body ;
	
	
	if(appEnv.isLocal) {
	
				dbConnection().then(function(db){
					
						db.collection(paymentCollection).insert(newData, function(err, result) {
								if (err) {
									throw err;
									console.log('Failed to Create Payment Detail');
									res.json({status:false, message: 'Failed to Create Payment Detail'});  
								}
								if (result) {
									console.log('Payment Detail Created');
									res.json({status:true, message: 'Payment Detail Created'});  
								}
						});
					
				}).catch(function(error){
					console.log(error);
				});
	}
	if(!appEnv.isLocal) {
		
				_mongodb.collection(paymentCollection).insert(newData, function(err, result) {
										if (err) {
											throw err;
											console.log('Failed to Create Payment Detail');
											res.json({status:false, message: 'Failed to Create Payment Detail'});  
										}
										if (result) {
											console.log('Payment Detail Created');
											res.json({status:true, message: 'Payment Detail Created'});  
										}
				});
	}
}


//START SERVER
var port = process.env.PORT || 4003;

app.listen(port, "0.0.0.0", function () {
    console.log("ewallet payment server starting on Port " + port);
  });



//MIDDLEWARE to use for all requests
router.use(function(req, res, next) {
    console.log('MIDDLEWARE is happening.');
    next(); 
});


router.route('/payment/addpayment').post(AddPaymentDetail);		        //http://localhost:4003/payment/addpaymentdetail/

router.route('/payment/getpayments').post(GetAllPaymentDetail);    	    //http://localhost:4003/payment/getpayments/

router.route('/payment/getpayment/:userid').post(GetPaymentDetail);    	//http://localhost:4003/payment/getpayment/:userid

router.route('/payment/updatepayment/').post(UpdatePaymentDetail);		//http://localhost:4003/payment/updatepayment/







  
  