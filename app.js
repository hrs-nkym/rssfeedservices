//====================================================
// rss Feed Service
//====================================================

(function(){
        
    "use strict";

    var app = ons.bootstrap("myApp",["onsen"]);

    // angularjs configure setting
    app.config(function ($sceDelegateProvider) {
        $sceDelegateProvider.resourceUrlWhitelist([
            'self'
        ]);
    });

    // global Value Hash
    app.value('AppSiteDataAmeba',{
        title: 'Ameba',
        url: 'data/rss20.xml' 
    }).value('AppSiteDataOfficial',{
        title: 'other',
        url: 'data/index.xml' 
    });

    // abbreviate
    app.filter('abbreviate', function () {
        return function (text, length, end) {
            if (isNaN(length)) length = 20;
            if (end === undefined) end = "...";
            if (text.length <= length || text.length - end.length <= length) {
                return text;
            }else{
                return String(text).substring(0, length-end.length) + end;
            }
        };
    });

    // getFeedService
    app.service('FeedList',function(AppSiteDataAmeba, AppSiteDataOfficial){
        var service = {
            set : function(site, data){

                var _xmlData = [];
                var parser = new DOMParser();
                var doc = parser.parseFromString(data, "application/xml");
                var items = doc.getElementsByTagName('item');
    
                for (var i = 0; i < items.length; i++) {
                    _xmlData.push({});
                    _xmlData[i].site = site;
                    _xmlData[i].title = items[i].getElementsByTagName('title')[0].innerHTML;
                    
                    var xml,$xml,data,$data,imgSrc;
                    xml = $.parseXML(items[i].getElementsByTagName('description')[0].outerHTML);
                    $xml = $(xml);

                    data = $xml.find('description').text();

                    if(site==AppSiteDataAmeba.title){
                        $data = $(data);
                        _xmlData[i].desc =  $data.text();
                        _xmlData[i].img = $data.find('img').attr('src');
                    }else{
                        var regex = new RegExp("<\\s*img[^>]*src\\s*=\\s*([\\\"'])?([^ \\\"']*)[^>]*>");
                        var match = regex.exec(data);

                        if(!match){ // no image
                            _xmlData[i].desc =  data.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'');
                            _xmlData[i].img = 'img/character_img.gif';
                        }else{
                            $data = $(data);
                            _xmlData[i].desc = $data.text();
                            _xmlData[i].img = match[2];
                        }
                    }
                    var date = new Date(items[i].getElementsByTagName('pubDate')[0].innerHTML);
                    _xmlData[i].pubDate = date;
                }
                return _xmlData;
            }
        };
        return service;
    });

    // top list controller 
    app.controller('getTopListCtrl', function($scope, $http, AppSiteDataAmeba, AppSiteDataOfficial, FeedList){

        $scope.xmlData = [];

        $http.get(AppSiteDataAmeba.url)
            .success(function(data){
                var rss1 = FeedList.set(AppSiteDataAmeba.title,data);
                $http.get(AppSiteDataOfficial.url)
                    .success(function(data){
                        var rss2 = FeedList.set(AppSiteDataOfficial.title,data);
                        $scope.xmlData = rss1.concat(rss2);
                    })
                    .error(function(err){ alert(); });
            })
            .error(function(err){ alert(); });
        $scope.showDetail = function(item){
            topNavi.pushPage("top_detail.html", {item: item});
        };
    });

    // top detail controller 
    app.controller('setTopDetailCtrl', function($scope) {        
        ons.ready(function() {
            $scope.item = topNavi.getCurrentPage().options.item;
        });
    });

})();
