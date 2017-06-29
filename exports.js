'use strict';

var redis = require("redis");

exports.handler = (event, context, globalCallback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    
    console.log('Creating client.');
    var redisClient = redis.createClient(6379, process.env.URL, {no_ready_check: true});
    console.log('Client created.');
    
    event.Records.forEach((record) => {
        console.log('Event: ' + record.eventName + ' - ' + record.eventID);
        
        var key = record.dynamodb.Keys.Number.N;
        console.log('Key identified: ' + key);
        
        if (record.eventName === "INSERT" || record.eventName === "MODIFY") {
            var value = JSON.stringify(record.dynamodb.NewImage);
            console.log('Inserting value: ' + value);
            redisClient.set(key, value, function(err) {
                globalCallback(err);
            });
            console.log('Value inserted.');
        } else if (record.eventName === "REMOVE") {
            console.log('Removing key/value.');
            redisClient.del(key, function(err) {
               globalCallback(err);
            });
            console.log('Value removed.');
        }
    });

    console.log('Successfully processed.');
    globalCallback(null, `Successfully processed ${event.Records.length} records.`);
}