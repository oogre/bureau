module.exports.pdf = function(param){
	var _pdfType = param.type;
	var _dest = param.dest;
	var fs = require('node-fs/lib/fs');
	var PDFKit = require('pdfkit');
	var doc = new PDFKit({
		bufferPages: true
	});

	doc.pipe(fs.createWriteStream(_dest));
		
	doc.page.margins = param.page.margins;
	doc.param = param;

	var width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
	var maxDocY = doc.page.height - doc.page.margins.bottom;
	var colWidth = width / param.page.col;
	var _dataTitle = false;
	var _dataFooter = false;
	var _dataHeader = false;
	var _dataFolio = false;

	var _moveBottom = function(move){
		doc._y = doc.y += move;
	};

	var _title = function(data, position){
		if(_.isUndefined(data) && _.isUndefined(position)){
			data = _dataTitle.data;
			position = _dataTitle.position;
		}else{
			_dataTitle = {
				data : data,
				position : position
			}
		}
		_setPosition(position);

		doc
		.lineWidth(param.stroke.thin)
		.rect(	doc.x, 
				doc.y - param.line.padding, 
				width, 
				param.line.height+param.line.padding )
		.fill(param.fill.grey)
		.stroke();

		doc.x = doc._x;
		doc.y = doc._y;
		_row(data);
		_moveBottom(param.line.margin);
	};

	var _footer = function(data, position){
		if(_.isUndefined(data) && _.isUndefined(position)){
			data = _dataFooter.data;
			position = _dataFooter.position;
		}else{
			_dataFooter = {
				data : data,
				position : position
			}
		}
		_setPosition(position);

		var tmp = doc.page.margins.bottom;
		doc.page.margins.bottom = 0;
		data.frame = false;
		_line(null, param.line.margin);
		_row(data, false);

		doc.x = doc.page.margins.left;
		doc.y = doc.page.margins.top;
		doc.page.margins.bottom = tmp;	
	};

	var _header = function(data, position){
		if(_.isUndefined(data) && _.isUndefined(position)){
			data = _dataHeader.data;
			position = _dataHeader.position;
		}else{
			_dataHeader = {
				data : data,
				position : position
			}
		}
		_setPosition(position);

		var tmp = doc.page.margins.top;
		doc.page.margins.top = 0;
		data.frame = false;
		
		_row(data, false);

		doc.x = doc.page.margins.left;
		doc.y = doc.page.margins.top = tmp;
	};

	var _cel = function(data, frame){
		var _width = parseInt(data.size) * colWidth;
		var _value = data.text;
		var _tmpY = doc.y;
		doc
		.fill(param.fill.black)
		.fontSize(8);
		_value.map(function(val){
			if(val.folio){
				_dataFolio = {
					position : {
						x : doc.x,
						y : doc.y
					},
					width : _width,
					align : val.align
				}
			}
			if(_.isObject(val.value)){
				doc.image(val.value.src, doc.x + (_width/2) - val.value.param.fit[0] / 2, doc.y, val.value.param);
				doc.y += param.line.height+param.line.padding;
			}
			else if(val.align == "center"){
				doc.text(val.value, {
					width : _width,
					align: val.align
				});
			}
			else{
				doc.x += param.line.padding;
				doc.text(val.value);
				doc.y = doc._y;
				doc.x -= param.line.padding;
			}
		});
		var line = Math.ceil((doc.y-_tmpY)/(param.line.height+param.line.padding));
		if(frame!==false){
			doc
			.rect(	doc.x, 
					_tmpY - param.line.padding, 
					_width, 
					line * (param.line.height+param.line.padding))
			.stroke();
		}
	};

	var _addPage = function(){
		doc.addPage();

		doc.page.margins = param.page.margins;
		doc._y = doc.y = doc.page.margins.top,
		doc._x = doc.x = doc.page.margins.left;
		
		_header();
		_footer();
		_title();
	};

	var _hasToNextPage = function(flag){
		return flag !==false && maxDocY-doc.y < 110;
	}

	var _row = function(data, flag){
		if(_hasToNextPage(flag)){
			_addPage();
		}
		var prev = 0;
		(data||[]).map(function(content){
			doc.x = doc._x + (prev * colWidth);
			doc.y = doc._y;
			_cel(content, data.frame);
			prev += content.size;
		});
		var line = Math.ceil((doc.y-doc._y)/(param.line.height+param.line.padding));
		doc.x = doc._x;
		doc.y = doc._y += (line * (param.line.height+param.line.padding));
	};

	var _setPosition = function(position){
		if(_.isFunction(position)){
			position = position(doc);
			doc._y = doc.y = position.y;
			doc._x = doc.x = position.x;
		}
	};
	var _folio = function(){
		if(_dataFolio){
			var range = doc.bufferedPageRange();
			for(var i = range.start ; i < range.start + range.count ; i++){
				doc.switchToPage(i);
				doc.x = _dataFolio.position.x;
				doc.y = _dataFolio.position.y;
					doc.text((i+1)+"/"+range.count, {
						width : _dataFolio.width,
						align: _dataFolio.align
					});
			}
			doc.flushPages();
		}
	};
	var _line = function(position, move){
		if(_hasToNextPage()){
			_addPage();
		}
		_setPosition(position);

		doc
		.moveTo(doc.x, doc.y)
		.lineWidth(param.stroke.bold)
		.lineTo(doc.x+width, doc.y)
		.stroke()
		.lineWidth(param.stroke.thin);
		_moveBottom(move || param.stroke.bold);
	}
	return {
		end : function(){
			_folio();
			doc.end();
			return this;
		},
		moveBottom : function(move){
			_moveBottom(move);
			return this;
		},
		row : function(data, position){
			_setPosition(position);
			_row(data);
			return this;
		},
		line : function(position){
			_line(position);
 			return this;
		},
		title : function(data, position){
			_title(data, position);
			return this;
		},
		footer : function(data, position){
			_footer(data, position);
			return this;
		},
		header : function(data, position){
			_header(data, position);
			return this;
		},
		doc : function(){
			return doc;
		}
	}
};