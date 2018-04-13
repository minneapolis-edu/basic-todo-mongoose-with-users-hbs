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


/* GET home page, a list of incomplete tasks . */
router.get('/', function(req, res, next) {

  Task.find({ _creator : req.user, completed:false}, function(err, tasks){
    if (err) {
      next(err);
    }
    else {
      res.render('index', { title: 'TODO list' , tasks: tasks });
    }
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


/* Mark all tasks as done. */
router.post('/alldone', function(req, res, next){

  Task.update( {_creator : req.user, completed:false}, {completed:true}, {multi:true}, function(err){

    if (err) {
      next(err);
    }
    else {
      req.flash('info', 'All tasks are done!');
      res.redirect('/')
    }
  });
});



/* Show details of one task */
router.get('/task/:id', function(req, res, next){

  Task.findById(req.params.id, function(err, task){

    if (err) {

      if (err.name == 'CastError') {
        // Invalid ObjectId
        res.status(404).send('Not a valid task ID. Task not found.');
      } else {
        next(err);  // Other DB errors.
      }
    }

    if (!task) {
      res.status(404).send('Task not found.');
    }

    // Verify that this task was created by the currently logged in user
    else if (!task._creator.equals(req.user._id)) {
      res.status(403).send('This is not your task!');  // 403 Unauthorized
    }

    else {
      res.render('task_detail', {task:task})
    }

  });
});


/* POST Add new task, then redirect to task list */
router.post('/add', function(req, res, next){

  if (!req.body || !req.body.text) {
    req.flash('error', 'Please enter some text');
    res.redirect('/');
  }

  else {
    // Save new task with text provided, and completed = false
    var task = Task({ _creator: req.user, text : req.body.text, completed: false});

    task.save(function(err) {
      if (err) {
        next(err);
      } else {
        res.redirect('/')
      }
    });
  }

});


/* Mark a task as done. Task _id should be provided as req.body parameter */
router.post('/done', function(req, res, next){

  var id = req.body._id;
  Task.findOneAndUpdate({_id: req.body._id, _creator: req.user.id}, {completed:true}, function(err, task){

    if (err) {
      next(err);
    }

    else if (!task) {
      res.status(403).send('This is not your task!');
    }

    else {

      req.flash('info', 'Task marked as done');
      res.redirect('/')
    }
  });

});


/* Delete a task. Task _id is in req.body */
router.post('/delete', function(req, res,next){

  var id = req.body._id;

  Task.findOneAndRemove({_id: req.body._id, _creator: req.user.id}, {completed:true}, function(err, task){

    if (err) {
      next(err);    // For database errors
    }

    else if (!task)  { // No task deleted, therefore the ID is not valid, or it did not belong to the current logged in user.
      res.status(403).send('This is not your task!');
    }

    else {
      req.flash('info', 'Deleted');
      res.redirect('/')
    }

  })
});


module.exports = router;
