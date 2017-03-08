Converting <a href="https://github.com/minneapolis-edu/basic-todo-express-mongoose-hbs">https://github.com/minneapolis-edu/basic-todo-express-mongoose-hbs</a>
to for use with users.

Overview of process

* Create config/passport.js file. Write authentication strategy/ies here
* Configure sessions in app.js. Include connect-mongodb-session to keep users logged in through server reboots.

* Create a new schema. In models/user.js set up user; user has username and password.
* Modify models/task.js add a user attribute to each task. Store what you query for. It's a lot easier to find all tasks with user id=123 and then work with task objects; vs giving a user an array of task objects, it's harder to query items in an array.

* Create view for login and signup page, authentication.hbs
* Add logout link to layout.hbs

* Create /routes/auth.js for authentication-related routes e.g. display login form, sign up, log in, log out... In app.js mount these routes at /auth/
* Rename index.js to tasks.js. Change name in app.js
* All todo task routes will be in task.js. All of these routes will require authentication.

* Modify task.js routes to only work with data for logged in user. Use the _creator field to work with items for the logged in user, for example,

```
// Get all incomplete tasks for logged in user
Task.find({ _creator : req.user, completed:false}, function(err, tasks) {
    //deal with tasks
});
```

```
// Create a new task, with _creator as the logged in user
var task = Task({ _creator: req.user, text : req.body.text, completed: false});
```


