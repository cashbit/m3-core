DocumentsController = AppController.extend({
  waitOn: function() {
    return this.subscribe('allUserData');
    //return;
  },
  onAfterAction: function () {
    Meta.setTitle('Documents');
  }
});

DocumentsController.events({
  'click [data-action=doSomething]': function (event, template) {
    event.preventDefault();
  }
});

documentsCollection = new Mongo.Collection("m3coredocuments") ;

documentsCollection.allow({
  insert:function(userId,doc){
    doc.creator = userId;
    doc.createdAt = new Date() ;
    return true ;
  },
  update: function(userId, doc, fieldNames, modifier){
    modifier.$set.updatedAt = new Date();
    return doc.creator == userId ;
  },
  remove: function(userId,doc){
    return doc.creator == userId ;
  }
}) ;

groupTypeOptions = [
  {
    label: "type One",
    value: 1
  },
  {
    label: "type Two",
    value: 2
  },
  {
    label: "type Three",
    value: 3
  }
] ;


documentsCollection.attachSchema(new SimpleSchema({
  name: {
    type: String,
    label: "Name",
    max: 20
  },
  grouptype: {
    type: Number,
    allowedValues: [
      1,
      2,
      3
    ],
    optional: true,
    label: "Choose a number",
    autoform: {
      options: groupTypeOptions
    }
  },
  createdAt:{
    type: Date,
    label: "Created at",
    optional : true,
    autoform: {
      afFieldInput: {
        type: "datetime-local"
      }
    }
  }
}));



TabularTables.Documents = new Tabular.Table({
  name: "Documents",
  collection:documentsCollection,
  /*
   selector: function( userId ) {
   return { creator: userId }
   }
   */
  columns: [
    {data: "name",  title: "Name"},
    {
      data: "creator",
      title:"Creator",
      render: function (val, type, doc) {
        if (Meteor.isClient){
          var user = Meteor.users.findOne(val);
          return user && user.emails && user.emails[0].address;
        }
      }
    },
    {
      data:"grouptype",title:"Type",
      render: function(val,type,doc){
        var output = "" ;
        // not optimized search method, just to test
        groupTypeOptions.forEach(function(groupTypeOption,index){
          if (groupTypeOption.value === val) output = groupTypeOption.label ;
        }) ;
        return output ;
      }
    },
    {
      data:"createdAt",title: "Created at"
    },{
      data:"updatedAt",title: "Updated at"
    }
    /*
     ,
     {
     tmpl: Meteor.isClient && Template.m3coretableViewDocEditButton
     },
     {
     tmpl: Meteor.isClient && Template.userGroupsDeleteButton
     }
     */
  ]
});

/*
 if (Meteor.isClient){
 Template.userGroupsDeleteButton.events({
 'click .delete': function(event) {
 usergroupsCollection.remove(this._id) ;
 var selectedDoc = Session.get("currentDoc") ;
 if (selectedDoc && selectedDoc._id === this._id){
 Session.set("currentDoc",undefined);
 }
 }
 }) ;
 }
 */

if (Meteor.isServer){
  Meteor.publish("allUserData", function () {
    console.log("alluserdata sub");
    return Meteor.users.find({}, {fields: {'emails': 1}});
  });
}