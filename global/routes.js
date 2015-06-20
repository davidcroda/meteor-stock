Router.configure({
  layoutTemplate: 'layout'
});

Router.route('/', function () {
  this.render('index');
}, {
  name: 'index'
});

Router.route('/add_user', function () {
  this.render('add_user');
});

Router.route('/add_stock', function () {
  this.render('add_stock');
});