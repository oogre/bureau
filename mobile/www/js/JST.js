this["JST"] = this["JST"] || {};

this["JST"]["www/templates/hello.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<h1>' +
((__t = ( hello )) == null ? '' : __t) +
'</h1>';

}
return __p
};

this["JST"]["www/templates/index.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<h1>hello</h1>';

}
return __p
};

this["JST"]["www/templates/nav.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<ul class="nav">\n\t<li>\n\t\t<img id="brand" src="img/logo.png">\n\t</li>\n\t<li class="logged">\n\t\t<a href="/back" class="">\n\t\t\t<i class="fa fa-fw fa-2x fa-chevron-left"></i>&nbsp; Back\n\t\t</a>\n\t</li>\n\t<li class="logged" data-controller="worker">\n\t\t<a href="/worker">\n\t\t\t<i class="fa fa-fw fa-2x fa-users"></i>&nbsp; Travailleurs\n\t\t</a>\n\t</li>\n\t<li class="logged" data-controller="shop">\n\t\t<a href="/shop">\n\t\t\t<i class="fa fa-fw fa-2x fa-smile-o"></i>&nbsp; Magasins\n\t\t</a>\n\t</li>\n\t<li class="logged" data-controller="work">\n\t\t<a href="/work">\n\t\t\t<i class="fa fa-fw fa-2x fa-wrench"></i>&nbsp; Travaux\n\t\t</a>\n\t</li>\n\t<li class="logged" data-controller="material">\n\t\t<a href="/material">\n\t\t\t<i class="fa fa-fw fa-2x fa-cogs"></i>&nbsp; Matériels\n\t\t</a>\n\t</li>\n\t<li class="logged">\n\t\t<a href="/signout">\n\t\t\t<i class="fa fa-fw fa-2x fa-sign-out"></i>&nbsp; Déconnection\n\t\t</a>\n\t</li>\n\t<li data-controller="session">\n\t\t<a href="/">\n\t\t\t<i class="fa fa-fw fa-2x fa-sign-in"></i>&nbsp; Connection\n\t\t</a>\n\t</li>\n</ul>\n\n\n<script type="text/javascript">\n\t(function(){\n\t\t"use strict";\n\t\t/*global $ : false */\n\t\t/*global OOGRE : false */\n\n\t\tOOGRE\n\t\t.on("controllerChange", function(controller){\n\t\t\tconsole.log(OOGRE.isLogged());\n\t\t\tif(!OOGRE.isLogged()){\n\t\t\t\t$("ul.nav li.logged").hide();\n\t\t\t\t$("ul.nav li:not(.logged)").show();\n\t\t\t}\n\t\t\telse {\n\t\t\t\t$("ul.nav li.logged").show();\n\t\t\t\t$("ul.nav li:not(.logged)").hide();\n\t\t\t}\n\t\t\t$("ul.nav li")\n\t\t\t.removeClass("active");\n\t\t\t$("ul.nav li[data-controller=\'"+controller+"\'] a")\n\t\t\t.addClass("active");\n\t\t});\n\n\t}());\n</script>';

}
return __p
};

this["JST"]["www/templates/session/new.ejs"] = function(obj) {
obj || (obj = {});
var __t, __p = '', __e = _.escape;
with (obj) {
__p += '<h3>Connection</h3>\n\n<hr/>\n\n<form class="form-inline" role="form" action="http://ogre.local:1337/create" method="POST" id="signin"> \n\n\t<fieldset class="row">\n\t\t<label class="col-sm-2">Identification</label>\n\t\t<div class="form-group col-sm-5">\n\t\t\t<div class="input-group col-sm-12">\n\t\t\t\t<label class="input-group-addon" for="email" >Email</label>\n\t\t\t\t<input type="text" class="form-control" id="email" name="email" autocomplete="off" required/>\n\t\t\t</div>\n\t\t</div>\n\t\t<div class="form-group col-sm-5">\n\t\t\t<div class="input-group col-sm-12">\n\t\t\t\t<label class="input-group-addon" for="password" >Mot de passe</label>\n\t\t\t\t<input type="password" class="form-control" id="password" name="password" autocomplete="off" required/>\n\t\t\t</div>\n\t\t</div>\n\t</fieldset>\n\t\n\t<hr/>\t\n\n\t<fieldset class="row">\n\t\t<label class="col-sm-2"></label>\n\t\t<div class="form-group col-sm-3">\n\t\t\t<div class="input-group col-sm-12">\n\t\t\t\t<button type="submit" name="submit" class="btn btn-default">Enregistrer</button>\n\t\t\t</div>\n\t\t</div>\n\t</fieldset>\n\n</form>\n\n<script type="text/javascript">\n\t"use strict";\n\t/*global $ : false */\n\t/*global OOGRE : false */\n\n\t$("form#signin")\n\t.on("submit", function(){\n\t\tvar $self = $(this);\n\t\t$.ajax({\n\t\t\turl : $self.attr("action"),\n\t\t\ttype : "GET",\n\t\t\tdataType : "JSON",\n\t\t\tdata : {\n\t\t\t\temail : $self.find("#email").val(),\n\t\t\t\tpassword : $self.find("#password").val()\n\t\t\t}\n\t\t})\n\t\t.done(function(data){\n\t\t\tOOGRE.setLogged(data);\n\t\t})\n\t\t.fail(function(){\n\t\t\tconsole.warn("errror");\t\n\t\t});\n\n\n\n\t\treturn false;\n\t});\n</script>';

}
return __p
};