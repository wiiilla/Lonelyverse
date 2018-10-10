var keywords = ["lonely", "loneliness", "Lonely", "Loneliness"];
var maxCount = 20; maxCount2 = 80;
var running = 0, running2 =0;
var maxRunning = 30; maxRunning2 =100;

var channel = 'pubnub-twitter';
var pubnub = new PubNub({ subscribeKey : 'sub-c-78806dd4-42a6-11e4-aed8-02ee2ddab7fe'})
var updatedTweets, c = 1;
var tweets = new Array(maxRunning);
var heard= new Array(maxRunning2);

//convert negative index to postive ones
function convert (neg, length) {
    if (neg<0) {
        return length+neg;
    } else {
        return neg;
    }
}
//slice tweet full text into short phases
function sliceTweet (t) {
    t = t.replace(/#/g, ".")
    t = t.replace("?", ".")
    t = t.replace(/!/g, ".")
    var sentences = t.split(".");
    for (var i=0; i < keywords.length; i++) {
        var word = keywords[i];
        for (var k=0; k < sentences.length; k++) {
            if (sentences[k].includes(word)) {
                return sentences[k].trim();
                break;
            }
        }
    }
}

//Tweet class
class Tweet {
    constructor (runningCount, tweetInfo) {
        this.order = 0;
        this.tweetInfo = tweetInfo;
    }
}

//TweetInfo Class
class TweetInfo {
    constructor (msg) {
        //this.time=msg.message.created_at; //"Thu Mar 15 03:20:09 +0000 2018"
        this.date = new Date(parseInt(msg.message.timestamp_ms));
        this.day = this.date.toDateString().substr(4);
        this.time = (this.date.getHours() > 12) ? this.date.getHours()-12 + ':' + this.date.getMinutes() + ' PM' : this.date.getHours() + ':' + this.date.getMinutes() +' AM';
        this.timestamp = this.time + ', ' + this.day;
        this.timestamp_ms=msg.message.timestamp_ms;
        this.fullText=msg.message.text;
        this.sliced = sliceTweet(this.fullText);

        this.name=msg.message.user.name;
        this.screenName=msg.message.user.screen_name;

        this.tweetID=msg.message.id_str;
        this.tweetURL="https://twitter.com/statuses/"+this.tweetID;
        this.userID=msg.message.user.id
    }

}

//Conditional Expression for filtering out loneliness
function ifLonely(m) {
    if (!m.message.extended_tweet === undefined) {
        var t = m.message.extended_tweet.full_text
    } else {
        var t = m.message.text
    }
    if (m.message.lang = "en" && ! t.includes("@") && ! t.includes("http")) {
        if ( t.includes("I ") && ( t.includes("lonely") || t.includes("loneliness") || t.includes("Lonely") || t.includes("Loneliness") ) ) {
            return true;
        } else {
            return false;
        }
    }
}

function ifHeard(m) {
    var t = m.message.text
    if (m.message.lang = "en" && t.includes("I ") ) {
            return true;
    }
}

//getData!
function getData(callback) {
    //function updating loneliness
    function update(msg) {
        //set up heard for lonelyverse
        if (ifHeard(msg) == true) {
            if (running2 == maxRunning2) {
                running2 = 0;
            }

            //console.log('HEARD STH');

            //order the array by time of appearance
            let o = maxRunning2-1;
            for (var i = running2; i > running2 - maxRunning2; i--) {
                heard[convert(i, maxRunning2)] = o;
                o--;
            }
            running2++;
        }

        if ( ifLonely(msg) == true) {
            if (running == maxRunning) {
                running = 0;
            }

            tweetInfo = new TweetInfo (msg);
            tweets[running] = new Tweet (running, tweetInfo);
            //console.log(emojiStrip(tweets[running].tweetInfo.sliced));
            //console.log(tweets);

            //order number maxRunning of tweets
            let o = maxRunning-1;
            for (var i = running; i > running - maxRunning; i--) {
                if (tweets[convert(i, maxRunning)]) {
                    tweets[convert(i, maxRunning)].order = o;
                    o--;
                }
            }

            $.ajax({
                type: "POST",
                dataType: "json",
                url: "/php/updateCache.php",
                data: {updatedTweets:tweets},
                cache: false,
                async: true,
                success: function(data) {
                    //console.log("success posting updated tweets to updateCache.php")
                },
                error: function(err) {
                    //console.log("error posting updated tweets to updateCache.php");
                    // console.log(err);
                }
            });

            console.log("Cache Saved for "+ c+" times");
            c++;

            running++;
        }
    }

    pubnub.addListener({ message: function(msg) {
      try {
          update(msg);
      } catch (e) {
          console.log(e);
      }
    } });
    pubnub.subscribe({ channels:[channel]});
    callback();
};

//Check and Read Cache, update tweets and then run getData()
var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        tweets = JSON.parse(this.responseText);

        //update running and count to start off where it's left off
        for (var i=0; i<tweets.length;i++) {
            if (tweets[i].order == 0) {
                running = i;
                break;
            }
        }
        getData(sketch);
    }
};
xmlhttp.open("GET", "php/getCache.php", true);
xmlhttp.send();
