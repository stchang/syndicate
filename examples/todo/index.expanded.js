"use strict";
var todo = Syndicate.Struct.makeConstructor("todo", ["id","title","completed"]);

var createTodo = Syndicate.Struct.makeConstructor("createTodo", ["title"]);
var setTitle = Syndicate.Struct.makeConstructor("setTitle", ["id","title"]);
var setCompleted = Syndicate.Struct.makeConstructor("setCompleted", ["id","completed"]);
var deleteTodo = Syndicate.Struct.makeConstructor("deleteTodo", ["id"]);
var clearCompletedTodos = Syndicate.Struct.makeConstructor("clearCompletedTodos", []);
var setAllCompleted = Syndicate.Struct.makeConstructor("setAllCompleted", ["completed"]);

// Derived model state
var activeTodoCount = Syndicate.Struct.makeConstructor("activeTodoCount", ["n"]);
var completedTodoCount = Syndicate.Struct.makeConstructor("completedTodoCount", ["n"]);
var totalTodoCount = Syndicate.Struct.makeConstructor("totalTodoCount", ["n"]);
var allCompleted = Syndicate.Struct.makeConstructor("allCompleted", []);

// View state
var show = Syndicate.Struct.makeConstructor("show", ["completed"]);

//////////////////////////////////////////////////////////////////////////

function todoListItemModel(initialId, initialTitle, initialCompleted) {
  Syndicate.Actor.spawnActor(new Object(), function() {
    this.id = initialId;
    this.title = initialTitle;
    this.completed = initialCompleted;

    (function () { 
Syndicate.Actor.createFacet()
.addAssertion((function() { var _ = Syndicate.__; return Syndicate.Patch.assert(todo(this.id,this.title,this.completed), 0); }))
.onEvent(false, "message", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(setCompleted(this.id,_), 0); }), (function() { var _ = Syndicate.__; return { assertion: setCompleted(this.id,(Syndicate._$("v"))), metalevel: 0 }; }), (function(v) { this.completed = v; }))
.onEvent(false, "message", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(setAllCompleted(_), 0); }), (function() { var _ = Syndicate.__; return { assertion: setAllCompleted((Syndicate._$("v"))), metalevel: 0 }; }), (function(v) { this.completed = v; }))
.onEvent(false, "message", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(setTitle(this.id,_), 0); }), (function() { var _ = Syndicate.__; return { assertion: setTitle(this.id,(Syndicate._$("v"))), metalevel: 0 }; }), (function(v) { this.title = v;     }))
.onEvent(false, "message", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(clearCompletedTodos(), 0); }), (function() { var _ = Syndicate.__; return { assertion: clearCompletedTodos(), metalevel: 0 }; }), (function() {
        if (this.completed) Syndicate.Dataspace.send(deleteTodo(this.id));
      }))
.onEvent(true, "message", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(deleteTodo(this.id), 0); }), (function() { var _ = Syndicate.__; return { assertion: deleteTodo(this.id), metalevel: 0 }; }), (function() {})).completeBuild(); })();
  });
}

///////////////////////////////////////////////////////////////////////////

var ESCAPE_KEY_CODE = 27;
var ENTER_KEY_CODE = 13;

function getTemplate(id) {
  return document.getElementById(id).innerHTML;
}

function todoListItemView(id) {
  Syndicate.Actor.spawnActor(new Object(), function() {
    this.ui = new Syndicate.UI.Anchor();
    this.editing = false;
    (function () { 
Syndicate.Actor.createFacet()
.onEvent(false, "asserted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(todo(id,_,_), 0); }), (function() { var _ = Syndicate.__; return { assertion: todo(id,(Syndicate._$("title")),(Syndicate._$("completed"))), metalevel: 0 }; }), (function(title, completed) { 
Syndicate.Actor.createFacet()
.onEvent(false, "asserted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(show(completed), 0); }), (function() { var _ = Syndicate.__; return { assertion: show(completed), metalevel: 0 }; }), (function() { 
Syndicate.Actor.createFacet()
.addAssertion((function() { var _ = Syndicate.__; return Syndicate.Patch.assert(this.ui.html('.todo-list',Mustache.render(getTemplate(this.editing?'todo-list-item-edit-template':'todo-list-item-view-template'),{id:id,title:title,completed_class:completed?"completed":"",checked:completed?"checked":"",}),id), 0); }))
.onEvent(true, "retracted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(show(completed), 0); }), (function() { var _ = Syndicate.__; return { assertion: show(completed), metalevel: 0 }; }), (function() {})).completeBuild(); }))
.onEvent(true, "retracted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(todo(id,title,completed), 0); }), (function() { var _ = Syndicate.__; return { assertion: todo(id,title,completed), metalevel: 0 }; }), (function() {})).completeBuild(); }))
.onEvent(false, "message", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(this.ui.event('.toggle','change',_), 0); }), (function() { var _ = Syndicate.__; return { assertion: this.ui.event('.toggle','change',(Syndicate._$("e"))), metalevel: 0 }; }), (function(e) {
        Syndicate.Dataspace.send(setCompleted(id, e.target.checked));
      }))
.onEvent(false, "message", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(this.ui.event('.destroy','click',_), 0); }), (function() { var _ = Syndicate.__; return { assertion: this.ui.event('.destroy','click',_), metalevel: 0 }; }), (function() {
        Syndicate.Dataspace.send(deleteTodo(id));
      }))
.onEvent(false, "message", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(this.ui.event('label','dblclick',_), 0); }), (function() { var _ = Syndicate.__; return { assertion: this.ui.event('label','dblclick',_), metalevel: 0 }; }), (function() {
        this.editing = true;
      }))
.onEvent(false, "message", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(this.ui.event('input.edit','keyup',_), 0); }), (function() { var _ = Syndicate.__; return { assertion: this.ui.event('input.edit','keyup',(Syndicate._$("e"))), metalevel: 0 }; }), (function(e) {
        if (e.keyCode === ESCAPE_KEY_CODE || e.keyCode === ENTER_KEY_CODE) {
          this.editing = false;
        }
      }))
.onEvent(false, "message", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(this.ui.event('input.edit','blur',_), 0); }), (function() { var _ = Syndicate.__; return { assertion: this.ui.event('input.edit','blur',(Syndicate._$("e"))), metalevel: 0 }; }), (function(e) {
        this.editing = false;
      }))
.onEvent(false, "message", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(this.ui.event('input.edit','change',_), 0); }), (function() { var _ = Syndicate.__; return { assertion: this.ui.event('input.edit','change',(Syndicate._$("e"))), metalevel: 0 }; }), (function(e) {
        var newTitle = e.target.value.trim();
        Syndicate.Dataspace.send((newTitle ? setTitle(id, newTitle) : deleteTodo(id)));
        this.editing = false;
      }))
.onEvent(true, "retracted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(todo(id,_,_), 0); }), (function() { var _ = Syndicate.__; return { assertion: todo(id,_,_), metalevel: 0 }; }), (function() {})).completeBuild(); })();
  });
}

///////////////////////////////////////////////////////////////////////////

var G = new Syndicate.Ground(function () {
  Syndicate.UI.spawnUIDriver();

  Syndicate.Actor.spawnActor(new Object(), function() {
    (function () { 
Syndicate.Actor.createFacet()
.onEvent(false, "message", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(Syndicate.UI.globalEvent('.new-todo','change',_), 0); }), (function() { var _ = Syndicate.__; return { assertion: Syndicate.UI.globalEvent('.new-todo','change',(Syndicate._$("e"))), metalevel: 0 }; }), (function(e) {
        var newTitle = e.target.value.trim();
        if (newTitle) Syndicate.Dataspace.send(createTodo(newTitle));
        e.target.value = "";
      })).completeBuild(); })();
  });

  Syndicate.Actor.spawnActor(new Object(), function() {
    this.ui = new Syndicate.UI.Anchor();

    (function () { 
Syndicate.Actor.createFacet()
.onEvent(false, "asserted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(activeTodoCount(_), 0); }), (function() { var _ = Syndicate.__; return { assertion: activeTodoCount((Syndicate._$("count"))), metalevel: 0 }; }), (function(count) { 
Syndicate.Actor.createFacet()
.addAssertion((function() { var _ = Syndicate.__; return Syndicate.Patch.assert(this.ui.context('count').html('.todo-count strong',''+count), 0); }))
.addAssertion((function() { var _ = Syndicate.__; return (count !== 1) ? Syndicate.Patch.assert(this.ui.context('plural').html('.todo-count span.s','s'), 0) : Syndicate.Patch.emptyPatch; }))
.onEvent(true, "retracted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(activeTodoCount(count), 0); }), (function() { var _ = Syndicate.__; return { assertion: activeTodoCount(count), metalevel: 0 }; }), (function() {})).completeBuild(); }))
.onEvent(false, "asserted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(totalTodoCount(0), 0); }), (function() { var _ = Syndicate.__; return { assertion: totalTodoCount(0), metalevel: 0 }; }), (function() { 
Syndicate.Actor.createFacet()
.addAssertion((function() { var _ = Syndicate.__; return Syndicate.Patch.assert(Syndicate.UI.uiAttribute('section.main','class','hidden'), 0); }))
.addAssertion((function() { var _ = Syndicate.__; return Syndicate.Patch.assert(Syndicate.UI.uiAttribute('footer.footer','class','hidden'), 0); }))
.onEvent(true, "retracted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(totalTodoCount(0), 0); }), (function() { var _ = Syndicate.__; return { assertion: totalTodoCount(0), metalevel: 0 }; }), (function() {})).completeBuild(); }))
.onEvent(false, "asserted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(completedTodoCount(0), 0); }), (function() { var _ = Syndicate.__; return { assertion: completedTodoCount(0), metalevel: 0 }; }), (function() { 
Syndicate.Actor.createFacet()
.addAssertion((function() { var _ = Syndicate.__; return Syndicate.Patch.assert(Syndicate.UI.uiAttribute('button.clear-completed','class','hidden'), 0); }))
.onEvent(true, "retracted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(completedTodoCount(0), 0); }), (function() { var _ = Syndicate.__; return { assertion: completedTodoCount(0), metalevel: 0 }; }), (function() {})).completeBuild(); }))
.onEvent(false, "message", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(Syndicate.UI.globalEvent('button.clear-completed','click',_), 0); }), (function() { var _ = Syndicate.__; return { assertion: Syndicate.UI.globalEvent('button.clear-completed','click',_), metalevel: 0 }; }), (function() {
        Syndicate.Dataspace.send(clearCompletedTodos());
      }))
.onEvent(false, "asserted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(allCompleted(), 0); }), (function() { var _ = Syndicate.__; return { assertion: allCompleted(), metalevel: 0 }; }), (function() { 
Syndicate.Actor.createFacet()
.addInitBlock((function() { Syndicate.Dataspace.send(Syndicate.UI.setProperty('.toggle-all', 'checked', true)); }))
.addDoneBlock((function() { Syndicate.Dataspace.send(Syndicate.UI.setProperty('.toggle-all', 'checked', false)); }))
.onEvent(true, "retracted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(allCompleted(), 0); }), (function() { var _ = Syndicate.__; return { assertion: allCompleted(), metalevel: 0 }; }), (function() {})).completeBuild(); }))
.onEvent(false, "message", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(Syndicate.UI.globalEvent('.toggle-all','change',_), 0); }), (function() { var _ = Syndicate.__; return { assertion: Syndicate.UI.globalEvent('.toggle-all','change',(Syndicate._$("e"))), metalevel: 0 }; }), (function(e) {
        Syndicate.Dataspace.send(setAllCompleted(e.target.checked));
      }))
.onEvent(false, "asserted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(todo(_,_,_), 0); }), (function() { var _ = Syndicate.__; return { assertion: todo((Syndicate._$("id")),_,_), metalevel: 0 }; }), (function(id) {
        todoListItemView(id);
      })).completeBuild(); })();
  });

  Syndicate.Actor.spawnActor(new Object(), function() {
    var completedCount = 0;
    var activeCount = 0;
    (function () { 
Syndicate.Actor.createFacet()
.onEvent(false, "asserted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(todo(_,_,_), 0); }), (function() { var _ = Syndicate.__; return { assertion: todo((Syndicate._$("id")),_,(Syndicate._$("completed"))), metalevel: 0 }; }), (function(id, completed) { if (completed) completedCount++; else activeCount++; }))
.onEvent(false, "retracted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(todo(_,_,_), 0); }), (function() { var _ = Syndicate.__; return { assertion: todo((Syndicate._$("id")),_,(Syndicate._$("completed"))), metalevel: 0 }; }), (function(id, completed) { if (completed) completedCount--; else activeCount--; }))
.addAssertion((function() { var _ = Syndicate.__; return Syndicate.Patch.assert(activeTodoCount(activeCount), 0); }))
.addAssertion((function() { var _ = Syndicate.__; return Syndicate.Patch.assert(completedTodoCount(completedCount), 0); }))
.addAssertion((function() { var _ = Syndicate.__; return Syndicate.Patch.assert(totalTodoCount(activeCount+completedCount), 0); }))
.addAssertion((function() { var _ = Syndicate.__; return (completedCount > 0 && activeCount === 0) ? Syndicate.Patch.assert(allCompleted(), 0) : Syndicate.Patch.emptyPatch; })).completeBuild(); })();
  });

  Syndicate.Actor.spawnActor(new Object(), function() {
    (function () { 
Syndicate.Actor.createFacet()
.onEvent(false, "asserted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(Syndicate.UI.locationHash(_), 0); }), (function() { var _ = Syndicate.__; return { assertion: Syndicate.UI.locationHash((Syndicate._$("hash"))), metalevel: 0 }; }), (function(hash) { 
Syndicate.Actor.createFacet()
.addAssertion((function() { var _ = Syndicate.__; return Syndicate.Patch.assert(Syndicate.UI.uiAttribute('ul.filters > li > a[href="#'+hash+'"]','class','selected'), 0); }))
.onEvent(true, "retracted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(Syndicate.UI.locationHash(hash), 0); }), (function() { var _ = Syndicate.__; return { assertion: Syndicate.UI.locationHash(hash), metalevel: 0 }; }), (function() {})).completeBuild(); }))
.onEvent(false, "asserted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(Syndicate.UI.locationHash('/'), 0); }), (function() { var _ = Syndicate.__; return { assertion: Syndicate.UI.locationHash('/'), metalevel: 0 }; }), (function() { 
Syndicate.Actor.createFacet()
.addAssertion((function() { var _ = Syndicate.__; return Syndicate.Patch.assert(show(true), 0); }))
.addAssertion((function() { var _ = Syndicate.__; return Syndicate.Patch.assert(show(false), 0); }))
.onEvent(true, "retracted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(Syndicate.UI.locationHash('/'), 0); }), (function() { var _ = Syndicate.__; return { assertion: Syndicate.UI.locationHash('/'), metalevel: 0 }; }), (function() {})).completeBuild(); }))
.onEvent(false, "asserted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(Syndicate.UI.locationHash('/active'), 0); }), (function() { var _ = Syndicate.__; return { assertion: Syndicate.UI.locationHash('/active'), metalevel: 0 }; }), (function() { 
Syndicate.Actor.createFacet()
.addAssertion((function() { var _ = Syndicate.__; return Syndicate.Patch.assert(show(false), 0); }))
.onEvent(true, "retracted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(Syndicate.UI.locationHash('/active'), 0); }), (function() { var _ = Syndicate.__; return { assertion: Syndicate.UI.locationHash('/active'), metalevel: 0 }; }), (function() {})).completeBuild(); }))
.onEvent(false, "asserted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(Syndicate.UI.locationHash('/completed'), 0); }), (function() { var _ = Syndicate.__; return { assertion: Syndicate.UI.locationHash('/completed'), metalevel: 0 }; }), (function() { 
Syndicate.Actor.createFacet()
.addAssertion((function() { var _ = Syndicate.__; return Syndicate.Patch.assert(show(true), 0); }))
.onEvent(true, "retracted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(Syndicate.UI.locationHash('/completed'), 0); }), (function() { var _ = Syndicate.__; return { assertion: Syndicate.UI.locationHash('/completed'), metalevel: 0 }; }), (function() {})).completeBuild(); })).completeBuild(); })();
  });

  Syndicate.Actor.spawnActor(new Object(), function() {
    var db;

    if ('todos-syndicate' in localStorage) {
      db = JSON.parse(localStorage['todos-syndicate']);
      for (var i in db.todos) {
        var t = db.todos[i];
        todoListItemModel(t.id, t.title, t.completed);
      }
    } else {
      db = {nextId: 0, todos: {}};
      (function () { 
Syndicate.Actor.createFacet()
.onEvent(true, "asserted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(Syndicate.observe(createTodo(_)), 0); }), (function() { var _ = Syndicate.__; return { assertion: Syndicate.observe(createTodo(_)), metalevel: 0 }; }), (function() {
          Syndicate.Dataspace.send(createTodo('Buy milk'));
          Syndicate.Dataspace.send(createTodo('Buy bread'));
          Syndicate.Dataspace.send(createTodo('Finish PhD'));
        })).completeBuild(); })();
    }

    (function () { 
Syndicate.Actor.createFacet()
.onEvent(false, "message", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(createTodo(_), 0); }), (function() { var _ = Syndicate.__; return { assertion: createTodo((Syndicate._$("title"))), metalevel: 0 }; }), (function(title) {
        todoListItemModel(db.nextId++, title, false);
      }))
.onEvent(false, "asserted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(todo(_,_,_), 0); }), (function() { var _ = Syndicate.__; return { assertion: todo((Syndicate._$("id")),_,_), metalevel: 0 }; }), (function(id) { 
Syndicate.Actor.createFacet()
.onEvent(false, "asserted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(todo(id,_,_), 0); }), (function() { var _ = Syndicate.__; return { assertion: todo(id,(Syndicate._$("title")),(Syndicate._$("completed"))), metalevel: 0 }; }), (function(title, completed) { 
Syndicate.Actor.createFacet()
.addInitBlock((function() {
            db.todos[id] = {id: id, title: title, completed: completed};
            localStorage['todos-syndicate'] = JSON.stringify(db);
          }))
.onEvent(true, "retracted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(todo(id,title,completed), 0); }), (function() { var _ = Syndicate.__; return { assertion: todo(id,title,completed), metalevel: 0 }; }), (function() {})).completeBuild(); }))
.addDoneBlock((function() {
          delete db.todos[id];
          localStorage['todos-syndicate'] = JSON.stringify(db);
        }))
.onEvent(true, "retracted", (function() { var _ = Syndicate.__; return Syndicate.Patch.sub(todo(id,_,_), 0); }), (function() { var _ = Syndicate.__; return { assertion: todo(id,_,_), metalevel: 0 }; }), (function() {})).completeBuild(); })).completeBuild(); })();
  });
}).startStepping();
