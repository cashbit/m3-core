var hooksObject = {
    onSuccess: function(formType, result){
        if (formType === 'update'){
            var tableName = $("#"+this.formId).attr("table") ;
            Session.set("currentDocFor"  + tableName,undefined) ;
        }
        if (formType === 'insert'){
            var formId = this.formId ;
            setTimeout(function(){
                $("#"+formId+" .form-group .form-control")[0].focus() ;
            },300);
        }
    }
}

Template.registerHelper('selectedDoc', function() {
    var tableName = this.table.name ;
    return Session.get("currentDocFor"  + tableName);
});

Template.registerHelper('noDocIsSelected', function(){
    var tableName = this.table.name ;
    var selectedDoc = Session.get("currentDocFor"  + tableName) ;
    return typeof selectedDoc === "undefined" ;
});

Template.registerHelper('formCollection', function(){
    return this.table.collection ;
});

Template.registerHelper('formTable', function(){
    return this.table ;
});

Template.registerHelper('randomFormId', function(){
    var random = Math.round(Math.random()*9999999999999999)+1;
    var formId = "formId" + random ;
    AutoForm.addHooks(formId, hooksObject);
    return formId
});

Template.registerHelper('isThisTheSelectedDoc', function(){
    var tableName = this.table.name ;
    var selectedDoc = Session.get("currentDocFor"  + tableName) ;
    return (selectedDoc && selectedDoc._id === this._id);
});

Template.m3coretableview.events({
    'click tbody > tr': function (event) {
        $(event.target).closest('table').find('tbody > tr').removeClass("selected");
        $(event.target.parentElement).addClass('selected');
        var dataTable = $(event.target).closest('table').DataTable();
        var rowData = dataTable.row(event.currentTarget).data();
        var currentDocument = this.table.collection.findOne(rowData._id) ;
        var tableName = this.table.name ;
        Session.set("currentDocFor"  + tableName,currentDocument) ;
        setTimeout(function(){
            $(event.target).closest(".tableViewContainer").find(".m3coretableViewEditForm .form-group .form-control")[0].focus() ;
        },300);
    }
});

Template.m3coretableViewDocEditButton.events({
    'click .edit': function(event) {
        Session.set("currentDoc",this) ;
        setTimeout(function(){
            $(event.target).closest(".tableViewContainer").find(".m3coretableViewEditForm .form-group .form-control")[0].focus() ;
        },300);
    }
}) ;

Template.m3coretableViewEditForm.events({
    "click .cancelEditButton": function(){
        var tableName = this.table.name ;
        Session.set("currentDocFor"  + tableName,undefined) ;
    },
    "click button.deleteEditButton": function(event){
        var doc = $(event.currentTarget).attr("docId");
        this.table.collection.remove(doc) ;
        var tableName = this.table.name ;
        Session.set("currentDocFor"  + tableName,undefined) ;
    }

}) ;



if (Meteor.isClient){



    $(document).ready(function(){
        setTimeout(function(){
            var update_size = function() {
                $(".m3coreTableViewTable").css({ width: $(".m3coreTableViewTable").parent().width() });
            }
            $("a.sidebar-toggle").click(function(){
                setTimeout(function() { update_size(); }, 1000) ;
            });

            $(window).resize(function() {
                clearTimeout(window.refresh_size);
                window.refresh_size = setTimeout(function() { update_size(); }, 250);
            });


        },1000) ;

    }) ;



}