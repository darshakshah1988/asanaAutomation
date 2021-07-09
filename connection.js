var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '2.57.89.16',
  user     : 'u266860147_asana',
  password : 'Asana@2020',
  database : 'u266860147_asanaAuto' 
});

// local setup asana_node 

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
 
  console.log('connected as id ' + connection.threadId);
});


module.exports = connection;