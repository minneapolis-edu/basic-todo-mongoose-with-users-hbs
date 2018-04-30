var express = require('express');
var router = express.Router();
var Task = require('../models/task.js');


/* User should be logged in before can do any of the things in this file.
* Create a middleware function to check if user is logged in, redirect to
* authentication page if not. */

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/auth')
  }
}

/* This will require all of the routes in this file to use the
isLoggedIn middleware, don't need to specify it  */
router.use(isLoggedIn);


/* GET home page, a list of incomplete tasks for the current user. */
router.get('/', function(req, res, next) {

  Task.find({ _creator : req.user, completed:false})
  .then( (tasks) => {
    res.render('index', { title: 'TODO list' , tasks: tasks });
  })
  .catch( (err) => {
    next(err);
  });
});



/* GET all completed tasks. */
router.get('/completed', function(req, res, next){

  Task.find({ _creator : req.user, completed:true }, function(err, tasks){
    if (err) {
      next(err);
    } else {
      res.render('tasks_completed', { title: 'TODO list' , tasks: tasks });
    }
  });

});


/* Mark all tasks as done for the current user. */
router.post('/alldone', function(req, res, next){

  Task.update( {_creator: req.user, completed: false}, {completed: true}, {multi: true})
  .then( (result) => {
    req.flash('info', 'All tasks are done!');
    res.redirect('/')
  })
  .catch( (err) => {
    next(err);
  });

});



/* Show details of one task */
router.get('/task/:id', function(req, res, next){

  Task.findById(req.params.id).then( (task) => {

    if (!task) {
      res.status(404).send('Task not found.');
    }

    // Verify that this task was created by the currently logged in user
    else if (!task._creator.equals(req.user._id)) {
      res.status(403).send('This is not your task!');  // 403 Unauthorized
    }

    else {
      res.render('task_detail', {task: task} )
    }

  }).catch( (err) => {
    next(err);
  });

});


/* POST Add new task, then redirect to task list */
router.post('/add', function(req, res, next){

  // Check for text entered. Or, we could require the text field in the model,
  // not bother with this check, and check for DB saving errors instead.
  // This approach would be cleaner if there were many checks for a valid task.
  if (!req.body || !req.body.text) {
    req.flash('error', 'Please enter some text');
    res.redirect('/');
  }

  else {
    // Save new task with text provided, for the current user, and completed = false
    var task = Task({ _creator: req.user, text : req.body.text, completed: false});

    task.save()
    .then(() => {
      res.redirect('/');
    })
    .catch((err) => {
      next(err);
    });
  }

});


/* Mark a task as done. Task _id should be provided as req.body parameter */
router.post('/done', function(req, res, next){

  Task.findOneAndUpdate( {_id: req.body._id, _creator: req.user.id}, {completed: true})
  .then( (task) => {

    if (!task) {
      res.status(403).send('This is not your task!');
    }

    else {
      req.flash('info', 'Task marked as done');
      res.redirect('/')
    }

  })
  .catch( (err) => {
    next(err);
  });

});


/* Delete a task. Task _id is in req.body */
router.post('/delete', function(req, res,next){

  Task.findOneAndRemove( {_id: req.body._id, _creator: req.user._id} )
  .then( (task) => {
    if (!task)  { // No task deleted, therefore the ID is not valid,
      //or did not belong to the current logged in user.
       res.status(403).send('This is not your task!');
     }
     else {
       req.flash('info', 'Task deleted');
       res.redirect('/')
     }
  })
  .catch( (err) => {
    next(err);
  });

});


module.exports = router;
