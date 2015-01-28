var levelgraph = require("levelgraph");
var leveljs = require("level-js");
var levelup = require("levelup");
var factory = function (location) { return new leveljs(location) };

var db = window.db = levelgraph(levelup("yourdb", { db: factory }));
var $ = require("./lib/dom");

var ENUM = require("./lib/shared/predicates.enum");

var session = $("select[name='session']", true);
var textInputs = $(".triple input");
var selects = $('.triple select')
var allInputs = textInputs.concat(selects);
var buttons = $("button");
var inputsAndButtons = allInputs.concat(buttons);
var existing = $('#existing', true);

db.get({}, function(err, res){
    res.forEach(function(triple){
        if(!triple.session || !triple.subject)
            deleteTriple(triple);
    });
});

$.attachAll(session, 'change', sessionHandler);
function sessionHandler(e, session){
    session = session || this;
    if(session.value === "all"){
        $.each(inputsAndButtons, function(el){
            el.setAttribute('disabled', 'true');
        });
        //getAndRender();
        friendOfFriendWhoLikesPeace();
    }else{
        $.each(inputsAndButtons, function(el){
            el.removeAttribute('disabled');
        });        
        existing[0].innerHTML = '';
        //getAndRender(null, function(triple){ return triple.session === session.value });
    }
}


$.attachAll(buttons, 'click', function(e){
    for(var x = 0, len = textInputs.length; x<len; x++)
        if(!textInputs[x].value) return textInputs[x].value = this.innerText
})

$.attachAll(inputsAndButtons, "click", globalHandler)
    ("keyup", globalHandler)
    ("blur", globalHandler)
function globalHandler(){
    var triple = {};
    for(var x = 0, len = allInputs.length; x<len; x++){
        if(!allInputs[x].value) return
        triple[ allInputs[x].getAttribute("name") ] = allInputs[x].value;
    }
    triple.session = session[0].value;
    addTriple(triple);
}

/* inits */
sessionHandler(null, {value: "all"});


function addTriple(triple){
    db.put(triple, function(err){
        if(err) throw err;
        for(var x = 0, len = textInputs.length; x<len; x++)
            allInputs[x].value = ""
        
        renderTriple(triple);
    });
}

function renderTriple(triple){
    var el = document.createElement('div');
    el.textContent = translateTriple(triple);
    if(existing[0].childNodes.length)
        existing[0].insertBefore(el, existing[0].childNodes[0]);
    else
        existing[0].appendChild(el);
}

function getAndRender(query, filter){
    query = query || {};
    query.filter = filter;
    db.get(query, function(err, results){        
        renderAll(results);
    });    
}

function renderAll(items){
    existing[0].innerHTML = '';
    items.forEach(renderTriple);
}

function friendOfFriendWhoLikesBilbo(){
    db.search([{
        subject: "frodo",
        predicate: "likes",
        object: db.v("x")
    },
    {
        subject: db.v("x"),
        predicate: "likes",
        object: db.v("y")
    },{
        subject: db.v("y"),
        predicate: "dislikes",
        object: db.v("z")
    },
    {
        subject: db.v("z"),
        predicate: "likes",
        object: "bilbo"
    }],
    {
        materialized: {
          session: "materialized",
          subject: db.v("x"),
          predicate: "friendofafriendwholikes",
          object: "bilbo"
        }        
    }, function(err, res){
        console.log(res);
        renderAll(res);
    });
    $.each(inputsAndButtons, function(el){
        el.setAttribute('disabled', 'true');
    });

}

function deleteTriple(triple, cb){
    db.del(triple, cb);
}

function translateTriple(triple){
    return [triple.session + ": ", triple.subject, ENUM[triple.predicate], triple.object].join(" ");
}
