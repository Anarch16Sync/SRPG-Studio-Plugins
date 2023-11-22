/*--------------------------------------------------------------------------
  A general pourpose RadarchartCanvas, the setup function needs a statusArray,
  the max parameter value and the radius of the graph.

  Graph visuals can be configured with the parameters inside the draw function,
  there is also a gradient color version commented out that can be swapped for the polygon fill.
  
  Author:
  Anarch16sync
  
  History:
  2023/11/22 Released
  
--------------------------------------------------------------------------*/
var RadarchartCanvas = {
		_groupArray: null,
		
		setup: function(statusArray,maxvalue,size) {
			var i, count;
			
			this._groupArray = [];
			this._configureGraphParts(this._groupArray);
			
			count = this._groupArray.length;
			for (i = 0; i < count; i++) {
				this._groupArray[i].setupShape(statusArray,maxvalue,size);
			}
		},
		
		move: function() {
			var i;
			var count = this._groupArray.length;
			
			for (i = 0; i < count; i++) {
				this._groupArray[i].moveShape();
			}
		},
		
		draw: function(x,y) {
			var i;
			var count = this._groupArray.length;
			
			for (i = 0; i < count; i++) {
				this._groupArray[i].drawShape(x,y);
			}
		},
		
		_configureGraphParts: function(groupArray) {
			groupArray.appendObject(CanvasShape.Radar);
		}
};
	
var BaseShape = defineObject(BaseObject,
	{
		setupShape: function() {
		},
		
		moveShape: function() {
		},
		
		drawShape: function() {
		}
	}
);
	
var CanvasShape = {};

CanvasShape.Radar = defineObject(BaseShape,
		{
			_polygon: null,
			_fill: null,
			_numPoints: null,
			_Xpoint: null,
			_Ypoint: null,
			_angle: null,
			_radius: null,
			_dataTags: null,
			_statusArray: null,
			_gradientRadial:null,
			
			setupShape: function(statusArray,maxvalue,size) {
				var canvas = root.getGraphicsManager().getCanvas();
				this._Xpoint = [];
				this._Ypoint = [];
				this._dataTags = [];

				this._numPoints = statusArray.length;

				for (var i = 0; i < this._numPoints; i++) {
					this._dataTags[i] = statusArray[i].type
				}
				
				this._angle = (2 * Math.PI) / this._numPoints;
				this._radius = size;

				this._Xpoint[0] = Math.sin(0) * this._radius;
				this._Ypoint[0] = Math.cos(Math.PI) * this._radius;
	
				this._polygon = canvas.createFigure();
				this._fill = canvas.createFigure();
			
				this._polygon.beginFigure(this._Xpoint[0] , this._Ypoint[0]);
				this._fill.beginFigure(this._Xpoint[0]*this._getValidValue(statusArray[0].param,maxvalue),this._Ypoint[0]*this._getValidValue(statusArray[0].param,maxvalue));
	
				// Generate polygon and fill lines based on data values
				for (var i = 1; i < this._numPoints; i++) {
					this._Xpoint[i] = Math.sin(this._angle * i) * this._radius;
					this._Ypoint[i] = Math.cos(Math.PI + (this._angle * i)) * this._radius;
					this._polygon.addLine(this._Xpoint[i], this._Ypoint[i]);
					this._fill.addLine(this._Xpoint[i]*this._getValidValue(statusArray[i].param,maxvalue), this._Ypoint[i]*this._getValidValue(statusArray[i].param,maxvalue));
				}
				this._polygon.endFigure();
				this._fill.endFigure();

				//var color1 = 0xbd0909;
				//var alpha1 = 140;
				//var color2 = 0x00a603;
				//var alpha2 = 140;
				//var canvas = root.getGraphicsManager().getCanvas();
				// Create a gradation object of radiation by specifying GradientType.RADIAL.
				//this._gradientRadial = canvas.createGradient();
				//this._gradientRadial.beginGradient(GradientType.RADIAL);
				//this._gradientRadial.addColor(color1, alpha1);
				//this._gradientRadial.addColor(color2, alpha2);
				//this._gradientRadial.endGradient();

			},
			
			drawShape: function(x,y) {
				var canvas = root.getGraphicsManager().getCanvas();

				//Polygon Properties
				var polygonColor = 0xd8e3e3;
				var polygonAlpha = 170;
				var polygonStrokeColor = 0x0;
				var polygonStrokeAlpha = 255;
				var polygonStrokeWeight = 2;

				//Growth Fill Properties
				var fillColor = 0x0060d6;
				var fillAlpha = 170;
				var fillStrokeColor = 0x00c8fa;
				var fillStrokeAlpha = 170;
				var fillStrokeWeight = 1;

				//Growth Stat lines properties
				var lineStrokeColor = 0x0;
				var lineStrokeAlpha = 170;
				var lineStrokeWeight = 1;

				//Tags Font
				var font = TextRenderer.getDefaultFont();

				
				canvas.setStrokeInfo(polygonStrokeColor, polygonStrokeAlpha, polygonStrokeWeight, false);
				canvas.setFillColor(polygonColor, polygonAlpha);
				//canvas.setGradient(this._gradientRadial);
				canvas.drawFigure(x, y, this._polygon);

				canvas.setStrokeInfo(fillStrokeColor, fillStrokeAlpha, fillStrokeWeight, false);
				canvas.setFillColor(fillColor, fillAlpha);
				canvas.drawFigure(x, y, this._fill);

				//Draw stat names and reference lines, is done last to make stat names appear over everything.
				for (var i = 0; i < this._numPoints; i++) {

					canvas.setFillColor(lineStrokeColor, lineStrokeAlpha);
					canvas.drawLine(x, y, x+this._Xpoint[i], y+this._Ypoint[i], lineStrokeWeight);

					xtag = Math.sin(this._angle * i) * (this._radius+10);
					ytag = Math.cos(Math.PI + (this._angle * i)) * (this._radius+10);

					width = TextRenderer.getTextWidth(this._dataTags[i], font) + 5;
					height = TextRenderer.getTextHeight(this._dataTags[i], font) + 5;
					TextRenderer.drawKeywordText(x+xtag-(width/2), y+ytag-(height/2), this._dataTags[i], -1, ColorValue.KEYWORD, font);
				}
			},

			_getValidValue: function(value,maxvalue){
				if(value > maxvalue){
					return 1
				}
				return (value/maxvalue)
			}
		}
);
	