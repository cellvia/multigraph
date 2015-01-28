var $ = function (query, single){
    if(single || (this !== window && this.single))
        return document.querySelector( query );
    else
        return [].slice.call( document.querySelectorAll( query ) );
};

$.attach = function(query, type, listener){
    var list;
    if(typeof query === "string"){
        list = $(query);
    }else if(!(query instanceof Array)){
        list = [query];
    }else if(query instanceof Array){
        list = query;
    }else{
        throw new Error("query must be selector or dom or array of dom")
    }
    [].forEach.call(list, function(element){
        element.addEventListener(type, listener)
    });
    return $.attach.bind($, list)
};

$.each = function(query, fn){
    var list = typeof query === "string" ? $(query) : query;
    [].forEach.call(list, fn);
    return $.each.bind($, list);
};

$.one = $.bind({single: true});

module.exports = $;