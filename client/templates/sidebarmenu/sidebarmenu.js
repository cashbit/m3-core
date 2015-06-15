/**
 * Created by cashbit on 15/06/15.
 */

sidebarmenuitems.push(
    {index: 0, url:"/dashboard", title: "Dashboard"}
) ;

sidebarmenuitems.push(
    {index: 1000, title:"Groupmenu", menuitemclass:"treeview", treeviewitems:[
        {index: 100, title:"Submenu 1", url:"/submenu1"},
        {index: 200, title:"Submenu 2", url:"/submenu2"}
    ]}
) ;

Template.sidebarmenu.helpers({
    menuitems: function(){
        return sidebarmenuitems.sort(function(a,b){
            return a.index > b.index ;
        }) ;
    },
    treeviewitems: function(){
        return this.treeviewitems.sort(function(a,b){
            return a.index > b.index ;
        }) ;
    },
    isTreeView : function(){
        return this.menuitemclass === 'treeview' ;
    },
    isMenuItem : function(){
        return this.menuitemclass !== "treeview" ;
    }
}) ;

