/*
*   m3coreVortex
*   local and remote queue management
 *
 *   See example
 *
 *   Yuo can create a communication queue between different meteor apps
 *
 *
*
*
* */

/*

 Example of tipical vortex object

 var obj = {
     _id: "sdlkjsdldkdsjl",
     readers: ["pippo","pluto,"paperino"],
     createAt : "30938398389308309839",
     from: "127.0.0.1",
     to: ["ciccio"],
     topic: "kart",
     operation: "insert",
     payload: {
         _id:"ekljlkjdkjdkljd",
         kartid: "3098309839038093839839803",
         customer: "093833093830",
         total: "345"
         }
 }

 */

// for the proxy: export HTTP_PROXY=http://proxy.siad.lcl:8080


function m3coreVortex(config,callback){

    var remoteConfig = config || {
            recipients : ["*"], // filter objects by destination, * is for ALL, or specify an array
            topics : ["*"] // optional, if omitted will catch all *
    } ;

    remoteConfig.topics = remoteConfig.topics || ["*"] ;
    remoteConfig.recipients = remoteConfig.recipients || ["*"] ;

    var fromRemoteCallBack = callback || function(){} // will be called for each new object in the queue

    if (remoteConfig.hostname){

        var remote = DDP.connect(remoteConfig.hostname);

        m3coreVortexRemoteCollection = new Meteor.Collection('m3corevortex', {connection:remote});

        remote.subscribe(
            'm3corevortex',
            {
                readers : {$ne:remoteConfig.recipients},
                recipient : {$in:remoteConfig.recipients},
                topic : {$in:remoteConfig.topics}
            },
            function() {
                console.log("subscribed to m3corevortex on:",remoteConfig.hostname) ;
            }
        );

        m3coreVortexRemoteCollection.find().observe({
            added: function(obj) {

                //delete(obj._id) ;

                var exitentObj = m3coreVortexLocalCollection.findOne(obj._id) ;
                if (exitentObj) return ;

                obj.fromHostName = remoteConfig.hostname ;
                delete(obj.workers) ;
                var addedObj = m3coreVortexLocalCollection.insert(obj) ;
                if (addedObj){
                    m3coreVortexRemoteCollection.update(
                        obj._id,
                        {$addToSet:{readers:{$each:remoteConfig.recipients}}}
                    )
                }
            }
        });

        remote.onReconnect = function () {
            console.log("RECONNECTING REMOTE");

            if (!remoteConfig.loginConfig) return ;
            remote.call("login",remoteConfig.loginConfig,
                function(err,result) {
                    //Check result
                    if (err) return console.log("Login error",err) ;
                }
            );
        };
    }


    m3coreVortexLocalCollection = new Meteor.Collection('m3corevortex');


    if (Meteor.isServer){

        m3coreVortexLocalCollection.allow({
            insert:function(userId,doc){
                if (!userId) return false ;
                doc.documentOwner = userId;
                doc.createdAt = new Date() ;
                return true ;
            },
            update: function(userId, doc, fieldNames, modifier){
                if (!userId) return false ;
                //modifier.$set.updatedAt = new Date() ;
                return true ;
            },
            remove: function(userId,doc){
                return doc.documentOwner == userId ;
            }
        }) ;

        Meteor.publish("m3corevortex", function (criteria) {
            return m3coreVortexLocalCollection.find(criteria);
        });
    }

    m3coreVortexLocalCollection.find({
        workers : {$ne:remoteConfig.recipients},
        recipient : {$in:remoteConfig.recipients},
        topic : {$in:remoteConfig.topics}
    }).observe({
        added: function(obj){
            var worked = fromRemoteCallBack(obj) ;
            if (worked) {
                m3coreVortexLocalCollection.update(
                    obj._id,
                    {$addToSet:{workers:{$each:remoteConfig.recipients}}}
                ) ;
            }
        }
    });

    return {
        add:function(payload,from,recipient,topic,operation){
            var obj = {
                recipient : recipient || "*",
                topic : topic,
                operation : operation,
                payload : payload,
                from : from || "*",
                sentOn: new Date()
            } ;
            return m3coreVortexLocalCollection.insert(obj) ;
        }
    }
}


function test(){

// example

// for local operations only
//var config = {recipients:["me"]} ;

// for remote operations
    var config = {
        hostname: process.env.VORTEX_HOSTNAME,
        recipients : ["me"],
        loginConfig: {
            user :{email:"carlo.cassinari@gmail.com"},
            password: "XXXXXX"
        }
    } ;

    var myVortex = m3coreVortex(
        config,
        function(obj){
            console.log("----- received from: " + obj.from + " ------") ;
            console.log(obj) ;
            return true ;
        }
    ) ;

    Meteor.setTimeout(function(){
        var newObjectInQueue = myVortex.add(
            {message:"ciao"}, // payload
            "me", // from
            "me", // recipient
            "*", // topic
            "testop" // operation
        ) ;
        console.log("newObjectInQueue",newObjectInQueue) ;
    },10000) ;
}

//test();