var express = require('express');
var router = express.Router();
var asana = require('asana');
const client = asana.Client.create().useAccessToken('1/1100742309667998:da495345544fb5b977ae016fd6dc251c');

var db = require('../connection');
var _ = require('lodash');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index2', { title: 'Express' });
  
});

router.post('/sidebar/user/remove/',function(req,res,next) {
	db.query("INSERT into sidebarusers SET ?", {gid: req.body.ugid, ugid: req.body.gid, name: req.body.name}, (error,result) => {
			if(error)
			{
				console.log(error)
			}
			else{
				res.send("User added to block list.");
			}
			
		
	});
});

router.post('/sidebar/buser/remove/',function(req,res,next) {
	db.query("DELETE FROM sidebarusers WHERE gid = ? AND ugid = ? AND name = ?", [req.body.ugid, req.body.gid, req.body.name], (error,result) => {
			if(error)
			{
				console.log(error)
			}
			else{
				res.send("User removed from block list.");
			}
			
		
	});
});

router.get('/dashboard', function(req, res, next) {
	client.users.me().then(function(me) {
		console.log("workspace:"+me.workspaces[0].gid)
	// 	client.projects.getProjectsForWorkspace(me.workspaces[0].gid, {param: "value", param: "value", opt_pretty: true})
    // .then((result) => {
    	
	// 		res.render('index', { name:me.name, email:me.email, photo:me.photo.image_128x128, totalTeams: Object.keys(result.data).length, teams: result.data, route: 'dashboard' });
	
	// 	});
	// console.log("DS"+me.workspaces[0].gid);
	client.users.getUsers({workspace: me.workspaces[0].gid, limit: "100", opt_fields:'name,photo,email,gid', opt_pretty: true})
    .then((result) => {
		const Allusers = Object.keys(result.data).length;
		
		
        db.query('SELECT * FROM sidebarusers where ugid = ?', [me.gid], (error,result2) => {
			if(error)
			{
				console.log("could not run the query");
			}
			else{
				
				const blockedUsers = result2;
				
				result2.forEach(ugid => {
					_.remove(result.data, function(e) {
							return e.gid === ugid.gid
						});
					});
					
				
				
					
				res.render('index', { name:me.name, email:me.email, gid:me.gid, photo:me.photo.image_128x128, totalTeams: Allusers, users: result, blocked:result2, route: 'dashboard' });
				
			}
		});
		
    });
		
	});
});

router.get('/project/:id', function(req, res, next) {
	var teamId = req.params.id;
	client.users.me().then(function(me) {
		client.tasks.getTasksForProject(teamId, {opt_fields: 'gid,assignee,assignee_status,created_at,completed,completed_at,due_on,due_at,modified_at,parent,projects,workspace,tags,notes,name', opt_pretty: true})
    	.then((result) => {
        
			//console.log(result.data[0]['members']['gid']);
			res.render('index3', { title: teamId, projects: result, user: me.gid, name: me.name, email: me.email, photo:me.photo.image_128x128, route:'projects' } );
			console.log(result);
		});
	});
	
});

router.get('/users/:id', function(req,res,next) {
	var userId = req.params.id;
	//console.log(userId);
	var green = 0;
	var red = 0;
	client.users.me().then(function(me) {
		client.users.getUser(userId, {opt_fields:"gid,name,email,photo", opt_pretty: true})
		.then((user) => {			
		
			client.tasks.searchTasksForWorkspace(me.workspaces[0].gid, {opt_fields: "gid,resource_type,assignee_status,completed,created_at,due_on,custom_fields,name,notes,projects,workspace,tags", 'resource_type': 'task', limit: 100 , 'created_by.not': userId, opt_pretty: true})
			.then((result) => {
				
				if(!me.photo.image_128x128)
				{
				res.render('index3', { title: userId, CreatedTasks: result, user: me.gid, name: me.name, email: me.email, photo:"/assets/images/users/default.png", route:'tasks',username: user.name } );
				}
				else{
				res.render('index3', { title: userId, CreatedTasks: result, user: me.gid, name: me.name, email: me.email, photo:me.photo.image_128x128, route:'tasks', username: user.name } );
				}
			
			
			});
	
			
			
			
		
		});
	});
});

router.get('/projects/:id', (req,res,next) => {
	var userId = req.params.id;

});


router.get('/tasks/:id', function(req,res,next) {
var userId = req.params.id;
	//console.log(userId);
	// var green = 0;
	// var red = 0;
	client.users.me().then(function(me) {
		client.users.getUser(userId, {opt_fields:"gid,name,email,photo", opt_pretty: true})
		.then((user) => {			
		
			client.tasks.searchTasksForWorkspace(me.workspaces[0].gid, {opt_fields: "gid,name,completed,created_at,assignee_status", 'resource_type': 'task', limit: 100 , 'created_by.not': userId, opt_pretty: true})
			.then((result) => {
				let i = 1;
				result.data.forEach(d => {

					let Cdate = Date.parse(d["created_at"])/1000;
					d["created"] = new Date(Cdate*1000).toLocaleString("en-US");
					
					//console.log(Cdate+"=>"+new Date(d["created"]));
					d["id"] = i;
					d["action"] = "<a href='javascript:void(0)' class='viewlead' id='"+d[`gid`]+"'><i class='fa fa-eye'></i></a>&nbsp;&nbsp;<a href='javascript:void(0)' class='infolead' data-toggle='modal' data-target='#verticalcenter' id='"+d[`gid`]+"'><i class='fas fa-info-circle'></i></a>";
					if(d["completed"] == true) { 
					d["status"] = "<i class='far fa-check-circle fa-2x' style='color:green'></i><span class='hidden' style='display:none'>c</span>"; } 
					else { 
					d["status"] ="<i class='far fa-times-circle fa-2x' style='color:red'></i><span class='hidden' style='display:none'>i</span>"; 
					}

					i++;

				})
				res.send(result);
				
			
			
			});
	
			
			
			
		
		});
	});
});

router.get('/taskDetails/:id', function(req,res,next) {
	let taskId = req.params.id;
	client.stories.getStoriesForTask(taskId, {params: "gid,text,is_edited,source,resource_type,resource_subtype,created_at,liked,likes,num_likes,html_text,target,is_pinned,created_by", opt_pretty: true})
    .then((result) => {
        res.send(result.data);
    });
	
});
module.exports = router;
