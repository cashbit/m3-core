if(Meteor.isClient) {
  Meta.config({
      options: {
        // Meteor.settings[Meteor.settings.environment].public.meta.title
        title: 'Your project name',
        suffix: 'Your suffix'
      }
  });
}
