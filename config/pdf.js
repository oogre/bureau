module.exports.pdf = function(param){
	var _pdfType = param.type;
	var _dest = param.dest;
	var fs = require('node-fs/lib/fs');
	var PDFKit = require('pdfkit');
	var doc = new PDFKit();

	doc.pipe(fs.createWriteStream(_dest));
		
	doc.page.margins = param.page.margins;

	var width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
	var colWidth = width / param.page.col;
	
	var _cel = function(data){
		var _width = parseInt(data.size) * colWidth;
		var _value = data.text;
		var _tmpY = doc.y;
		doc
		.fill(param.fill.black)
		.fontSize(8);
		_value.map(function(val){
			if(val.align == "center"){
				doc.text(val.value, {
					width : _width,
					align: val.align
				})
			}
			else{
				doc.x += param.line.padding;
				doc.text(val.value);
				doc.y = doc._y;
				doc.x -= param.line.padding;
			}
		});
		doc
		.rect(	doc.x, 
				_tmpY - param.line.padding, 
				_width, 
				doc.y - _tmpY + param.line.padding )
		.stroke();
	};

	var _row = function(data){
		var prev = 0;
		data.map(function(content){
			doc.x = doc._x + (prev * colWidth);
			doc.y = doc._y;
			_cel(content);
			prev += content.size;
		});
		doc.x = doc._x;
		doc.y = doc._y += param.line.height+param.line.padding;
	};

	var _setPosition = function(position){
		if(_.isFunction(position)){
			position = position(doc);
			doc._y = doc.y = position.y;
			doc._x = doc.x = position.x;
		}
	};

	return {
		end : function(){
			doc.end();
			return this;
		},
		moveBottom : function(move){
			doc._y = doc.y += move;
			return this;
		},
		row : function(data, position){
			_setPosition(position);
			_row(data);
			return this;
		},
		line : function(position){
			_setPosition(position);

			doc
			.moveTo(doc.x, doc.y)
			.lineWidth(param.stroke.bold)
			.lineTo(doc.x+width, doc.y)
 			.stroke()
 			.lineWidth(param.stroke.thin);

 			this.moveBottom(param.stroke.bold)
 			return this;
		},
		title : function(data, position){
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

			this.row(data);

			return this;
		}
	}
};