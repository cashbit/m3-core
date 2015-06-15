function makeActiveLinkOnSideBar(activePath){
  if (activePath.split("/").length > 0){
    var pathComponents = activePath.split("/") ;
    var activePath = "/" + pathComponents[pathComponents.length-1] ;
  }
  $(".sidebar-menu li").removeClass("active") ;
  $('.sidebar-menu [href="'  + activePath + '"]').parent().addClass("active") ;
}

Router.route('/', {
  name: 'home',
  layoutTemplate: 'publicLayout'
});

Router.route('/dashboard', {
  name: 'dashboard'
});

Router.route('/usergroups', {
  name: 'usergroups'
});

Router.route('/documents', {
  name: 'documents'
});

Router.route('/document/:id', {
  name: 'document'
});

Router.plugin('ensureSignedIn', {
  only: ['dashboard','devices']
});

Router.onRun(function(){
  if (this.originalUrl.indexOf("/api") == -1) if (makeActiveLinkOnSideBar) makeActiveLinkOnSideBar(this.originalUrl) ;
  this.next();
})

Router.onAfterAction(function(){
  if (this.originalUrl.indexOf("/api") == -1) if (makeActiveLinkOnSideBar) makeActiveLinkOnSideBar(this.originalUrl) ;
});