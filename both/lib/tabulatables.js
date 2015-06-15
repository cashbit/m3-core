/*

    Initializing tabular tables

 */

//TabularTables = {};
if (typeof(TabularTables) === 'undefined') {
    TabularTables = {} ;
    Meteor.isClient && Template.registerHelper('TabularTables', TabularTables);
}