var $;
module.exports = $ = function (query, single){
    if(single)
        return [document.querySelector( query )];
    else
        return [].slice.call( document.querySelectorAll( query ) );
};
module.exports.attachAll = function(query, type, listener){
    var list = typeof query === "string" ? $(query) : query;
    [].forEach.call(list, function(element){
        element.addEventListener(type, listener)
    });
    return $.attachAll.bind($, list)
}
module.exports.each = function(query, fn){
    var list = typeof query === "string" ? $(query) : query;
    [].forEach.call(list, fn);
    return $.each.bind($, list);
}