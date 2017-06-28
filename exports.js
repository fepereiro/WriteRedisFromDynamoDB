var redis = require("redis");
var async = require("async");
function handler(event, context, globalCallback) {
    var redisClient = redis.createClient(6379, process.env.URL, {no_ready_check: true});
    async.each(event.Records, function(record, callback) { 
        var key = record.dynamodb.Keys.Number.N;
        
        redisClient.get(key, function(err, reply) {
            // reply is null when the key is missing
            console.log(reply);
        });
        
        if (record.eventName === "INSERT" || record.eventName === "MODIFY") {
            var value = JSON.stringify(record.dynamodb.NewImage);
            redisClient.set(key, value, function(err) {
                callback(err);
            });
        } else if (record.eventName === "REMOVE") {
            redisClient.del(key, function(err) {
               callback(err);
            });
        }
    }, function(err){
        redisClient.quit();
        if(err) {
            globalCallback(err);
        } else {
            globalCallback(null, "DONE");
        }
    });
}
exports.handler = handler;