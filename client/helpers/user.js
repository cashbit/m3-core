Template.user.helpers({
    emailAddress: function() {
        return Meteor.user().emails[0].address;
    }
});