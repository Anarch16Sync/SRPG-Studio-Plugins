
/*--------------------------------------------------------------------------
  Adds a new bottom window that displays a unit growth rates as radar graph
  for player units.

  Requires Radar_chart.js to work.
  
  Growth rates displayed are total growth rates, including class and item bonuses.

  Config options:
  Max Growth Value: This is the maximun value for reference in the graph,
  any value beyond this will be drawn up to the limit of the graph.

  Enable display of Mv or Bld growth in the graph, by setting the config variables
  to "true"
  In the case of Bld, the stat has to also be enabled in Config2.

  By default Mv is hidden and Bld is displayed when enabled in the software.

  Author:
  Anarch16sync
  
  History:
  2023/11/22 Released
  
--------------------------------------------------------------------------*/
(function() {

//Config options:
//Value that fills the graph
var maxReferenceGrowth = 100;

//Bld and Mv growth display
//false = hidden
//true = displayed
var radarDisplayMv = true;
var radarDisplayBld = true;






var alias1 = UnitMenuScreen._configureBottomWindows;
UnitMenuScreen._configureBottomWindows = function(groupArray) {
	alias1.call(this, groupArray);
	
  if (this._unit.getUnitType() === UnitType.PLAYER) {
	groupArray.appendWindowObject(UnitMenuBottomGrowthWindow, this);
  }
};

var UnitMenuBottomGrowthWindow = defineObject(BaseMenuBottomWindow,
{
    _statusScrollbar: null,
    _unit: null,
    _unitMenuHelp: 0,
    _isTracingLocked: false,
    _growthArray: null,
    _grothTags: null,
    
    setUnitMenuData: function() {
      this._statusScrollbar = createScrollbarObject(GrowthChartScrollbar, this);	
    },
    
    changeUnitMenuTarget: function(unit) {
      this._unit = unit;
      this._unitMenuHelp = 0;

      this._statusScrollbar.setStatusFromUnit(unit);
		
    },
    
    moveWindowContent: function() {
      var recentlyInput;
      
      RadarchartCanvas.move();
      
      
      return MoveResult.CONTINUE;
    },
    
    drawWindowContent: function(x, y) {
      this._drawGrowthArea(x, y);;
    },
    
    isHelpMode: function() {
      return false
    },
    
    isTracingHelp: function() {
      return false
    },
    
    setHelpMode: function() {
      return false;
    },
    
    getHelpText: function() {
      var text = '';
      var help = this._getActiveUnitMenuHelp();
      return text;
    },
    
    lockTracing: function(isLocked) {
      this._isTracingLocked = isLocked;
    },

    _drawGrowthArea: function(xBase, yBase) {
      
      var width = this.getWindowWidth()
      var height = this.getWindowHeight()
      RadarchartCanvas.draw(xBase+(width/2)-16,(yBase+height/2)-16)

      //var dx = 15;
      //this._statusScrollbar.drawScrollbar(xBase + ItemRenderer.getItemWidth() + dx, yBase);
    }
}
);

var GrowthChartScrollbar = defineObject(StatusScrollbar,
  {
    _statusArray: null,
    _cursorCounter: null,
    _riseCursorSrcIndex: 0,
    _isBonus: false,
    _isCursorDraw: false,

    drawScrollContent: function(x, y, object, isSelect, index) {
      //I may move the draw function here in the future to make it more compatible with other UI plugins
    },
    
    getObjectWidth: function() {
      //May use for something later
    },
    
    getObjectHeight: function() {
      //May use for something later
    },
    
    setStatusFromUnit: function(unit) {
      var i, j;
      var count = ParamGroup.getParameterCount();
      var weapon = ItemControl.getEquippedWeapon(unit);
      
      this._statusArray = [];
      
      for (i = 0, j = 0; i < count; i++) {
        if (this._isParameterDisplayable(i)) {
          this._statusArray[j++] = this._createStatusEntry(unit, i, weapon);
        }
      }
      
      this.setScrollFormation(this.getDefaultCol(), this.getDefaultRow());
      this.setObjectArray(this._statusArray);

      RadarchartCanvas.setup(this._statusArray,maxReferenceGrowth,(UnitMenuBottomGrowthWindow.getWindowHeight()/2)-32)
    },
    
    setStatusBonus: function(bonusArray) {
      var i, j;
      var count = bonusArray.length;
      
      for (i = 0, j = 0; i < count; i++) {
        if (this._isParameterDisplayable(i)) {
          this._statusArray[j++].bonus = bonusArray[i];
        }
      }
    },
    
    enableStatusBonus: function(isCursorDraw) {
      this._isBonus = true;
      this._isCursorDraw = isCursorDraw;
    },
    
    _createStatusEntry: function(unit, index, weapon) {
      var statusEntry = StructureBuilder.buildStatusEntry();
      
      statusEntry.type = ParamGroup.getParameterName(index);
      statusEntry.param = ParamGroup.getGrowthBonus(unit, index) + ParamGroup.getUnitTotalGrowthBonus(unit, index, weapon);
      statusEntry.bonus = 0;
      statusEntry.index = index;
      statusEntry.isRenderable = ParamGroup.isParameterRenderable(index);
      
      return statusEntry;
    },
    
    _isParameterDisplayable: function(index) {
      if (ParamGroup.getParameterType(index) == ParamType.MOV) {
        return radarDisplayMv;
      }
      if (ParamGroup.getParameterType(index) == ParamType.BLD && radarDisplayBld == false) {
        return radarDisplayBld;
      }
      return ParamGroup.isParameterDisplayable(UnitStatusType.NORMAL, index);
    },
    
    _getNumberSpace: function() {
      return 70;
    },
    
    _getTextLength: function() {
      return Math.floor(this.getObjectWidth() / 2);
    }
  }
  );

})();
