
/*-----------------------------------------------------------------------------------------------
  
Function library for custom items
    
  Author:
  o-to
  
  Change log:
  2015/10/11: Create a new range attack item (prototype)
  2015/10/13: Added various elements such as range designation and additional status
  2015/10/16: Fixed to correspond to official update 1.035
  2015/10/31: Responding to skill status ailments, improving enemy AI
              Added damage value display, fixed to play damage effect and unit disappearance at the same time
              Fixed the animation when adding a state to depend on the state's map animation
              Add map terrain change effect
              Changed the damage when used to be done with the enemy's damage
  2015/12/04: Fixed because it ends with an error in the latest version
              Supports animation playback on the tool side
  2016/05/03:
  Corrected so that damage display and HP recovery amount display are omitted when auxiliary only (fixed damage or fixed recovery amount is 0)
  It is now possible to set a multiplier for the score used to determine the action of the enemy AI.
  Corrected to recover HP when specifying negative damage when using
  Ability to set the HP absorption rate of the damage dealt

  2016/10/17:
  Modified so that the value of each status can be set to affect the correction of power
  Added a setting to multiply the final attack power by a correction value
  Fixed some typos
  
  2017/01/29:
  Fixed unused OT_setCustomItemAddState just in case for error handling when adding state

  2019/07/07:
  With the state data deleted on the editor side and the ID missing
  'BadState' or 'GoodState' was specified for IER_DelState or OT_UseDelState of Caspar
  Fixed an issue where hovering over an item would cause an error.
  Items with 'BadState', 'GoodState', or 'AllState' that do not support OT_UseAddState and IER_AddState
  Fixed to exit with a warning that you do not want to specify an error message when you hover the cursor.

  2019/10/06:
  When OT_UnitReflection is set to true and unit ability is reflected in power,
  Fixed so that the correction value of the attack by "support effect" is referenced.
  Corrected so that the correction value of defense by "support effect" is referred to when the damage type is physical or magic.
  Fixed whether or not to be affected by the attack, defense, hit, and evasion of the support effect can be set with Kaspara (each default is true).

  2020/04/28:
  Added a custom parameter called IER_HitMark as a mandatory setting.
  
  Fixed so that the effect range becomes "whole area" when 99 is set to IER_EffectRangeType.
  If the range of effect is the entire area, the range type specification is invalid and can be activated anywhere.
  Also added a square type to the area effect type.
  
  Added a custom parameter called IER_SoundDuplicate to prevent duplication of hit sounds.
  
  Fixed an issue where if the area of ??effect is Breath type, moving the cursor diagonally to the user would cause an extreme drop in processing.
  Fixed the variable name that was likely to be the source of the problem (IndexArray → indexArray)
  Also, when the effect range type is breath type, the range type is now forced to be a cross type.
  
  Added box type to area of ??effect type.
  
  The description of the item is divided, and the display can be switched with the key specified by SYSTEM in [keyboard] of game.ini (default: left shift).
  
  Fixed the window so that the damage and hit rate for characters within the effect range are displayed.
  The display can be switched with the key specified by SYSTEM in [keyboard] of game.ini (default: left shift).
  
  Greatly modified AI processing when enemies use range attack items. Greatly improved processing speed.
  
  Reviewed default values ??to work with minimum custom parameters (power, range).
  Create a file EffectRangeItemDefault.js that defines default values.
  
  About IER_HitReflection (adding unit skill to hit rate, adding weapon hit value to hit rate)
  Split parameters into IER_HitReflectionUnit, IER_HitReflectionWeapon.
  (It is possible to specify either the old model or the new method)

  2020/05/04:
  Fixed because the log for debug confirmation was output.

  2020/05/05:
  Fixed an issue where an enemy would get an error when trying to use ranged attacks of certain range types.

-----------------------------------------------------------------------------------------------*/
// Range type
OT_EffectRangeType = {
	  NORMAL:0
	, CROSS:1
	, XCROSS:2
	, DOUBLECROSS:3
	, LINE:4
	, HORIZONTALLINE:5
	, BREATH:6
	, BOX:7
	, DEBUG:90
	, ALL:99
};

// Status definition constants
OT_DefineStatus = {
	  LV : 'LV'
	, HP : 'HP'
	, EP : 'EP'
	, FP : 'FP'
};

// Linked array of parameters in which the current value and maximum value are separated
OT_NowStatusMapping = {
	  MHP : 'HP'
	, MEP : 'EP'
	, MFP : 'FP'
};

OT_SLANTING = 100;

StatusRenderer.drawEffectRangeAttackStatus = function(x, y, arr, color, font, space, recovery) {
	var baseX = x;
	var baseY = y;
	var i, text;
	var length = this._getTextLength();
	var numberSpace = DefineControl.getNumberSpace();
	//var buf = ['attack_capacity', 'hit_capacity', 'critical_capacity'];

	// amount of damage
	x = baseX;
	if(recovery) {
		text = 'REC:';
	} else {
		text = 'DMG:';
	}
	TextRenderer.drawKeywordText(x, y, text, length, color, font);
	x += 32 + numberSpace;
	
	if (arr[0] >= 0) {
		NumberRenderer.drawNumber(x, y, arr[0]);
	} else {
		TextRenderer.drawSignText(x - 5, y, StringTable.SignWord_Limitless);
	}
	
	// Accuracy
	x = baseX;
	y += space;
	text = root.queryCommand('hit_capacity') + ':';
	TextRenderer.drawKeywordText(x, y, text, length, color, font);
	x += 32 + numberSpace;
	
	if (arr[1] >= 0) {
		NumberRenderer.drawNumber(x, y, arr[1]);
	}
	else {
		TextRenderer.drawSignText(x - 5, y, StringTable.SignWord_Limitless);
	}
};

var PosEffectRangeItemWindow = defineObject(PosItemWindow, 
{
	getWindowTextUI: function() {
		return Miscellaneous.getColorWindowTextUI(this._unit);
	}
});

var PosEffectRangeItemEnemyWindow = defineObject(PosItemWindow, 
{
	_posX:0,
	_posY:0,
	_damage:0,
	_hit:100,
	_statusArray: null,
	_recovery:false,

	drawWindow: function(x, y) {
		var width = this.getWindowWidth();
		var height = this.getWindowHeight();
		
		if (!this._isWindowEnabled) {
			return;
		}

		this._drawWindowInternal(x, y, width, height);
		
		if (this._drawParentData !== null) {
			this._drawParentData(x, y);
		}
		
		
		// Make it possible to refer to the coordinates with the mouse in the move system method
		this.xRendering = x + this.getWindowXPadding();
		this.yRendering = y + this.getWindowYPadding();

		//var session = root.getCurrentSession();
		//var width = UIFormat.MAPCURSOR_WIDTH / 2;
		//var height = UIFormat.MAPCURSOR_HEIGHT;
		//var x = (this._posX * GraphicsFormat.MAPCHIP_WIDTH) - session.getScrollPixelX();
		//var y = (this._posY * GraphicsFormat.MAPCHIP_HEIGHT) - session.getScrollPixelY();
		
		
		this.drawWindowContent(x + this.getWindowXPadding(), y + this.getWindowYPadding());
	},

	drawWindowContent: function(x, y) {
		this.drawUnit(x + 55, y - 20);
		this.drawInfo(x, y);
	},

	drawInfo: function(xBase, yBase) {
		this.drawName(xBase, yBase);
		this.drawInfoTop(xBase, yBase);
		this.drawInfoCenter(xBase, yBase);
		this.drawInfoBottom(xBase, yBase);

		//var x = xBase;
		//var y = yBase;
		//var length = this._getTextLength();
		//var textui = this.getWindowTextUI();
		//var color = textui.getColor();
		//var font = textui.getFont();
		//
		//TextRenderer.drawText(x, y, 'D:' + this._damage, length, color, font);
		//TextRenderer.drawText(x, y+20, 'H:' + this._hit, length, color, font);
	},

	drawInfoTop: function(xBase, yBase) {
		var x = xBase;
		var y = yBase + 20;
		var dx = [0, 44, 60, 98];
		var textHp = ContentRenderer._getHpText();
		var pic = root.queryUI('unit_gauge');
		var balancer = this._gaugeBar.getBalancer();
		
		if (this._unit !== null) {
			//ContentRenderer.drawHp(x, y + 20, balancer.getCurrentValue(), balancer.getMaxValue());
			//this._gaugeBar.drawGaugeBar(x, y + 40, pic);
			TextRenderer.drawSignText(x + dx[0], y, textHp);
			NumberRenderer.drawNumber(x + dx[1], y, balancer.getMaxValue());

		}
	},

	drawInfoCenter: function(xBase, yBase) {
	},
	
	drawInfoBottom: function(xBase, yBase) {
		var x = xBase;
		var y = yBase + 40;
		var textui = this.getWindowTextUI();
		var color = ColorValue.KEYWORD;
		var font = textui.getFont();
		
		StatusRenderer.drawEffectRangeAttackStatus(x, y, this._statusArray, color, font, 20, this._recovery);
	},
		
	setPosTarget: function(unit, item, targetUnit, targetItem, isSrc) {
		//if (item !== null && !item.isWeapon()) {
		//	this._obj = ItemPackageControl.getItemPotencyObject(item);
		//	this._obj.setPosMenuData(unit, item, targetUnit);
		//}

		var damage = OT_getCustomItemFinalDamage(targetUnit, targetItem);
		var damageType  = OT_getCustomItemType(targetItem);
		var hit = OT_getCustomItemHitPercent(targetUnit, unit, targetItem);
		var value = 0;

		this._recovery = OT_getCustomItemRecovery(targetItem);
		if( this._recovery ) {
			value = Calculator.calculateRecoveryValue(unit, damage, RecoveryType.SPECIFY, 0);
		} else {
			value = OT_getCalculateDamageValue(targetItem, unit, damage, damageType, 0);
		}
		
		//root.log(unit.getName() + ':' + damagePoint + 'hit' + hit);
		this._statusArray = [value, hit];
		this.setPosInfo(unit, item, isSrc);
	},

	setPosPoint: function(x, y) {
		this._posX = x;
		this._posY = y;
	},
	
	setPosInfo: function(unit, item, isSrc) {
		this._unit = unit;
		this._item = item;
		this._gaugeBar.setGaugeInfo(unit.getHp(), ParamBonus.getMhp(unit), 1);
		this._gaugeBar.setPartsCount(4);
	},

	getWindowWidth: function() {
		return 110;
	},
	
	getWindowHeight: function() {
		return 110;
	},

	getWindowXPadding: function() {
		return 10;
	}

});

var PosMenuEffectRange = defineObject(PosMenu, 
{
	_posEnemyWindow: [],
	_enemyDataArray  : [],
	_maxEnemyWindowView: 10,	//If you do not set the maximum number of windows to about 10, the processing will be heavy
	_maxEnemyWindowWidth: 5,	//the number of columns in the window
	_maxEnemyWindowHeight: 2,	//the number of lines in the window
	_nowIndex  : 0,
	_maxIndex  : 0,

	checkIndexTarget: function() {
		if(InputControl.isInputAction(InputType.BTN4)) {
			if(this._nowIndex < this._maxIndex) {
				this._nowIndex += 1;
			} else {
				this._nowIndex = 0;
			}
			MediaControl.soundDirect('menutargetchange');
			this.changeIndexTarget();
		}

		return MoveResult.CONTINUE;
	},

	changeIndexTarget: function() {
		var index = this._nowIndex * this._maxEnemyWindowView;
		var count = 0;
		
		delete(this._posEnemyWindow);
		this._posEnemyWindow = [];
		for( i=index; i<this._enemyDataArray.length ; i++) {
			this._posEnemyWindow.push(createWindowObject(PosEffectRangeItemEnemyWindow, this));
			this._posEnemyWindow[count].setPosTarget(this._enemyDataArray[i][0], this._enemyDataArray[i][1], this._unit, this._item, false);
			this._posEnemyWindow[count].setPosPoint(0, 0);
			
			count++;
			if(this._maxEnemyWindowView <= count) {
				break;
			}
		}
	},
	
	createPosMenuWindow: function(unit, item, type) {
		var obj = PosEffectRangeItemWindow;
		
		this._posWindowLeft = createWindowObject(PosEffectRangeItemWindow, this);
		this._posWindowRight = createWindowObject(PosEffectRangeItemEnemyWindow, this);
		
		this._unit = unit;
		this._item = item;
		this._posWindowLeft.setPosTarget(this._unit, this._item, null, null, true);
		
		//this._maxEnemyWindowWidth  = Math.floor(root.getGameAreaWidth() / PosEffectRangeItemEnemyWindow.getWindowWidth());
		//this._maxEnemyWindowHeight = Math.floor(root.getGameAreaHeight() / PosEffectRangeItemEnemyWindow.getWindowHeight());
		//this._maxEnemyWindowView   = this._maxEnemyWindowWidth * this._maxEnemyWindowHeight;
		
		//root.log(this._maxEnemyWindowWidth );
		//root.log(this._maxEnemyWindowHeight);
		//root.log(this._maxEnemyWindowView  );
	},
	
	// drawing process
	drawWindowManager: function() {
		var x, y;

		if (this._unit === null) {
			return;
		}
		
		x = this.getPositionWindowX();
		y = this.getPositionWindowY();
		
		//this._posWindowLeft.drawWindow(x, y);
		
		
		var i;
		var j=0;
		var posX;
		var posY;
		for(i=0 ; i<this._posEnemyWindow.length ; i++) {
			j = Math.floor(i / this._maxEnemyWindowWidth);
			
			posX = x + (i % this._maxEnemyWindowWidth) * this._posEnemyWindow[i].getWindowWidth() + this._getWindowInterval();
			posY = y + j * this._posEnemyWindow[i].getWindowHeight();
			this._posEnemyWindow[i].drawWindow(posX, posY);
		}
		
		if(this._nowIndex != this._maxIndex) {
			j = 1 + Math.floor((i-1) / this._maxEnemyWindowWidth);
			y = y + j * PosEffectRangeItemEnemyWindow.getWindowHeight();
			var textui = root.queryTextUI('single_window');
			var pic  = textui.getUIImage();
			var width = 200;
			var height = 24;
			WindowRenderer.drawStretchWindow(x, y, width, height, pic);
			ItemInfoRenderer.drawKeyword(x + 20, y, 'Targets [' + (this._nowIndex + 1) + '/' + (this._maxIndex) + ']');
		}
		
		//this._posWindowRight.drawWindow(x + this._posWindowLeft.getWindowWidth() + this._getWindowInterval(), y);
	},

	getPositionWindowX: function() {
		return Miscellaneous.getDyamicWindowY(this._unit, this._currentTarget, this._posWindowLeft.getWindowWidth());
	},
	
	getPositionWindowY: function() {
		return Miscellaneous.getDyamicWindowY(this._unit, this._currentTarget, this._posWindowLeft.getWindowHeight());
	},
	
	changePosCheckTarget: function(effectRangeArray) {
		var targetItem, isLeft;
		
		if (this._unit === null) {
			this._currentTarget = null;
			return;
		}
		
		
		var targetUnit;
		var x, y, index;
		var count = 0;
		var filter = OT_EffectRangeGetFilter(this._unit, this._item);
		var tmpEnemyDataArray = [];
		for(var i=0 ; i<effectRangeArray.length ; i++) {
			index = effectRangeArray[i];
			x = CurrentMap.getX(index);
			y = CurrentMap.getY(index);
			targetUnit = PosChecker.getUnitFromPos(x, y);
			
			
			if(targetUnit != null) {
				if(!OT_EffectRangeCheckFilter(targetUnit, filter)) continue;
				
				targetItem = ItemControl.getEquippedWeapon(targetUnit);
				tmpEnemyDataArray.push([targetUnit, targetItem]);
			}
		}
		//if(this._enemyDataArray == tmpEnemyDataArray) {
		//	return;
		//}
		
		this._enemyDataArray = tmpEnemyDataArray;
		
		delete(this._posEnemyWindow);
		this._posEnemyWindow = [];
		for(var i=0 ; i<this._enemyDataArray.length ; i++) {
			this._posEnemyWindow.push(createWindowObject(PosEffectRangeItemEnemyWindow, this));
			this._posEnemyWindow[count].setPosTarget(this._enemyDataArray[i][0], this._enemyDataArray[i][1], this._unit, this._item, false);
			this._posEnemyWindow[count].setPosPoint(0, 0);
			
			count++;
			if(this._maxEnemyWindowView <= count) {
				break;
			}
		}
		
		this._nowIndex = 0;
		if(this._enemyDataArray.length > 0) {
			this._maxIndex = Math.floor(this._enemyDataArray.length / this._maxEnemyWindowView) + 1;
		} else {
			this._maxIndex = 0;
		}
	},

	emptyTarget: function() {
		delete(this._posEnemyWindow);
		this._posEnemyWindow = [];
		this._enemyDataArray = [];
		this._nowIndex = 0;
		this._maxIndex = 0;
	}
});

// Range attack cursor
var PosEffectRangeFreeCursor = defineObject(PosFreeCursor,
{
	checkCursor: function() {
		var x, y;
		
		this._mapCursor.moveCursor();
		
		x = this._mapCursor.getX();
		y = this._mapCursor.getY();
		if (x !== this._xPrev || y !== this._yPrev) {
			this._xPrev = x;
			this._yPrev = y;
			//targetUnit = PosChecker.getUnitFromPos(px, py);


			var item = this._parentSelector.item;
			var unit = this._parentSelector._unit;
			if( this._parentSelector.getSelectorPos(true) ) {
				var indexArray = OT_EffectRangeIndexArray.getEffectRangeItemIndexArray(this._xPrev, this._yPrev, item, unit);
				MapLayer.OT_getEffectRangePanel().setIndexArray(indexArray);
				this._parentSelector.setCheckTarget(indexArray);
			} else {
				MapLayer.OT_getEffectRangePanel().endLight();
				this._parentSelector.emptyTarget();
			}
		} else {
			this._parentSelector.setCheckIndex();
		}
	}
});

// Activation point selection object for implementing area of effect
OT_EffectRangePosSelector = defineObject(PosSelector,
{
	item:null,
	_effectRangeArray:null,
/*
	initialize: function() {
		PosSelector.initialize.call(this);

		//menu
		this._posMenu = createObject(OT_EffectRangePosMenu);
	},
*/	
	initialize: function() {
		this._mapCursor = createObject(MapCursor);
		this._posMenu = createObject(PosMenuEffectRange);
		this._selectorType = this._getDefaultSelectorType();
	},
	
	setUnitOnly: function(unit, item, indexArray, type, filter) {
		this._unit = unit;
		this._indexArray = indexArray;
		this._filter = filter;
		this.item = item;
		MapLayer.getMapChipLight().setIndexArray(indexArray);
		this._setPosMenu(unit, item, type);
		this._posCursor = createObject(PosEffectRangeFreeCursor);
		this._posCursor.setParentSelector(this);
	},

	_getDefaultSelectorType: function() {
		return PosSelectorType.FREE;
	},
	
	movePosSelector: function() {
		var result = PosSelectorResult.NONE;
		
		if (InputControl.isSelectAction()) {
			this._playSelectSound();
			result = PosSelectorResult.SELECT;
		}
		else if (InputControl.isCancelAction()) {
			this._playCancelSound();
			result = PosSelectorResult.CANCEL;
		}
		else {
			this._posCursor.checkCursor();
		}
		
		return result;
	},

	
	setCheckTarget: function(effectRangeArray) {
		this._effectRangeArray= effectRangeArray;
		this._posMenu.changePosCheckTarget(this._effectRangeArray);
	},

	setCheckIndex: function() {
		this._posMenu.checkIndexTarget();
	},

	emptyTarget: function() {
		this._posMenu.emptyTarget();
	},
	
	_setPosMenu: function(unit, item, type) {
		this._posMenu.createPosMenuWindow(unit, item, type);
		//this._posMenu.changePosTarget(null);
	},

	getSelectorTarget: function(isIndexArray) {
		var unit = this._mapCursor.getUnitFromCursor();
		
		return unit;
	},

	endPosSelector: function() {
		MapLayer.getMapChipLight().endLight();
		MapLayer.OT_getEffectRangePanel().endLight();
	}
}
);

(function() {

//----------------------------------------------------------
// area of effect panel
//----------------------------------------------------------
MapLayer.OT_EffectRangePanel = null;

MapLayer.OT_getEffectRangePanel = function() {
	return this.OT_EffectRangePanel;
};

var alias101 = MapLayer.prepareMapLayer;
MapLayer.prepareMapLayer = function() {
	alias101.call(this);
	this.OT_EffectRangePanel = createObject(MapChipLight);
	this.OT_EffectRangePanel.setLightType(MapLightType.RANGE);
};

var alias102 = MapLayer.moveMapLayer;
MapLayer.moveMapLayer = function() {
	this.OT_EffectRangePanel.moveLight();
	return alias102.call(this);
};

var alias103 = MapLayer.drawUnitLayer;
MapLayer.drawUnitLayer =  function() {
	alias103.call(this);
	this.OT_EffectRangePanel.drawLight();
};

// Area-creating object for area-of-effect implementations
OT_EffectRangeIndexArray = {
	createIndexArray: function(x, y, item) {
		return this.getRangeItemIndexArray(x, y, item, false);
	},
	
	getBestIndexArray: function(x, y, startRange, endRange) {
		var simulator = root.getCurrentSession().createMapSimulator();
		
		simulator.startSimulationRange(x, y, startRange, endRange);
		
		return simulator.getSimulationIndexArray();
	},

	//Activation position, items used, units used
	getEffectRangeItemIndexArray: function(x, y, item, unit, isGetIndexData) {
	if( typeof isGetIndexData === 'undefined' ) {
		isGetIndexData = false;
	}
		var startRange = OT_getCustomItemEffectRangeMin(item);
		var endRange = OT_getCustomItemEffectRangeMax(item);
		var effectRangeType = OT_getCustomItemEffectRangeType(item);
		var spread = OT_getCustomItemEffectSpread(item);

		return this.getEffectRangeIndexArray( x, y, startRange, endRange, effectRangeType, spread, unit.getMapX(), unit.getMapY(), isGetIndexData );
	},
	
	getEffectRangeItemIndexArrayPos: function(x, y, item, px, py, isGetIndexData) {
		if( typeof isGetIndexData === 'undefined' ) {
			isGetIndexData = false;
		}
		var startRange = OT_getCustomItemEffectRangeMin(item);
		var endRange = OT_getCustomItemEffectRangeMax(item);
		var effectRangeType = OT_getCustomItemEffectRangeType(item);
		var spread = OT_getCustomItemEffectSpread(item);

		return this.getEffectRangeIndexArray( x, y, startRange, endRange, effectRangeType, spread, px, py, isGetIndexData );
	},

	getEffectRangeItemIndexArrayPosInfo: function(x, y, item, px, py, isGetIndexData) {
		if( typeof isGetIndexData === 'undefined' ) {
			isGetIndexData = false;
		}
		var startRange = OT_getCustomItemEffectRangeMin(item);
		var endRange = OT_getCustomItemEffectRangeMax(item);
		var effectRangeType = OT_getCustomItemEffectRangeType(item);
		var spread = OT_getCustomItemEffectSpread(item);
		
		if(endRange > 20) {
			endRange = 20;
		}

		return this.getEffectRangeIndexArray( x, y, startRange, endRange, effectRangeType, spread, px, py, isGetIndexData );
	},

	// Coordinates of the user, item, estimated location of activation
	getAIEffectRangeItemIndexArray: function(posX, posY, item, direction) {
		var endRange = OT_getCustomItemEffectRangeMax(item);
		var startRange = OT_getCustomItemEffectRangeMin(item);
		var effectRangeType = OT_getCustomItemEffectRangeType(item);
		var spread = OT_getCustomItemEffectSpread(item);

		if( startRange < 0 ) startRange = 0;
		
		return this.getAIEffectRangeIndexArray( posX, posY, startRange, endRange, effectRangeType, spread, direction);
	},

	getRangeItemIndexArray: function(x, y, item, isGetIndexData) {
		if( typeof isGetIndexData === 'undefined' ) {
			isGetIndexData = false;
		}
		
		var startRange = OT_getCustomItemRangeMin(item);
		var endRange = OT_getCustomItemRangeMax(item);
		var rangeType = OT_getCustomItemRangeType(item);
		var spread = OT_getCustomItemRangeSpread(item);

		if( startRange > endRange )
		{
			startRange = endRange;
		}

		var effectRangeType = OT_getCustomItemEffectRangeType(item);

		//root.log('x:' + x + ' y:' + y + ' startRange:' + startRange + ' endRange:' + endRange + ' rangeType:' + rangeType);
		return this.getRangeIndexArray( x, y, startRange, endRange, rangeType, spread, isGetIndexData );
	},

	getRangeItemIndexArrayInfo: function(x, y, item, isGetIndexData) {
		if( typeof isGetIndexData === 'undefined' ) {
			isGetIndexData = false;
		}
		
		var startRange = OT_getCustomItemRangeMin(item);
		var endRange = OT_getCustomItemRangeMax(item);
		var rangeType = OT_getCustomItemRangeType(item);
		var spread = OT_getCustomItemRangeSpread(item);

		if(endRange > 20) {
			endRange = 20;
		}

		if( startRange > endRange )
		{
			startRange = endRange;
		}

		var effectRangeType = OT_getCustomItemEffectRangeType(item);

		//root.log('x:' + x + ' y:' + y + ' startRange:' + startRange + ' endRange:' + endRange + ' rangeType:' + rangeType);
		return this.getRangeIndexArray( x, y, startRange, endRange, rangeType, spread, isGetIndexData );
	},
	
	getAIRangeItemIndexArray: function(x, y, item, startRange, isGetIndexData) {
		if( typeof isGetIndexData === 'undefined' ) {
			isGetIndexData = false;
		}
		
		//var startRange = OT_getCustomItemRangeMin(item);
		var endRange = OT_getCustomItemRangeMax(item);
		var rangeType = OT_getCustomItemRangeType(item);
		var spread = OT_getCustomItemRangeSpread(item);

		if( startRange > endRange )
		{
			startRange = endRange;
		}

		var effectRangeType = OT_getCustomItemEffectRangeType(item);

		return this.getRangeIndexArray( x, y, startRange, endRange, rangeType, spread, isGetIndexData );
	},
	
	getRangeIndexArray: function(x, y, startRange, endRange, effectRangeType, spread, isGetIndexData) {
		if( typeof isGetIndexData === 'undefined' ) {
			isGetIndexData = false;
		}
		
		var indexArray = null;

		switch( effectRangeType )
		{
			case OT_EffectRangeType.CROSS:
				indexArray = OT_getCrossIndexArray(x, y, startRange, endRange, spread, isGetIndexData);
				break;
			
			case OT_EffectRangeType.XCROSS:
				indexArray = OT_getXCrossIndexArray(x, y, startRange, endRange, spread, isGetIndexData);
				break;

			case OT_EffectRangeType.DOUBLECROSS:
				indexArray = OT_getDoubleCrossIndexArray(x, y, startRange, endRange, spread, isGetIndexData);
				break;
			
			case OT_EffectRangeType.ALL:
				indexArray = OT_getAllIndexArray(isGetIndexData);
				break;
				
			default:
				if(isGetIndexData) {
					indexArray = OT_getNormalIndexArray(x, y, startRange, endRange, isGetIndexData);
				} else {
					var simulator = root.getCurrentSession().createMapSimulator();
					simulator.startSimulationRange(x, y, startRange, endRange);
					indexArray = simulator.getSimulationIndexArray();
				}
				
				//indexArray = OT_getLineIndexArray(x, y, startRange, endRange, 0);
				break;
		}
		//root.log(ERType);
		return indexArray;
	},
	
	// Activation position (X, Y), start range, end range, range type, spread, caster position (X, Y)
	getEffectRangeIndexArray: function(x, y, startRange, endRange, effectRangeType, spread, unit_x, unit_y, isGetIndexData) {
		var indexArray = [];

		var direction = OT_getUnitDirection(unit_x, unit_y, x, y);
		
		//root.log('index1:'+CurrentMap.getIndex(x, y));
		//root.log('index2:'+CurrentMap.getIndex(unit_x, unit_y));
		//root.log('direction:'+direction);
		if( typeof isGetIndexData === 'undefined' ) {
			isGetIndexData = false;
		}

		switch( effectRangeType )
		{
			case OT_EffectRangeType.CROSS:
				indexArray = OT_getCrossIndexArray(x, y, startRange, endRange, spread, isGetIndexData);
				break;
			
			case OT_EffectRangeType.XCROSS:
				indexArray = OT_getXCrossIndexArray(x, y, startRange, endRange, spread, isGetIndexData);
				break;

			case OT_EffectRangeType.DOUBLECROSS:
				indexArray = OT_getDoubleCrossIndexArray(x, y, startRange, endRange, spread, isGetIndexData);
				break;
			
			case OT_EffectRangeType.LINE:
				if( direction >= OT_SLANTING )
				{
					indexArray = OT_getDiagonalIndexArray(x, y, startRange, endRange, direction - OT_SLANTING, spread, isGetIndexData);
				}
				else if( direction != -1)
				{
					indexArray = OT_getLineIndexArray(x, y, startRange, endRange, direction, spread, isGetIndexData);
				}
				break;

			case OT_EffectRangeType.HORIZONTALLINE:
				if( direction >= OT_SLANTING )
				{
					indexArray = OT_getDiagonalHorizontalLineIndexArray(x, y, startRange, endRange, direction - OT_SLANTING, spread, isGetIndexData);
				}
				else if( direction != -1)
				{
					indexArray = OT_getHorizontalLineIndexArray(x, y, startRange, endRange, direction, spread, isGetIndexData);
				}
				break;

			case OT_EffectRangeType.BREATH:
				if( direction >= OT_SLANTING ) {
					//indexArray = OT_getDiagonalBreathIndexArray(x, y, startRange, endRange, direction - OT_SLANTING, spread);
					indexArray = [];
				}
				else if( direction != -1)
				{
					indexArray = OT_getBreathIndexArray(x, y, startRange, endRange, direction, spread, isGetIndexData);
					//indexArray = OT_getAllBreathIndexArray(x, y, startRange, endRange, 2, isGetIndexData);
				}
				break;

			case OT_EffectRangeType.BOX:
					indexArray = OT_getBoxIndexArray(x, y, startRange, endRange, isGetIndexData);
				break;

			//case OT_EffectRangeType.DEBUG:
			//		indexArray = OT_getAllBreathIndexArray(x, y, startRange, endRange, spread, isGetIndexData);
			//	break;

			case OT_EffectRangeType.DEBUG:
					indexArray = OT_getBoxIndexArray(x, y, startRange, endRange, isGetIndexData);
					Array.prototype.push.apply( indexArray, IndexArray.getBestIndexArray(x, y, startRange, endRange) );
					//unique(indexArray);
				break;
				
			case OT_EffectRangeType.ALL:
				indexArray = OT_getAllIndexArray(isGetIndexData);
				break;

			default:
				if(isGetIndexData) {
					indexArray = OT_getNormalIndexArray(x, y, startRange, endRange, isGetIndexData);
				} else {
					var simulator = root.getCurrentSession().createMapSimulator();
					simulator.startSimulationRange(x, y, startRange, endRange);
					indexArray = simulator.getSimulationIndexArray();
				}
				
				//indexArray = OT_getLineIndexArray(x, y, startRange, endRange, 0);
				break;
		}
		//root.log(ERType);
		return indexArray;
	},

	// Activation position (X, Y), start range, end range, range type, spread, caster position (X, Y)
	getAIEffectRangeIndexArray: function(posX, posY, startRange, endRange, effectRangeType, spread, direction) {
		//var direction = OT_getUnitDirection(posX, posY, targetX, targetY);
		var indexArray = [];

		//root.log('index1:'+CurrentMap.getIndex(posX, posY));
		//root.log('index2:'+CurrentMap.getIndex(targetX, targetY));
		//root.log('direction:'+direction);

		switch( effectRangeType )
		{
			case OT_EffectRangeType.CROSS:
				indexArray = OT_getCrossIndexArray(posX, posY, startRange, endRange, spread);
				break;
			
			case OT_EffectRangeType.XCROSS:
				indexArray = OT_getXCrossIndexArray(posX, posY, startRange, endRange, spread);
				break;

			case OT_EffectRangeType.HORIZONTALLINE:
				if( direction >= 4 ) {
					indexArray = OT_getDiagonalHorizontalLineIndexArray(posX, posY, startRange, endRange, direction - 4, spread);
				} else if( direction != -1) {
					indexArray = OT_getHorizontalLineIndexArray(posX, posY, startRange, endRange, direction, spread);
				}
				break;
				
			case OT_EffectRangeType.LINE:
				if( direction >= 4 ) {
					indexArray = OT_getDiagonalIndexArray(posX, posY, startRange, endRange, direction - 4, spread);
				} else if( direction != -1) {
					indexArray = OT_getLineIndexArray(posX, posY, startRange, endRange, direction, spread);
				}
				break;
				
			case OT_EffectRangeType.DOUBLECROSS:
				indexArray = OT_getDoubleCrossIndexArray(posX, posY, startRange, endRange, spread);
				break;
			
			case OT_EffectRangeType.BREATH:
				if( direction != -1) {
					indexArray = OT_getBreathIndexArray(posX, posY, startRange, endRange, direction, spread);
				}
				break;

			case OT_EffectRangeType.BOX:
					indexArray = OT_getBoxIndexArray(posX, posY, startRange, endRange);
				break;

			default:
				var simulator = root.getCurrentSession().createMapSimulator();
				simulator.startSimulationRange(posX, posY, startRange, endRange);
				indexArray = simulator.getSimulationIndexArray();
				
				break;
		}
		//root.log(ERType);
		return indexArray;
	},

	findUnit: function(indexArray, targetUnit) {
		var i, index, x, y;
		var count = indexArray.length;
		
		if (count === CurrentMap.getSize()) {
			return true;
		}
		
		for (i = 0; i < count; i++) {
			index = indexArray[i];
			x = CurrentMap.getX(index);
			y = CurrentMap.getY(index);
			if (PosChecker.getUnitFromPos(x, y) === targetUnit) {
				return true;
			}
		}
		
		return false;
	},
	
	findPos: function(indexArray, xTarget, yTarget) {
		var i, index, x, y;
		var count = indexArray.length;
		
		if (count === CurrentMap.getSize()) {
			return true;
		}
		
		for (i = 0; i < count; i++) {
			index = indexArray[i];
			x = CurrentMap.getX(index);
			y = CurrentMap.getY(index);
			if (x === xTarget && y === yTarget) {
				return true;
			}
		}
		
		return false;
	}
};

// For enemy AI calculation
OT_EffectRangeAIScoreCalculation = {

	_getTotalScore: function(unit, targetUnit, item) {
		var n;
		var score = 0;

		var filter = this.getUnitFilter(unit, item);
		var isIndifference = OT_getCustomItemIndifference(item);
		
		if(OT_getCustomItemRecovery(item)) {
			// recovery system
			score += this._getRecoveryScore(unit, targetUnit, item);
			score += this._getStateScoreModeRecovery(unit, targetUnit, item);
		} else {
			n = this._getDamageScore(unit, targetUnit, item);
			if (n === 0 && !DataConfig.isAIDamageZeroAllowed()) {
				return 0;	// -1 for no damage
			}
			score += n;
			
			n = this._getHitScore(unit, targetUnit, item);
			if (n === 0 && !DataConfig.isAIHitZeroAllowed()) {
				return 0;
			}
			score += n;

			score += this._getStateScore(unit, targetUnit, item);
		}
		

		// Even though it is an attack system, if you involve an ally,
		// Or if the enemy is involved in the recovery system, it will be treated as a negative evaluation and doubled.
		if( this._checkFilter(targetUnit, filter) == false ) {
			score *= -2;
		}
		
		//DebugPrint('score check:' + targetUnit.getName() + '/' + score);
		
		// If the damage dealt is 7, the hit rate is 80, and the critical probability is 10,
		// 42 (7 * 6) 6 is Miscellaneous.convertAIValue
		// 16 (80 / 5)
		// 2 (10 / 5)
		// Get a total score of 60
		
		return Math.floor(score);
	},

	// Aggressive score calculation
	_getDamageScore: function(unit, targetUnit, item) {
		var damageValue = OT_getCustomItemFinalDamage(unit, item);
		var damageType = OT_getCustomItemType(item);
		var damage = 0;
		var score = 0;
		var hp = targetUnit.getHp();
		var isDeath = false;

		//if(OT_getCustomItemRecovery(item)) {
		//	return Calculator.calculateRecoveryValue(targetUnit, damageValue, RecoveryType.SPECIFY, 0);
		//}
		
		damage = OT_getCalculateDamageValue(item, targetUnit, damageValue, damageType, 0);
		hp -= damage;
		if (hp <= 0) {
			isDeath = true;
		}
		
		score = Miscellaneous.convertAIValue(damage);
		
		// If you can beat the opponent, give preference
		if (isDeath) {
			score += 50;
		}
		
		return score;
	},

	// Recovery system score calculation
	_getRecoveryScore: function(unit, targetUnit, item) {
		var value = OT_getCustomItemFinalDamage(unit, item);
		var damage = 0;
		var score = 0;
		
		var maxHp = ParamBonus.getMhp(targetUnit);
		var currentHp = targetUnit.getHp();
		var baseHp;
		
		// -1 for maximum value without need for recovery
		if (currentHp === maxHp) {
			return 0;
		}
		
		// Priority is given to units whose HP is rapidly decreasing.
		baseHp = Math.floor(maxHp * 0.25);
		if (currentHp < baseHp) {
			score = 50;
		}
		
		baseHp = Math.floor(maxHp * 0.5);
		if (currentHp < baseHp) {
			score = 30;
		}
		
		baseHp = Math.floor(maxHp * 0.75);
		if (currentHp < baseHp) {
			score = 10;
		}
		
		score += Calculator.calculateRecoveryValue(targetUnit, value, RecoveryType.SPECIFY, 0);
		
		return Miscellaneous.convertAIValue(score);
	},

	_getHpScore: function(targetUnit) {
		var limitHp = DataConfig.getMaxParameter(0);
		var maxHp = ParamBonus.getMhp(targetUnit);
		var currentHp = targetUnit.getHp();
		
		// High score when HP is low
		score = 0;

		// Score addition for units whose HP is rapidly depleted
		if (currentHp < Math.floor(maxHp * 0.25)) {
			score += 50;
		} else if (currentHp < Math.floor(maxHp * 0.5)) {
			score += 30;
		} else if (currentHp < Math.floor(maxHp * 0.75)) {
			score += 10;
		}
		
		return score;
	},

	_getHitScore: function(unit, targetUnit, item) {
		var hit = OT_getCustomItemHitPercent(unit, targetUnit, item);
		
		//root.log(hit);
		// Decrease the value to prioritize accuracy.
		return Math.floor(hit / 5);
	},

	// Adding and removing offensive states
	// Gives an advantageous state to the enemy, and does not reduce the score even when removing an unfavorable abnormality
	_getStateScore: function(unit, targetUnit, item) {
		var point;
		var score = 0;

		// state to be released
		var delState = OT_getCustomItemDelState(item);

		// State to be added
		var addState = OT_getCustomItemAddState(item);

		// Add State
		for( var i=0 ; i<addState.length ; i++ ) {
			var state = addState[i][0];
			// If there is something that causes the adversary to grant a good state
			if( !state.isBadState() ) {
				continue;
			}

			point = StateScoreChecker.getScore(unit, targetUnit, state);
			
			if( point > -1 ) {
				score += point;
			}
		}

		//release state
		for( var i=0 ; i<delState.length ; i++ ) {
			var state = delState[i][0];

			// If there is something to cancel the bad state of the enemy
			if( state.isBadState() ) {
				continue;
			}
			
			if(StateControl.getTurnState( targetUnit, state ) !== null ) {
				//root.log('■4');
				score += 20 + targetUnit.getLv();
			}
		}
		
		return score;
	},
	
	// Addition and release of recovery state
	// Score will not be deducted even if you cancel a state that is advantageous to an ally or give an unfavorable abnormality.
	_getStateScoreModeRecovery: function(unit, targetUnit, item) {
		var point;
		var score = 0;

		// state to be released
		var delState = OT_getCustomItemDelState(item);

		// State to be added
		var addState = OT_getCustomItemAddState(item);

		// Add State
		for( var i=0 ; i<addState.length ; i++ ) {
			var state = addState[i][0];
			
			// If there is something like giving a bad state to an ally
			if( state.isBadState() ) {
				continue;
			}

			// Do not use the item if the opponent has already been given that state
			if (StateControl.getTurnState(targetUnit, state) !== null) {
				continue;
			}
			
			point = StateScoreChecker.getScore(unit, targetUnit, state);

			if( point > -1 ) {
				//root.log('■1');
				score += point;
			}
		}

		// release state
		for( var i=0 ; i<delState.length ; i++ ) {
			var state = delState[i][0];

			// If there is something that cancels the good state of an ally
			if( !state.isBadState() ) {
				continue;
			}
			
			if(StateControl.getTurnState( targetUnit, state ) !== null ) {
				//root.log('■3');
				score += 20 + targetUnit.getLv();
			}
		}
		
		return score;
	},

	getUnitFilter: function(unit, item) {
		var unitType = unit.getUnitType();
		
		if( OT_getCustomItemRecovery(item) ) {
			return FilterControl.getNormalFilter(unitType);
		}
		
		return FilterControl.getReverseFilter(unitType);
	},

	_checkFilter: function(unit, filter) {
		var type = unit.getUnitType();
		
		if (filter & UnitFilterFlag.PLAYER) {
			if (type === UnitType.PLAYER) {
				return true;
			}
		}
		
		if (filter & UnitFilterFlag.ENEMY) {
			if (type === UnitType.ENEMY) {
				return true;
			}
		}
		
		if (filter & UnitFilterFlag.ALLY) {
			if (type === UnitType.ALLY) {
				return true;
			}
		}
		
		return false;
	}
};

// Depending on the user's faction and range attack or range recovery
// Create a filter to select which factions to target
// As an example, when the enemy army uses a range attack, the target is your own army and the allied army,
// Conversely, if the enemy army is range recovery, only the enemy army is targeted
OT_EffectRangeGetFilter = function(unit, item) {
	var unitType = unit.getUnitType();
	
	// In the case of indiscriminate type, all factions are targeted
	if( OT_getCustomItemIndifference(item) ) {
		return (UnitFilterFlag.PLAYER | UnitFilterFlag.ENEMY | UnitFilterFlag.ALLY);
	}
	
	// If the unit is in berserk state, it will be indiscriminate state regardless of setting
	if( StateControl.isBadStateOption(unit, BadStateOption.BERSERK) ) {
		return (UnitFilterFlag.PLAYER | UnitFilterFlag.ENEMY | UnitFilterFlag.ALLY);
	}
	
	// In the case of recovery type, only your own faction is targeted
	if( OT_getCustomItemRecovery(item) ) {
		return FilterControl.getNormalFilter(unitType);
	}
	
	//In the case of offensive, only hostile factions are targeted
	return FilterControl.getReverseFilter(unitType);
};

OT_EffectRangeCheckFilter = function(unit, filter) {
	var type = unit.getUnitType();
	
	if (filter & UnitFilterFlag.PLAYER) {
		if (type === UnitType.PLAYER) {
			return true;
		}
	}
	
	if (filter & UnitFilterFlag.ENEMY) {
		if (type === UnitType.ENEMY) {
			return true;
		}
	}
	
	if (filter & UnitFilterFlag.ALLY) {
		if (type === UnitType.ALLY) {
			return true;
		}
	}
	
	return false;
};

//----------------------------------------------------------
// Things that can be used in common
//----------------------------------------------------------
// Acquires the setting of whether to die from damage when using
OT_getUseDamageDeath = function(item) {
	var value = true;
	if( typeof item.custom.OT_UseDamageDeath === 'boolean' )
	{
		value = item.custom.OT_UseDamageDeath;
	}

	return value;
};

// Get the multiplier for absorbed damage
OT_getAbsorptionRate = function(item) {
	var value = 0.0;
	if( typeof item.custom.OT_AbsorptionRate === 'number' )
	{
		value = item.custom.OT_AbsorptionRate;
	}

	return value;
};

// Get the value obtained by calculating the absorption damage multiplier
OT_getAbsorptionRateValue = function(item, value) {
	var point = Math.floor(value * OT_getAbsorptionRate(item));
	
	return point;
};

// Get AI score rate
OT_getAIScoreRate = function(item) {
	var value = 1.0;
	if( typeof item.custom.OT_AIScoreRate === 'number' )
	{
		value = item.custom.OT_AIScoreRate;
	}

	return value;
};

// Get the calculated value of AI's score rate
OT_getAIScoreRateValue = function(item, value) {
	var score = Math.floor(value * OT_getAIScoreRate(item))
	
	return score;
};

// Get item type
OT_getCustomItemType = function(item) {
	var damageType = item.custom.OT_DamageType;
	
	if (typeof damageType !== 'number') {
		damageType = OT_EffectRangeItemDefault.DamageType;
	} else if(damageType >= 3) {
		damageType = DamageType.FIXED;
	}
	return damageType;
};

// Get unit's attack power
OT_getCustomItemValue = function(unit, item) {
	var reflection = OT_getCustomItemUnitReflection(item);

	var plus = 0;
	var unitTotalStatus = SupportCalculator.createTotalStatus(unit);

	if(reflection == true) {
		plus = OT_getCustomItemStatueReflection(unit, item);
		if(OT_getCustomItemCheckSupportAtk(item) == true) {
			plus += SupportCalculator.getPower(unitTotalStatus);
		}
	}
	
	return plus;
};

// Get damage multiplier
OT_getCustomItemDamageMagnification = function(item) {
	var val = item.custom.OT_DamageMagnification;
	
	if (typeof val !== 'number') {
		val = 1.0;
	}
	return val;
};

// Whether unit ability is reflected in power
OT_getCustomItemUnitReflection = function(item) {
	var value = OT_EffectRangeItemDefault.UnitReflection;
	if( typeof item.custom.OT_UnitReflection === 'boolean' ) {
		value = item.custom.OT_UnitReflection;
	}

	return value;
};

// Does the equipped weapon reflect the power?
OT_getCustomItemWeaponReflection = function(item) {
	var value = OT_EffectRangeItemDefault.WeaponReflection;
	if( typeof item.custom.OT_WeaponReflection === 'boolean' ) {
		value = item.custom.OT_WeaponReflection;
	}

	return value;
};

// Add attack power bonus by status
OT_getCustomItemStatueReflection = function(unit, item) {
	var unitTotalStatus = SupportCalculator.createTotalStatus(unit);
	var val = item.custom.OT_StatueReflection;
	var plus = 0;

	if(val == null) {
		//root.log('OT_StatueReflection not set');
		var damageType = OT_getCustomItemType(item);
		if (damageType === DamageType.PHYSICS) {
			plus = ParamBonus.getStr(unit);
		} else if (damageType === DamageType.MAGIC) {
			plus = ParamBonus.getMag(unit);
		}
	} else {
		//root.log('OT_StatueReflection set');
		for( var key in val )
		{
			if( typeof val[key] === 'number' )
			{
				var stateValue = OT_GetStatusValue(unit, key) * val[key];
				plus += stateValue;
			}
		}
	}
	
	return Math.floor(plus);
};

// Adds attack power of units and weapons to attack items
OT_getCustomItemPlus = function(unit, item) {
	var plus = 0;
	var weaponReflection = OT_getCustomItemWeaponReflection(item);
	var weapon = ItemControl.getEquippedWeapon(unit);

	// Attack power addition by unit status
	plus = OT_getCustomItemValue(unit, item);

	// Item attack power
	if(weaponReflection == true && weapon != null) {
		plus += weapon.getPow();
	}
	
	return plus;
};

// Get the final attack power of the attack item
OT_getCustomItemFinalDamage = function(unit, item) {
	// Item attack power
	var damage = OT_getCustomItemDamage(item);

	// Attack power of units and equipped weapons
	damage += OT_getCustomItemPlus(unit, item);
	
	//Returns the calculated damage multiplier
	return Math.floor(damage * OT_getCustomItemDamageMagnification(item));
};

// Calculate final damage
OT_getCalculateDamageValue = function(item, targetUnit, damage, damageType, plus) {
	var unitTotalStatus = SupportCalculator.createTotalStatus(targetUnit);
	var def = 0;
	
	if (damageType === DamageType.PHYSICS || damageType === DamageType.MAGIC) {
		if(OT_getCustomItemCheckSupportDef(item) === true) {
			def = SupportCalculator.getDefense(unitTotalStatus);
		}
	}
	//root.log("Damage value: "+damage);
	//root.log("Defense support: "+def);
	return Calculator.calculateDamageValue(targetUnit, damage, damageType, -def);
};

// Acquire animation data when using attack items
OT_getCustomItemAnimeData = function(item) {
	var anime = null;
	var animeID = OT_getCustomItemAnimeID(item);
	var runtime = OT_getCustomItemAnimeRuntime(item);
	
	if( animeID !== null )
	{
		var list = root.getBaseData().getEffectAnimationList(runtime);
		anime = list.getDataFromId(animeID);
	}
	
	return anime;
};


// Get animation ID when using attack item
OT_getCustomItemAnimeID = function(item) {
	var AnimeData = item.custom.OT_EffectAnime;
	var AnimeID = null;
	
	if(AnimeData != null)
	{
		if( typeof AnimeData[0] === 'number')
		{
			AnimeID = AnimeData[0];
		}
	}
	
	return AnimeID;
};

// Check if the animation when using attack items is runtime
OT_getCustomItemAnimeRuntime = function(item) {
	var AnimeData = item.custom.OT_EffectAnime;
	var runtime = true;
	
	if(AnimeData != null)
	{
		if( typeof AnimeData[1] === 'boolean' )
		{
			runtime = AnimeData[1];
		}
	}
	
	return runtime;
};

// Acquire animation data at the time of use damage
OT_getCustomItemUseDamageAnimeData = function(item) {
	var anime = null;
	var animeID = OT_getCustomItemUseDamageAnimeID(item);
	var runtime = OT_getCustomItemUseDamageAnimeRuntime(item);
	
	if( animeID !== null )
	{
		var list = root.getBaseData().getEffectAnimationList(runtime);
		anime = list.getDataFromId(animeID);
	}
	
	return anime;
};


// Get the ID of the animation at the time of use damage
OT_getCustomItemUseDamageAnimeID = function(item) {
	var AnimeData = item.custom.OT_UseDamageAnime;
	var AnimeID = null;
	
	if(AnimeData != null)
	{
		if( typeof AnimeData[0] === 'number')
		{
			AnimeID = AnimeData[0];
		}
	}
	
	return AnimeID;
};

// Check if the animation at the time of use damage is runtime
OT_getCustomItemUseDamageAnimeRuntime = function(item) {
	var AnimeData = item.custom.OT_UseDamageAnime;
	var runtime = true;
	
	if(AnimeData != null)
	{
		if( typeof AnimeData[1] === 'boolean' )
		{
			runtime = AnimeData[1];
		}
	}
	
	return runtime;
};

// Get animation data on hit
OT_getCustomItemHitAnimeData = function(item) {
	var anime = null;
	var animeID = OT_getCustomItemHitAnimeID(item);
	var runtime = OT_getCustomItemHitAnimeRuntime(item);
	
	if( animeID !== null )
	{
		var list = root.getBaseData().getEffectAnimationList(runtime);
		anime = list.getDataFromId(animeID);
	}
	
	return anime;
};


// Get the ID of the animation at the time of hit
OT_getCustomItemHitAnimeID = function(item) {
	var AnimeData = item.custom.IER_HitAnime;
	var AnimeID = null;
	
	if(AnimeData != null)
	{
		if( typeof AnimeData[0] === 'number')
		{
			AnimeID = AnimeData[0];
		}
	}
	
	return AnimeID;
};

// Check if the animation at the time of hit is runtime
OT_getCustomItemHitAnimeRuntime = function(item) {
	var AnimeData = item.custom.IER_HitAnime;
	var runtime = true;
	
	if(AnimeData != null)
	{
		if( typeof AnimeData[1] === 'boolean' )
		{
			runtime = AnimeData[1];
		}
	}
	
	return runtime;
};

// Get animation data at the time of miss
OT_getCustomItemMissAnimeData = function(item) {
	var anime = null;
	var animeID = OT_getCustomItemMissAnimeID(item);
	var runtime = OT_getCustomItemMissAnimeRuntime(item);
	
	if( animeID !== null )
	{
		var list = root.getBaseData().getEffectAnimationList(runtime);
		anime = list.getDataFromId(animeID);
	}
	
	return anime;
};


// Get the ID of the animation at the time of miss
OT_getCustomItemMissAnimeID = function(item) {
	var AnimeData = item.custom.IER_MissAnime;
	var AnimeID = null;
	
	if(AnimeData != null)
	{
		if( typeof AnimeData[0] === 'number')
		{
			AnimeID = AnimeData[0];
		}
	}
	
	return AnimeID;
};

// Check if the animation at the time of miss is runtime
OT_getCustomItemMissAnimeRuntime = function(item) {
	var AnimeData = item.custom.IER_MissAnime;
	var runtime = true;
	
	if(AnimeData != null)
	{
		if( typeof AnimeData[1] === 'boolean' )
		{
			runtime = AnimeData[1];
		}
	}
	
	return runtime;
};

// Get animation data when GOOD state is released
OT_getCustomItemDeleteGoodAnimeData = function(item) {
	var anime = null;
	var animeID = OT_getCustomItemDeleteGoodAnimeID(item);
	var runtime = OT_getCustomItemDeleteGoodAnimeRuntime(item);
	
	if( animeID !== null )
	{
		var list = root.getBaseData().getEffectAnimationList(runtime);
		anime = list.getDataFromId(animeID);
	}
	
	return anime;
};


// Get animation ID when GOOD state is released
OT_getCustomItemDeleteGoodAnimeID = function(item) {
	var AnimeData = item.custom.IER_DelGoodAnime;
	var AnimeID = 200;
	
	if(AnimeData != null)
	{
		if( typeof AnimeData[0] === 'number')
		{
			AnimeID = AnimeData[0];
		}
	}
	
	return AnimeID;
};

// Check if the animation when releasing the GOOD state is runtime
OT_getCustomItemDeleteGoodAnimeRuntime = function(item) {
	var AnimeData = item.custom.IER_DelGoodAnime;
	var runtime = true;
	
	if(AnimeData != null)
	{
		if( typeof AnimeData[1] === 'boolean' )
		{
			runtime = AnimeData[1];
		}
	}
	
	return runtime;
};

// Get animation data when bad state is released
OT_getCustomItemDeleteBadAnimeData = function(item) {
	var anime = null;
	var animeID = OT_getCustomItemDeleteBadAnimeID(item);
	var runtime = OT_getCustomItemDeleteBadAnimeRuntime(item);
	
	if( animeID !== null )
	{
		var list = root.getBaseData().getEffectAnimationList(runtime);
		anime = list.getDataFromId(animeID);
	}
	
	return anime;
};

// Get animation ID when BAD state is released
OT_getCustomItemDeleteBadAnimeID = function(item) {
	var AnimeData = item.custom.IER_DelBadAnime;
	var AnimeID = 101;
	
	if(AnimeData != null)
	{
		if( typeof AnimeData[0] === 'number')
		{
			AnimeID = AnimeData[0];
		}
	}
	
	return AnimeID;
};

// Check if the animation when releasing the BAD state is runtime
OT_getCustomItemDeleteBadAnimeRuntime = function(item) {
	var AnimeData = item.custom.IER_DelBadAnime;
	var runtime = true;
	
	if(AnimeData != null)
	{
		if( typeof AnimeData[1] === 'boolean' )
		{
			runtime = AnimeData[1];
		}
	}
	
	return runtime;
};

// Acquire animation data when the user's GOOD state is released
OT_getCustomItemUseDeleteGoodAnimeData = function(item) {
	var anime = null;
	var animeID = OT_getCustomItemUseDeleteGoodAnimeID(item);
	var runtime = OT_getCustomItemUseDeleteGoodAnimeRuntime(item);
	
	if( animeID !== null )
	{
		var list = root.getBaseData().getEffectAnimationList(runtime);
		anime = list.getDataFromId(animeID);
	}
	
	return anime;
};


// Get the ID of the animation when the user's GOOD state is released
OT_getCustomItemUseDeleteGoodAnimeID = function(item) {
	var AnimeData = item.custom.OT_UseDelGoodAnime;
	var AnimeID = 200;
	
	if(AnimeData != null)
	{
		if( typeof AnimeData[0] === 'number')
		{
			AnimeID = AnimeData[0];
		}
	}
	
	return AnimeID;
};

// Check if the animation when the user's GOOD state is canceled is runtime
OT_getCustomItemUseDeleteGoodAnimeRuntime = function(item) {
	var AnimeData = item.custom.OT_UseDelGoodAnime;
	var runtime = true;
	
	if(AnimeData != null)
	{
		if( typeof AnimeData[1] === 'boolean' )
		{
			runtime = AnimeData[1];
		}
	}
	
	return runtime;
};

// Acquire animation data when the user's bad state is released
OT_getCustomItemUseDeleteBadAnimeData = function(item) {
	var anime = null;
	var animeID = OT_getCustomItemUseDeleteBadAnimeID(item);
	var runtime = OT_getCustomItemUseDeleteBadAnimeRuntime(item);
	
	if( animeID !== null )
	{
		var list = root.getBaseData().getEffectAnimationList(runtime);
		anime = list.getDataFromId(animeID);
	}
	
	return anime;
};

// Get the ID of the animation when the user's BAD state is released
OT_getCustomItemUseDeleteBadAnimeID = function(item) {
	var AnimeData = item.custom.OT_UseDelBadAnime;
	var AnimeID = 101;
	
	if(AnimeData != null)
	{
		if( typeof AnimeData[0] === 'number')
		{
			AnimeID = AnimeData[0];
		}
	}
	
	return AnimeID;
};

// Check if the animation when the user's BAD state is released is runtime
OT_getCustomItemUseDeleteBadAnimeRuntime = function(item) {
	var AnimeData = item.custom.OT_UseDelBadAnime;
	var runtime = true;
	
	if(AnimeData != null)
	{
		if( typeof AnimeData[1] === 'boolean' )
		{
			runtime = AnimeData[1];
		}
	}
	
	return runtime;
};

// get starting range
OT_getCustomItemRangeMin = function(item) {
	var Range = OT_EffectRangeItemDefault.MinRange;
	var effectRangeType = OT_getCustomItemEffectRangeType(item);
	
	if( typeof item.custom.OT_MinRange === 'number' ) {
		Range = item.custom.OT_MinRange;
	}
	
	switch( effectRangeType ) {
		case OT_EffectRangeType.LINE:
		case OT_EffectRangeType.HORIZONTALLINE:
		case OT_EffectRangeType.BREATH:
			if(Range < 1) {
				Range = 1;
			}
			break;
			
		default:
			if(Range < 0) {
				Range = 0;
			}
			break;
	}

	return Range;
};

// get end range
OT_getCustomItemRangeMax = function(item) {
	//var endRange = OT_EffectRangeItemDefault.MaxRange;
	var endRange = 0;
	
	var rangeValue = item.getRangeValue();
	var rangeType = item.getRangeType();

	if (rangeType === SelectionRangeType.SELFONLY) {
		endRange = 0;
	}
	else if (rangeType === SelectionRangeType.MULTI) {
		endRange = rangeValue;
	}
	else if (rangeType === SelectionRangeType.ALL) {
		endRange = CurrentMap.getWidth() + CurrentMap.getHeight();
		
		// Pass a large number to return 0 when checking the range at a base etc.
		if(endRange == 0) {
			endRange = 20;
		}
	}

	return endRange;
};

// Get Recovery System
OT_getCustomItemRecovery = function(item) {
	var value = false;
	if( typeof item.custom.OT_Recovery === 'boolean' )
	{
		value = item.custom.OT_Recovery;
	}

	return value;
};

// Get the amount of damage after use in text format
// Returns the numeric part as an absolute value
OT_getCustomItemUseDamageText = function(item) {
	var value = '0';
	if( typeof item.custom.OT_UseDamage === 'number' ) {
		value = String(Math.abs(item.custom.OT_UseDamage));
	} else if( typeof item.custom.OT_UseDamage === 'string' ) {
		var str = item.custom.OT_UseDamage;
		var regex = /^(\-?)(.*)$/;
		if (str.match(regex)) {
			var mainasu = RegExp.$1;
			var val = RegExp.$2;
			val = val.replace(/M/g, 'Max HP');
			
			value = val;
		}
	}
	return value;
};

// Check whether the amount of damage after use is positive or negative
// Returns 0 if not set
OT_getCustomItemisUseDamageSign = function(item) {
	var value = 0;
	if( typeof item.custom.OT_UseDamage === 'number' ) {
		value = item.custom.OT_UseDamage;
	} else if( typeof item.custom.OT_UseDamage === 'string' ) {
		var str = item.custom.OT_UseDamage;
		var regex = /^(\-?)(.*)$/;
		if (str.match(regex)) {
			var mainasu = RegExp.$1;
			if( mainasu == '-' ) {
				return -1;
			} else {
				return 1;
			}
		}
	}
	
	if(value > 0) {
		return 1;
	} else if(value < 0) {
		return -1;
	} else {
		return 0;
	}
};

// Get damage amount after use
OT_getCustomItemUseDamage = function(item, unit) {
	var value = 0;
	if( typeof item.custom.OT_UseDamage === 'number' )
	{
		value = item.custom.OT_UseDamage;
	}
	else if(unit != null)
	{
		// if specified as a string
		if( typeof item.custom.OT_UseDamage === 'string' )
		{
			var str = item.custom.OT_UseDamage;
			var regex = /^(\-?)([0-9]+)\%$/;
			var regexM = /^(\-?)M([0-9]+)\%$/;
			if (str.match(regex))
			{
				var hp = unit.getHp();
				var val = parseInt(RegExp.$2);
				value = Math.floor( hp * (val / 100) );
				
				if(RegExp.$1 == '-')
				{
					value *= -1;
				}
			}
			else if (str.match(regexM))
			{
				var hp = ParamBonus.getMhp(unit);
				var val = parseInt(RegExp.$2);
				value = Math.floor( hp * (val / 100) );
				
				if(RegExp.$1 == '-')
				{
					value *= -1;
				}
			}
		}
	}

	return value;
};

// Get state that disappears after use
OT_getCustomItemUseDelState = function(item) {
	var value = [];
	var list = root.getBaseData().getStateList();

	if( typeof item.custom.OT_UseDelState === 'object' )
	{
		val = item.custom.OT_UseDelState;
		var add, k;
		
		for( key in val )
		{
			k = key;
			break;
		}

		// if specified as a string
		if( k == 'BadState' )
		{
			for( var i=0 ; i<list.getCount() ; i++ )
			{
				add = list.getDataFromId(i);
				if( add === null ) continue;
				if( add.isBadState() )
				{
					value.push( new Array( add, val[key] ) );
				}
			}
		}
		else if( k == 'GoodState' )
		{
			for( var i=0 ; i<list.getCount() ; i++ )
			{
				add = list.getDataFromId(i);
				if( add === null ) continue;
				if( add.isBadState() == false )
				{
					value.push( new Array( add, val[key] ) );
				}
			}
		}
		else if( k == 'AllState' )
		{
			for( var i=0 ; i<list.getCount() ; i++ )
			{
				add = list.getDataFromId(i);
				if( add === null ) continue;
				value.push( new Array( add, val[key] ) );
			}
		}
		else
		{
			try {
				for( key in val )
				{
					add = list.getDataFromId(key);
					if( add != null ) value.push( new Array( add, val[key] ) );
				}
			} catch(e) {
				root.msg('[Range Attack] Release state specification is invalid. \nItem ID:' + item.getId());
				root.endGame();
			}
		}
	}

	return value;
};

// Get the state attached after use
OT_getCustomItemUseAddState = function(item) {
	var value = [];
	var list = root.getBaseData().getStateList();

	if( typeof item.custom.OT_UseAddState === 'object' )
	{
		val = item.custom.OT_UseAddState;
		var add, k;
		
		for( key in val )
		{
			if(key == 'BadState' || key == 'GoodState' || key == 'AllState') {
				root.msg('[Range Attack] The specification of OT_UseAddState is invalid. \nOT_UseAddState cannot be AllState, BadState or GoodState. \nItem ID:' + item.getId());
				root.endGame();
			}
			
			add = list.getDataFromId(key);
			if( add != null )
			{
				value.push( new Array( add, val[key] ) );
				//root.log(add.getName());
				//root.log(val[key]);
			}
		}
	}

	return value;
};

// Add states to units (currently unused)
OT_setCustomItemAddState = function(unit, targetUnit, addState) {
	var value = null;

	// Add State
	for( var j=0 ; j<addState.length ; j++)
	{
		if( Probability.getProbability( addState[j][1] ) && StateControl.getTurnState( targetUnit, addState[j][0] ) === null )
		{
			// Check resistance state
			if (StateControl.isStateBlocked(targetUnit, unit, addState[j][0])) {
				// The state is an invalid target, so it does not activate
				continue;
			}
				
			StateControl.arrangeState(targetUnit, addState[j][0], IncreaseType.INCREASE);
			if( addState[j][0].isBadState() )
			{
				value = value | 0x02;
			}
			else
			{
				value = value | 0x01;
			}
		}
	}
	
	//root.log(value);
	return value;
};

// Release the state of the unit
OT_setCustomItemDelState = function(unit, delState) {
	var value = null;

	// release state
	for( var j=0 ; j<delState.length ; j++)
	{
		if( Probability.getProbability( delState[j][1] ) && StateControl.getTurnState( unit, delState[j][0] ) !== null )
		{
			StateControl.arrangeState(unit, delState[j][0], IncreaseType.DECREASE);
			if( delState[j][0].isBadState() )
			{
				value = value | 0x01;
			}
			else
			{
				value = value | 0x02;
			}
		}
	}
	
	//root.log(value);
	return value;
};

// Does it contain good status
OT_getCustomItemisGoodState = function(array) {
	for( var i=0 ; i<array.length ; i++)
	{
		if( !array[i][0].isBadState() )
		{
			return true;
		}
	}
	
	return false;
};

// Does it contain bad status
OT_getCustomItemisBadState = function(array) {
	for( var i=0 ; i<array.length ; i++)
	{
		if( array[i][0].isBadState() )
		{
			return true;
		}
	}
	
	return false;
};

// Get total count when playing animation
OT_getCustomItemAnimeFrameCounter = function(anime) {
	
	var id = anime.getMotionIdFromIndex(0);
	var frame = anime.getFrameCount(id);
	var count = 0;

	for( var i=0 ; i<frame ; i++)
	{
		count += anime.getFrameCounterValue(id, i);
	}

	//root.log(id + ':' + frame + ':' + count);
	
	return count;
};

// Get status
OT_GetStatusValue = function(unit, type) {
	var value = 0;
	
	// Make sure the parameters are declared
	if(!OT_isDefineParam(type))
	{
		return 0;
	}
	
	switch(type)
	{
		case OT_DefineStatus.LV:
			value = unit.getLv();
			break;

		case OT_DefineStatus.HP:
			value = unit.getHp();
			break;

		case OT_DefineStatus.EP:
			value = OT_GetNowEP(unit);
			break;

		case OT_DefineStatus.FP:
			value = OT_GetNowFP(unit);
			break;

		default:
			value = ParamBonus.getBonus(unit, ParamType[type]);
			break;
	}
	//root.log(value);
	return value;
};

OT_isDefineParam = function(type) {
	// Levels are defined by script constants
	switch(type)
	{
		case OT_DefineStatus.LV:
			return true;
	}

	// Parameters with separate current and maximum values
	for( var key in OT_NowStatusMapping )
	{
		if( type == OT_NowStatusMapping[key] )
		{
			if(typeof UnitParameter[key] == 'undefined')
			{
				//root.log(type + 'is an undeclared parameter.');
				return false;
			}
			return true;
		}
	}

	// parameter not declared
	if(typeof UnitParameter[type] == 'undefined')
	{
		//root.log(type + 'is an undeclared parameter.');
		return false;
	}
	
	return true;
};

OT_getParamName = function( type ) {
	// Parameter definition check
	if( !OT_isDefineParam(type) )
	{
		return '';
	}

	// Returns a constant since the level is defined in a script constant
	switch(type)
	{
		case OT_DefineStatus.LV:
			return StringTable.Status_Level;
	}

	// Parameters with separate current and maximum values
	for( var key in OT_NowStatusMapping )
	{
		if( type == key )
		{
			return '最大' + UnitParameter[key].getParameterName();
		}
		
		if( type == OT_NowStatusMapping[key] )
		{
			return UnitParameter[key].getParameterName();
		}
	}
	
	return UnitParameter[type].getParameterName();
};

//----------------------------------------------------------
// for ranged attacks
//----------------------------------------------------------
// Get whether it is non-damage type
OT_getNoDamegeAttack = function(item) {
	var type = OT_getCustomItemType(item);
	var value = OT_getCustomItemDamage(item);
	
	if( type == DamageType.FIXED && value == 0 && OT_getCustomItemWeaponReflection(item) != true )
	{
		return true;
	}
	return false;
};

// Get item's attack power
OT_getCustomItemDamage = function(item) {
	var damage = 0;

	if ( typeof item.custom.IER_Value === 'number' )
	{
		damage = item.custom.IER_Value;
	}

	return damage;
};

// Indiscriminately attacks or acquires characters within range
OT_getCustomItemIndifference = function(item) {
	var indifference = OT_EffectRangeItemDefault.Indifference;
	
	if( item.custom.IER_Indifference != null )
	{
		indifference = item.custom.IER_Indifference;
	}
	
	return indifference;
};

// get area of effect
OT_getCustomItemEffectRange = function(item) {
	var startRange = 0;
	var endRange = 1;
	var Range = {};

	var str = item.custom.IER_EffectRange;
	if( typeof str != 'string' ) {
		str = OT_EffectRangeItemDefault.EffectRange;
	} 

	//root.log(str);
	var regex = /^([0-9]+)\-([0-9]+)$/;
	if (str.match(regex))
	{
		startRange = parseInt(RegExp.$1);
		endRange = parseInt(RegExp.$2);
		
		Range[0] = startRange;
		Range[1] = endRange;
		
		return Range;
	}
	
	return null;
};

// Get minimum effect range
OT_getCustomItemEffectRangeMin = function(item) {
	var Range = 0;
	var RangeData = OT_getCustomItemEffectRange(item);
	
	if( RangeData != null )
	{
		Range = RangeData[0];
	}

	return Range;
};

// Get maximum effect range
OT_getCustomItemEffectRangeMax = function(item) {
	var Range = 0;
	var RangeData = OT_getCustomItemEffectRange(item);
	
	if( RangeData != null )
	{
		Range = RangeData[1];
	}

	return Range;
};

// Acquire the multiplier of the acquired experience value when hitting the opponent
OT_getCustomItemEXPMagnification = function(item) {
	var Magnification = OT_EffectRangeItemDefault.EXPMagnification;

	if ( typeof item.custom.IER_EXPMagnification === 'number' )
	{
		Magnification = item.custom.IER_EXPMagnification;
	}

	return Magnification;
};

// Acquired experience points when used
OT_getCustomItemGetEXP = function(item) {
	var value = OT_EffectRangeItemDefault.GetEXP;

	if ( typeof item.custom.IER_GetEXP === 'number' )
	{
		value = item.custom.IER_GetEXP;
	}

	return value;
};

// Get range type OT_getCustomItemRangeMax
// Force cross if range type is breath
// Also force whole if the range type is whole
OT_getCustomItemRangeType = function(item) {
	var effectRange = OT_getCustomItemEffectRangeType(item);
	if(effectRange == OT_EffectRangeType.BREATH) {
		return OT_EffectRangeType.CROSS; 
	} else if(effectRange == OT_EffectRangeType.ALL) {
		return OT_EffectRangeType.ALL;
	}

	var value = OT_EffectRangeItemDefault.RangeType;
	if ( typeof item.custom.IER_RangeType === 'number' ) {
		value = item.custom.IER_RangeType;
	}

	//var itemRangeType = item.getRangeType();
	//if (itemRangeType === SelectionRangeType.ALL && value == OT_EffectRangeType.NORMAL) {
	//	return OT_EffectRangeType.ALL;
	//}

	return value;
};

// Get range type
OT_getCustomItemEffectRangeType = function(item) {
	var value = OT_EffectRangeItemDefault.EffectRangeType;

	if ( typeof item.custom.IER_EffectRangeType === 'number' )
	{
		value = item.custom.IER_EffectRangeType;
	}

	return value;
};


// Acquisition of the adjustment value of how the range spreads
OT_getCustomItemRangeSpread = function(item) {
	var value = 1;

	if ( typeof item.custom.IER_RangeSpread === 'number' )
	{
		value = item.custom.IER_RangeSpread;
	}

	if( value < 1 ) value = 1;

	return value;
};

// Get the adjustment value of how the range spreads
OT_getCustomItemEffectSpread = function(item) {
	var value = 1;

	if ( typeof item.custom.IER_EffectSpread === 'number' )
	{
		value = item.custom.IER_EffectSpread;
	}

	if( value < 1 ) value = 1;

	return value;
};

// Get the disappearing state of the hit target
OT_getCustomItemDelState = function(item) {
	var value = [];
	var list = root.getBaseData().getStateList();

	if( typeof item.custom.IER_DelState === 'object' )
	{
		val = item.custom.IER_DelState;
		var add, k;
		
		for( key in val )
		{
			k = key;
			break;
		}

		// if specified as a string
		if( k == 'BadState' )
		{
			for( var i=0 ; i<list.getCount() ; i++ )
			{
				add = list.getDataFromId(i);
				if( add === null ) continue;
				
				if( add.isBadState() )
				{
					value.push( new Array( add, val[key] ) );
				}
			}
		}
		else if( k == 'GoodState' )
		{
			for( var i=0 ; i<list.getCount() ; i++ )
			{
				add = list.getDataFromId(i);
				if( add === null ) continue;
				
				if( add.isBadState() == false )
				{
					value.push( new Array( add, val[key] ) );
				}
			}
		}
		else if( k == 'AllState' )
		{
			for( var i=0 ; i<list.getCount() ; i++ )
			{
				add = list.getDataFromId(i);
				if( add === null ) continue;
				value.push( new Array( add, val[key] ) );
			}
		}
		else
		{
			try {
				for( key in val )
				{
					add = list.getDataFromId(key);
					if( add != null ) value.push( new Array( add, val[key] ) );
				}
			} catch(e) {
				root.msg('[Range Attack] Release state specification is invalid. \nItem ID:' + item.getId());
				root.endGame();
			}
		}
	}

	return value;
};

// Check if all release types are included
OT_getCustomItemDelStateAllType = function(obj) {
	var value = [];
	var list = root.getBaseData().getStateList();

	if( typeof obj === 'object' )
	{
		val = obj;
		var add, k;
		
		for( key in val )
		{
			k = key;
			break;
		}

		// if specified as a string
		if( k == 'BadState' || k == 'GoodState' || k == 'AllState') {
			if( value.indexOf(k) == -1) {
				value[k] = val[k];
			}
		}
	}
	
	if(typeof value['AllState'] != 'undefined') {
		value['BadState']  = value['AllState'];
		value['GoodState'] = value['AllState'];
	}

	return value;
};

// Check if all release types are included
OT_getCustomItemDelAllState = function(item) {
	var value = [];

	if( typeof item.custom.IER_DelState === 'object' ) {
		value = OT_getCustomItemDelStateAllType(item.custom.IER_DelState);
	}

	return value;
};

// Check if all unlock types are included in the state that disappears after use
OT_getCustomItemUseDelAllState = function(item) {
	var value = [];
	var list = root.getBaseData().getStateList();

	if( typeof item.custom.OT_UseDelState === 'object' ) {
		value = OT_getCustomItemDelStateAllType(item.custom.OT_UseDelState);
	}

	return value;
};

// Get the state given to the hit target
OT_getCustomItemAddState = function(item) {
	var value = [];
	var list = root.getBaseData().getStateList();

	if( typeof item.custom.IER_AddState === 'object' )
	{
		val = item.custom.IER_AddState;
		var add, k;
		
		for( key in val )
		{
			if(key == 'BadState' || key == 'GoodState' || key == 'AllState') {
				root.msg('[Area Attack]IER_AddState is invalid.\IAll state, bad state, and good state cannot be specified for IER_AddState.\nItem ID:' + item.getId());
				root.endGame();
			}
			add = list.getDataFromId(key);
			if( add != null )
			{
				value.push( new Array( add, val[key] ) );
				//root.log(add.getName());
				//root.log(val[key]);
			}
		}
	}

	return value;
};

// Get Unit Orientation
OT_getUnitDirection = function(x, y, px, py) {
	var value = 0;
	
	// get relative position
	var pointX = px - x;
	var pointY = py - y;
	
	// Returns -1 if relative coordinates are 0,0
	if( pointX == 0 && pointY == 0 ) return -1;

	// If it is exactly diagonal, the absolute values ​​will be equal
	if( Math.abs(pointX) == Math.abs(pointY) )
	{
		if( pointX < 0 )
		{
			if( pointY < 0 )
			{
				// upper left
				return OT_SLANTING + 0;
			}
			else if( pointY > 0 )
			{
				// lower left
				return OT_SLANTING + 3;
			}
		}
		else if( pointX > 0 )
		{
			if( pointY < 0 )
			{
				// top right
				return OT_SLANTING + 1;
			}
			else if( pointY > 0 )
			{
				// lower right
				return OT_SLANTING + 2;
			}
		}
	}
	else if(Math.abs(pointX) > Math.abs(pointY))
	{
		if( pointX < 0 )
		{
			return DirectionType.LEFT;
		}
		else
		{
			return DirectionType.RIGHT;
		}
	}
	else if(Math.abs(pointX) < Math.abs(pointY))
	{
		if( pointY < 0 )
		{
			return DirectionType.TOP;
		}
		else
		{
			return DirectionType.BOTTOM;
		}
	}
	
	return -1;
};

//Convert diagonal identification numbers to 4-7
//processing for array storage
OT_getUnitDirectionIndex = function(direction) {
	
	if(direction >= OT_SLANTING) {
		direction = direction - OT_SLANTING + 4;
	}
	
	return direction;
};

// Reverse the direction of the oblique identification numbers converted to 4 to 7
// 
OT_getUnitDirectionIndexReverse = function(direction) {

	switch( direction ) {
		case DirectionType.LEFT:
			direction = DirectionType.RIGHT;
			break;
			
		case DirectionType.RIGHT:
			direction = DirectionType.LEFT;
			break;
			
		case DirectionType.TOP:
			direction = DirectionType.BOTTOM;
			break;
			
		case DirectionType.BOTTOM:
			direction = DirectionType.TOP;
			break;
			
		// upper left
		case 4:
			direction = 6;
			break;
			
		// top right
		case 5:
			direction = 7;
			break;
			
		// lower right
		case 6:
			direction = 4;
			break;
			
		// lower left
		case 7:
			direction = 5;
			break;
	}
	
	return direction;
};

// Does the hit rate fluctuate with the unit's evasion rate?
OT_getCustomItemHitAvoid = function(item) {
	var value = OT_EffectRangeItemDefault.HitAvoid;
	if(OT_getCustomItemRecovery(item)) {
		value = OT_EffectRangeItemDefault.RecoveryHitAvoid;
	}
	
	if( typeof item.custom.IER_HitAvoid === 'boolean' )
	{
		value = item.custom.IER_HitAvoid;
	}

	return value;
};

// get accuracy
OT_getCustomItemHitValue = function(item) {
	var value = OT_EffectRangeItemDefault.HitValue;
	if(OT_getCustomItemRecovery(item)) {
		value = OT_EffectRangeItemDefault.RecoveryHitValue;
	}
	
	if( typeof item.custom.IER_HitValue === 'number' ) {
		value = item.custom.IER_HitValue;
	}

	return value;
};

// Check if the hit rate is unit dependent
OT_getCustomItemHITReflectionUnit = function(item) {
	var value = item.custom.IER_HitReflectionUnit;
	
	// If you have not set the new version of Kaspara, use the old version of Kaspara.
	if(typeof value != 'boolean') {
		var Data = item.custom.IER_HitReflection;
		value = OT_EffectRangeItemDefault.HitReflectionUnit;
		
		if(Data != null) {
			if( typeof Data[0] === 'boolean' ) {
				value = Data[0];
			} 
		}
	}
	
	return value;
};

// Check if the hit rate depends on the weapon
OT_getCustomItemHITReflectionWeapon = function(item) {
	var value = item.custom.IER_HitReflectionWeapon;
	
	// If you have not set the new version of Kaspara, use the old version of Kaspara.
	if(typeof value != 'boolean') {
		var Data = item.custom.IER_HitReflection;
		value = OT_EffectRangeItemDefault.HitReflectionWeapon;
		
		if(Data != null) {
			if( typeof Data[1] === 'boolean' ) {
				value = Data[1];
			}
		}
	}
	
	return value;
};

// Is it mandatory?
OT_getCustomItemHitMark = function(item) {
	var value = false;
	if( typeof item.custom.IER_HitMark === 'boolean' )
	{
		value = item.custom.IER_HitMark;
	}
	
	return value;
};

// Get Actual Accuracy
OT_getCustomItemHitPercent = function(unit, targetUnit, item) {
	// Always return 100 if there is a mandatory setting
	if(OT_getCustomItemHitMark(item)) {
		//root.log("is set with");
		return DefineControl.getMaxHitPercent();
	}
	
	var hit, avoid, percent;
	var unitTotalStatus = SupportCalculator.createTotalStatus(unit);
	var targetUnitTotalStatus = SupportCalculator.createTotalStatus(targetUnit);
	var weapon = ItemControl.getEquippedWeapon(unit);
	
	hit = OT_getCustomItemHitValue(item);
	avoid = 0;
	
	// If the hit rate of the user is reflected, it is added to the hit rate
	if( OT_getCustomItemHITReflectionUnit(item) ) {
		hit += (RealBonus.getSki(unit) * 3);
		if( OT_getCustomItemCheckSupportHit(item) == true ) {
			hit += SupportCalculator.getHit(unitTotalStatus);
		}
	}

	// If the hit rate of the weapon is reflected, add it
	if( OT_getCustomItemHITReflectionWeapon(item) && weapon != null ) {
		hit += weapon.getHit();
	}

	// Add if the opponent's avoidance value is reflected
	if( OT_getCustomItemHitAvoid(item) ) {
		avoid = AbilityCalculator.getAvoid(targetUnit);
		if( OT_getCustomItemCheckSupportAgi(item) === true ) {
			avoid += SupportCalculator.getAvoid(targetUnitTotalStatus);
		}
	}

	// Calculate hit rate
	percent = hit - avoid;
	
	//root.log("Hit Support: "+SupportCalculator.getHit(unitTotalStatus));
	//root.log("Evasion support: "+SupportCalculator.getAvoid(targetUnitTotalStatus));
	//root.log("Hit rate: "+hit);
	//root.log("Avoidance rate: "+avoid);

	
	//root.log('hit rate:'+percent);
	
	return HitCalculator.validValue(unit, targetUnit, weapon, percent);
};

// determine if hit
OT_getCustomItemHitCheck = function(unit, targetUnit, item) {
	return Probability.getProbability( OT_getCustomItemHitPercent(unit, targetUnit, item) );
};


// Determines whether the attack correction by the support effect is reflected
OT_getCustomItemCheckSupportAtk = function(item) {
	var value = OT_EffectRangeItemDefault.SupportAtk;
	if( typeof item.custom.IER_SupportAtk === 'boolean' ) {
		value = item.custom.IER_SupportAtk;
	}
	return value;
};

// Determines whether the hit correction by the support effect is reflected
OT_getCustomItemCheckSupportHit = function(item) {
	var value = OT_EffectRangeItemDefault.SupportHit;
	if( typeof item.custom.IER_SupportHit === 'boolean' ) {
		value = item.custom.IER_SupportHit;
	}
	return value;
};

// Determines whether the defense correction by the support effect is reflected
OT_getCustomItemCheckSupportDef = function(item) {
	var value = OT_EffectRangeItemDefault.SupportDef;
	if( typeof item.custom.IER_SupportDef === 'boolean' ) {
		value = item.custom.IER_SupportDef;
	}
	return value;
};

// Determines whether the avoidance correction by the support effect is reflected
OT_getCustomItemCheckSupportAgi = function(item) {
	var value = OT_EffectRangeItemDefault.SupportAgi;
	if( typeof item.custom.IER_SupportAgi === 'boolean' ) {
		value = item.custom.IER_SupportAgi;
	}
	return value;
};

// Change map chips within area of ​​effect
OT_isCustomItemMapChipChange = function(chip, terrain) {
	var value = false;
	var data = terrain.custom.IER_MapChipChangeGroup;
	
	if( chip[0] == 'ALL' ) return true;
	
	if( typeof data === 'object' )
	{
		for( var i=0 ; i<data.length ; i++ )
		{
			if( chip[0] == data[i] )
			{
				return true;
			}
		}
	}

	return false;
};

// Map chip data after change within the area of ​​effect
OT_getCustomItemMapChipChangeDate = function(item) {
	var value = null;
	var data = item.custom.IER_MapChipChangeAfter;
	if( typeof data === 'object' )
	{
		value = data;
	}

	return value;
};

// Whether the specific coordinates are within the estimated range
OT_getPointinGuessRange = function(x, y, px, py, startRange, endRange) {
	
	var ax = Math.abs( x - px );
	var ay = Math.abs( y - py );
	
	if( startRange <= ax && ax <= endRange )
	{
		if( startRange <= ay && ay <= endRange )
		{
			//root.log(ax+ ':' +ay);
			return true;
		}
	}


	return false;
};

// Set coordinates for range attack
OT_getMapAnimationIERPos = function(x, y) {
	x -= 80;
	y -= 160;
	
	return createPos(x, y);
};


// Confirmation of duplication of sound effects
OT_getCustomItemSoundDuplicate = function(item) {
	var value = OT_EffectRangeItemDefault.SoundDuplicate;
	if( typeof item.custom.IER_SoundDuplicate === 'boolean' ) {
		value = item.custom.IER_SoundDuplicate;
	}
	return value;
};

//----------------------------------------------------------
// Indexing for area of ​​effect
//----------------------------------------------------------
OT_getRangeIndexNormalize = function(x, y, arrayTmp) {
	var array = [];
	var tmpX, tmpY;
	
	arrayTmp = unique(arrayTmp);
	//root.log('start:');
	for( var i=0 ; i<arrayTmp.length ; i++ ) {
		//root.log('x:'+arrayTmp[i][0]+ ' y:'+arrayTmp[i][1]);
		
		tmpX = arrayTmp[i][0];
		tmpY = arrayTmp[i][1];
		index = CurrentMap.getIndex(x+tmpX, y+tmpY);
		if(index != -1) {
			array.push(index);
		}
	}
	//root.log('end:');
	return array;
};


// usual type
// Only this type is basically used for indexing explanatory windows
OT_getNormalIndexArray = function(x, y, startRange, endRange, isGetIndexData) {
	var array = [];
	var index = -1;
	var indexX = 0;
	var indexY = 0;

	if( typeof isGetIndexData === 'undefined' ) {
		isGetIndexData = false;
	}
	
	array = OT_NormalIndexSearch._SearchStart(x, y, startRange, endRange);
	
	if(isGetIndexData) {
		return unique(array);
	} else {
		return OT_getRangeIndexNormalize(x, y, array);
	}
};

// Array creation with normal range
var OT_NormalIndexSearch = {
	_tmpRangeArray:null,
	_resultArray:null,
	_baseX:0,
	_baseY:0,
	
	_SearchStart: function(x, y, startRange, endRange) {
		this._tmpRangeArray = [];
		this._resultArray = [];
		
		this._baseX = x;
		this._baseY = y;
		
		if(startRange == 0) {
			this._tmpRangeArray[0] = [];
			this._tmpRangeArray[0][0] = endRange;
			this._resultArray.push([0, 0]);
		}
		
		this._Search4(x, y, startRange, endRange);
		
		return this._resultArray;
	},

	_Search4: function(x, y, startRange, endRange) {
		// up direction
		this._Search(x, y-1, startRange, endRange);
		// down direction
		this._Search(x, y+1, startRange, endRange);
		// left direction
		this._Search(x-1, y, startRange, endRange);
		// right direction
		this._Search(x+1, y, startRange, endRange);
	},

	_Search: function(x, y, startRange, m) {
		var point = Math.abs(this._baseX - x) + Math.abs(this._baseY - y);
		
		if(typeof this._tmpRangeArray[x] == 'undefined') {
			this._tmpRangeArray[x] = [];
		}
		if(typeof this._tmpRangeArray[x][y] == 'undefined') {
			this._tmpRangeArray[x][y] = -100;
		} else {
			if((m-1) <= this._tmpRangeArray[x][y]) {
				return;
			}
		}

		m = m - 1;
		if(m >= 0) {
			this._tmpRangeArray[x][y] = m;
			if(startRange <= point) {
				this._resultArray.push([x, y]);
			}
			
			// Recursively call search4 because there is a movement amount
			this._Search4(x, y, startRange, m);
		} 
		//this._tmpRangeArray[x][y] = m;
		//array.push([indexX, indexY]);
	}
};


///// Look in 4 directions
//var OT_NormalIndexSearch4 {
//	if(0<x && x<_xLength && 0<y && y<_zLength) {
//		// up direction
//		OT_NormalIndexSearch(x, y-1, m);
//		// down direction
//		OT_NormalIndexSearch(x, y+1, m);
//		// left direction
//		OT_NormalIndexSearch(x-1, y, m);
//		// right direction
//		OT_NormalIndexSearch(x+1, y, m);
//	}
//};
//
//OT_NormalIndexSearch = function(int x, int z, int m) {
//	// Check if the cell in the search direction is within the map area
//	if(x<0 || _xLength <= x) return;
//	if(z<0 || _zLength <= z) return;
//
//	// Check if the cell has already been calculated
//	if((m-1) <= _resultMoveRangeList[z][x]) return;
//
//	m = m + _originalMapList[z][x];
//
//	if(m>0)
//	{
//		// Substitute the current movement power to the advanced position
//		_resultMoveRangeList[z][x] = m;
//		// Recursively call search4 because there is a movement amount
//		Search4(x,z,m);
//	} 
//	else
//	{
//		m = 0;
//	}
//}

//cross
OT_getCrossIndexArray = function(x, y, startRange, endRange, spread, isGetIndexData) {
	var array = [];

	if( typeof isGetIndexData === 'undefined' ) {
		isGetIndexData = false;
	}

	//root.log('CrossStart:');
	for( var i=0 ; i<4 ; i++ )
	{
		Array.prototype.push.apply( array, OT_getLineIndexArray(x, y, startRange, endRange, i, spread, true) );
	}
	//root.log('CrossEnd:');

	if(isGetIndexData) {
		return unique(array);
	} else {
		return OT_getRangeIndexNormalize(x, y, array);
	}
//	return unique(array);
};

//a straight line
OT_getLineIndexArray = function(x, y, startRange, endRange, direction, spread, isGetIndexData) {
	var array = [];
	var index = -1;
	var indexX = 0;
	var indexY = 0;

	if( typeof isGetIndexData === 'undefined' ) {
		isGetIndexData = false;
	}
	
	//root.log('LineStart:');
	for( var j=0 ; j<spread ; j++ )
	{
		for( var i=startRange ; i<=endRange ; i++ )
		{
			switch(direction) {
				case DirectionType.LEFT:
					indexX = -i;
					indexY = -j;
					break;
	
				case DirectionType.TOP:
					indexX = -j;
					indexY = -i;
					break;
	
				case DirectionType.RIGHT:
					indexX = i;
					indexY = -j;
					break;
	
				case DirectionType.BOTTOM:
					indexX = -j;
					indexY = i;
					break;
			}
			array.push([indexX, indexY]);
			//root.log('x:'+ indexX + ' y:' + indexY);

			switch(direction) {
				case DirectionType.LEFT:
					indexX = -i;
					indexY = j;
					break;normalize
	
				case DirectionType.TOP:
					indexX = j;
					indexY = -i;
					break;
	
				case DirectionType.RIGHT:
					indexX = i;
					indexY = j;
					break;
	
				case DirectionType.BOTTOM:
					indexX = j;
					indexY = i;
					break;
			}
			array.push([indexX, indexY]);
			//root.log('x:'+ indexX + ' y:' + indexY);
		}
	}
	//root.log('LineEnd:');
	
	if(isGetIndexData) {
		return unique(array);
	} else {
		return OT_getRangeIndexNormalize(x, y, array);
	}
};

//× type
OT_getXCrossIndexArray = function(x, y, startRange, endRange, spread, isGetIndexData) {
	var array = [];
	if( typeof isGetIndexData === 'undefined' ) {
		isGetIndexData = false;
	}

	for( var i=0 ; i<4 ; i++ )
	{
		Array.prototype.push.apply( array, OT_getDiagonalIndexArray(x, y, startRange, endRange, i, spread, true) );
	}
	
	if(isGetIndexData) {
		return array;
	} else {
		return OT_getRangeIndexNormalize(x, y, array);
	}
};

//diagonal line
OT_getDiagonalIndexArray = function(x, y, startRange, endRange, direction, spread, isGetIndexData) {
	var array = [];
	var indexX = 0;
	var indexY = 0;
	
	if( typeof isGetIndexData === 'undefined' ) {
		isGetIndexData = false;
	}
	for( var j=0 ; j<spread ; j++ )
	{
		var point1 = Math.floor( (1+j) / 2 );
		var point2 = Math.floor( (j) / 2 );
		for( var i=startRange ; i<=endRange ; i++ )
		{
			switch(direction) {
				//upper left
				case DirectionType.LEFT:
					indexX = -i-point2;
					indexY = -i+point1;
					break;
	
				//top right
				case DirectionType.TOP:
					indexX = i-point1;
					indexY = -i-point2;
					break;
	
				//lower right
				case DirectionType.RIGHT:
					indexX = i+point2;
					indexY = i-point1;
					break;
	
				//lower left
				case DirectionType.BOTTOM:
					indexX = -i-point1;
					indexY = i+point2;
					break;
			}
			array.push([indexX, indexY]);

			switch(direction) {
				//upper left
				case DirectionType.LEFT:
					indexX = -i+point1;
					indexY = -i-point2;
					break;
	
				//top right
				case DirectionType.TOP:
					indexX = i+point2;
					indexY = -i+point1;
					break;
	
				//lower right
				case DirectionType.RIGHT:
					indexX = i-point1;
					indexY = i+point2;
					break;
	
				//lower left
				case DirectionType.BOTTOM:
					indexX = -i-point2;
					indexY = i-point1;
					break;
			}
			
			array.push([indexX, indexY]);
		}
	}
	
	if(isGetIndexData) {
		return unique(array);
	} else {
		return OT_getRangeIndexNormalize(x, y, array);
	}
};

//＋× type
OT_getDoubleCrossIndexArray = function(x, y, startRange, endRange, spread, isGetIndexData) {
	var array = [];
	if( typeof isGetIndexData === 'undefined' ) {
		isGetIndexData = false;
	}

	for( var i=0 ; i<4 ; i++ )
	{
		Array.prototype.push.apply( array, OT_getLineIndexArray(x, y, startRange, endRange, i, spread, true) );
		Array.prototype.push.apply( array, OT_getDiagonalIndexArray(x, y, startRange, endRange, i, spread, true) );
	}
	
	if(isGetIndexData) {
		return unique(array);
	} else {
		return OT_getRangeIndexNormalize(x, y, array);
	}
};

//Breath type
OT_getBreathIndexArray = function(x, y, startRange, endRange, direction, spread, isGetIndexData) {
	var array = [];
	var index = -1;
	if( typeof isGetIndexData === 'undefined' ) {
		isGetIndexData = false;
	}
	
	//root.log('BreathStart:');
	for( var i=startRange ; i<=endRange ; i++ )
	{
		var point = Math.floor( (i + spread - 1) / spread );

		switch(direction) {
			case DirectionType.LEFT:
				Array.prototype.push.apply( array, OT_getBreathLineIndexArray(x, y, -i, 0, 0, point, direction, 1, true) );
				break;

			case DirectionType.TOP:
				Array.prototype.push.apply( array, OT_getBreathLineIndexArray(x, y, 0, -i, 0, point, direction, 1, true) );
				break;

			case DirectionType.RIGHT:
				Array.prototype.push.apply( array, OT_getBreathLineIndexArray(x, y, i, 0, 0, point, direction, 1, true) );
				break;

			case DirectionType.BOTTOM:
				Array.prototype.push.apply( array, OT_getBreathLineIndexArray(x, y, 0, i, 0, point, direction, 1, true) );
				break;
		}
		
	}
	
	if(isGetIndexData) {
		return unique(array);
	} else {
		return OT_getRangeIndexNormalize(x, y, array);
	}
};

//Breath type (diagonal)
//OT_getDiagonalBreathIndexArray = function(x, y, startRange, endRange, direction, spread) {
//	var array = [];
//	var index = -1;
//	
//	for( var i=startRange ; i<=endRange ; i++ )
//	{
//
//		switch(direction) {
//			case DirectionType.LEFT:
//				Array.prototype.push.apply( array, OT_getLineIndexArray(x-i, y-i, 0, endRange-i*2, DirectionType.LEFT, 1 ) );
//				Array.prototype.push.apply( array, OT_getLineIndexArray(x-i, y-i, 0, endRange-i*2, DirectionType.TOP , 1 ) );
//				break;
//
//			case DirectionType.TOP:
//				Array.prototype.push.apply( array, OT_getLineIndexArray(x+i, y-i, 0, endRange-i*2, DirectionType.RIGHT, 1 ) );
//				Array.prototype.push.apply( array, OT_getLineIndexArray(x+i, y-i, 0, endRange-i*2, DirectionType.TOP  , 1 ) );
//				break;
//
//			case DirectionType.RIGHT:
//				Array.prototype.push.apply( array, OT_getLineIndexArray(x+i, y+i, 0, endRange-i*2, DirectionType.RIGHT  , 1 ) );
//				Array.prototype.push.apply( array, OT_getLineIndexArray(x+i, y+i, 0, endRange-i*2, DirectionType.BOTTOM , 1 ) );
//				break;
//
//			case DirectionType.BOTTOM:
//				Array.prototype.push.apply( array, OT_getLineIndexArray(x-i, y+i, 0, endRange-i*2, DirectionType.LEFT   , 1 ) );
//				Array.prototype.push.apply( array, OT_getLineIndexArray(x-i, y+i, 0, endRange-i*2, DirectionType.BOTTOM , 1 ) );
//				break;
//		}
//		
//	}
//	
//	return unique(array);
//};

//Breath (for omnidirectional search)
OT_getAllBreathIndexArray = function(x, y, startRange, endRange, spread, isGetIndexData) {
	var array = [];
	if( typeof isGetIndexData === 'undefined' ) {
		isGetIndexData = false;
	}

	Array.prototype.push.apply( array, OT_getBreathIndexArray( x, y, startRange, endRange, 0, spread, true ) );
	Array.prototype.push.apply( array, OT_getBreathIndexArray( x, y, startRange, endRange, 1, spread, true ) );
	Array.prototype.push.apply( array, OT_getBreathIndexArray( x, y, startRange, endRange, 2, spread, true ) );
	Array.prototype.push.apply( array, OT_getBreathIndexArray( x, y, startRange, endRange, 3, spread, true ) );
	
	if(isGetIndexData) {
		return array;
	} else {
		return OT_getRangeIndexNormalize(x, y, array);
	}
};

//horizontal letter
OT_getHorizontalLineIndexArray = function(x, y, startRange, endRange, direction, spread, isGetIndexData) {
	var array = [];
	var indexX = 0;
	var indexY = 0;
	if( typeof isGetIndexData === 'undefined' ) {
		isGetIndexData = false;
	}
	
	for( var j=0 ; j<spread ; j++ )
	{
		for( var i=startRange ; i<=endRange ; i++ )
		{
			switch(direction) {
				case DirectionType.LEFT:
				case DirectionType.RIGHT:
					indexX = -j;
					indexY = -i;
					break;
	
				case DirectionType.TOP:
				case DirectionType.BOTTOM:
					indexX = -i;
					indexY = -j;
					break;
			}
			array.push([indexX, indexY]);

			switch(direction) {
				case DirectionType.LEFT:
				case DirectionType.RIGHT:
					indexX = j;
					indexY = -i;
					break;
	
				case DirectionType.TOP:
				case DirectionType.BOTTOM:
					indexX = -i;
					indexY = j;
					break;
			}
			array.push([indexX, indexY]);
	
			switch(direction) {
				case DirectionType.LEFT:
				case DirectionType.RIGHT:
					indexX = -j;
					indexY = i;
					break;
	
				case DirectionType.TOP:
				case DirectionType.BOTTOM:
					indexX = i;
					indexY = -j;
					break;
			}
			array.push([indexX, indexY]);
			
			switch(direction) {
				case DirectionType.LEFT:
				case DirectionType.RIGHT:
					indexX = j;
					indexY = i;
					break;
	
				case DirectionType.TOP:
				case DirectionType.BOTTOM:
					indexX = i;
					indexY = j;
					break;
			}
			array.push([indexX, indexY]);
		}
	}
	if(isGetIndexData) {
		return unique(array);
	} else {
		return OT_getRangeIndexNormalize(x, y, array);
	}
};

//Horizontal character for breath
OT_getBreathLineIndexArray = function(x, y, px, py, startRange, endRange, direction, spread, isGetIndexData) {
	var array = [];
	var indexX = 0;
	var indexY = 0;
	if( typeof isGetIndexData === 'undefined' ) {
		isGetIndexData = false;
	}
	
	//root.log('start:');
	for( var j=0 ; j<spread ; j++ )
	{
		for( var i=startRange ; i<=endRange ; i++ )
		{
			switch(direction) {
				case DirectionType.LEFT:
				case DirectionType.RIGHT:
					indexX = px-j;
					indexY = py-i;
					break;
	
				case DirectionType.TOP:
				case DirectionType.BOTTOM:
					indexX = px-i;
					indexY = py-j;
					break;
			}
			array.push([indexX, indexY]);
			//root.log('x:'+indexX+ ' y:'+indexY);

			switch(direction) {
				case DirectionType.LEFT:
				case DirectionType.RIGHT:
					indexX = px+j;
					indexY = py-i;
					break;
	
				case DirectionType.TOP:
				case DirectionType.BOTTOM:
					indexX = px-i;
					indexY = py+j;
					break;
			}
			array.push([indexX, indexY]);
			//root.log('x:'+indexX+ ' y:'+indexY);
	
			switch(direction) {
				case DirectionType.LEFT:
				case DirectionType.RIGHT:
					indexX = px-j;
					indexY = py+i;
					break;
	
				case DirectionType.TOP:
				case DirectionType.BOTTOM:
					indexX = px+i;
					indexY = py-j;
					break;
			}
			array.push([indexX, indexY]);
			//root.log('x:'+indexX+ ' y:'+indexY);
			
			switch(direction) {
				case DirectionType.LEFT:
				case DirectionType.RIGHT:
					indexX = px+j;
					indexY = py+i;
					break;
	
				case DirectionType.TOP:
				case DirectionType.BOTTOM:
					indexX = px+i;
					indexY = py+j;
					break;
			}
			array.push([indexX, indexY]);
			//root.log('x:'+indexX+ ' y:'+indexY);
		}
	}
	if(isGetIndexData) {
		return unique(array);
	} else {
		return OT_getRangeIndexNormalize(x, y, array);
	}
};

//Horizontal character (diagonal)
OT_getDiagonalHorizontalLineIndexArray = function(x, y, startRange, endRange, direction, spread, isGetIndexData) {
	var array = [];
	var indexX = 0;
	var indexY = 0;
	if( typeof isGetIndexData === 'undefined' ) {
		isGetIndexData = false;
	}
	for( var j=0 ; j<spread ; j++ )
	{
		var point1 = Math.floor( (1+j) / 2 );
		var point2 = Math.floor( (j) / 2 );
		for( var i=startRange ; i<=endRange ; i++ )
		{
			switch(direction) {
				case DirectionType.LEFT:
				case DirectionType.RIGHT:
					indexX = i - point2;
					indexY = -i - point1;
					break;
	
				case DirectionType.TOP:
				case DirectionType.BOTTOM:
					indexX = - i - point1;
					indexY = - i + point2;
					break;
			}
			array.push([indexX, indexY]);

			switch(direction) {
				case DirectionType.LEFT:
				case DirectionType.RIGHT:
					indexX = i + point1;
					indexY =  - i + point2;
					break;
	
				case DirectionType.TOP:
				case DirectionType.BOTTOM:
					indexX = - i + point2;
					indexY = - i - point1;
					break;
			}
			array.push([indexX, indexY]);
	
			switch(direction) {
				case DirectionType.LEFT:
				case DirectionType.RIGHT:
					indexX = - i - point1;
					indexY = i - point2;
					break;
	
				case DirectionType.TOP:
				case DirectionType.BOTTOM:
					indexX = i + point1;
					indexY = i - point2;
					break;
			}
			array.push([indexX, indexY]);
			
			switch(direction) {
				case DirectionType.LEFT:
				case DirectionType.RIGHT:
					indexX = - i + point2;
					indexY = i + point1;
					break;
	
				case DirectionType.TOP:
				case DirectionType.BOTTOM:
					indexX = i - point2;
					indexY = i + point1;
					break;
			}
			array.push([indexX, indexY]);
		}
	}
	if(isGetIndexData) {
		return unique(array);
	} else {
		return OT_getRangeIndexNormalize(x, y, array);
	}
};

//four corners
OT_getBoxIndexArray = function(x, y, startRange, endRange, isGetIndexData) {
	if( typeof isGetIndexData === 'undefined' ) {
		isGetIndexData = false;
	}
	
	var array = [];
	var index = -1;
	var indexX = 0;
	var indexY = 0;
	var count = 1 + endRange*2;
	var ax = 0;
	var ay = 0;
	
	for( var i=-endRange ; i<=endRange ; i++ )
	{
		ax =  Math.abs( i );

		for( var j=-endRange ; j<=endRange ; j++ )
		{
			ay =  Math.abs( j );
			if( startRange > ax  && startRange > ay) continue;
			
			//index = CurrentMap.getIndex(x+i, y+j);
			indexX = i;
			indexY = j;
			//if(index != -1)
			//{
			//	array.push(index);
			//}
			array.push([indexX, indexY]);
		}
	}
	
	if(isGetIndexData) {
		return unique(array);
	} else {
		return OT_getRangeIndexNormalize(x, y, array);
	}
};

//Search range creation
OT_getSearchRectIndexArray = function(x, y, startRange, moveLeft, moveRight, moveTop, moveBottom, isGetIndexData) {
	if( typeof isGetIndexData === 'undefined' ) {
		isGetIndexData = false;
	}
	
	var array = [];
	var index = -1;
	var indexX = 0;
	var indexY = 0;
	var ax = 0;
	var ay = 0;
	
	for( var i=-moveLeft ; i<=moveRight ; i++ )
	{
		ax =  Math.abs( i );
		if( startRange > ax ) { 
			//root.log('i:' + i + ' NG');
			continue;
		}
		//root.log('i:' + i + ' startRange:' + startRange);

		for( var j=-moveTop ; j<=moveBottom ; j++ )
		{
			ay =  Math.abs( j );
			if( startRange > ay ) {
				//root.log('j:' + j + ' NG');
				continue;
			}
			//root.log('j:' + j + ' startRange:' + startRange);
			
			//index = CurrentMap.getIndex(x+i, y+j);
			indexX = i;
			indexY = j;
			//root.log('indexX:' + indexX + ' indexY:' + indexY);
			//if(index != -1)
			//{
			//	array.push(index);
			//}
			array.push([indexX, indexY]);
		}
	}
	
	if(isGetIndexData) {
		return unique(array);
	} else {
		return OT_getRangeIndexNormalize(x, y, array);
	}
};
//Overall type
OT_getAllIndexArray = function(isGetIndexData) {
	var array = [];
	if( typeof isGetIndexData === 'undefined' ) {
		isGetIndexData = false;
	}
	
	for( var j=0 ; j<CurrentMap.getHeight() ; j++ ) {
		for( var i=0 ; i<CurrentMap.getWidth() ; i++ ) {
			array.push([i, j]);
		}
	}
	
	if(isGetIndexData) {
		return unique(array);
	} else {
		return OT_getRangeIndexNormalize(0, 0, array);
	}
};

//create index for enemy AI
//Create a range prediction range from the enemy's current position
OT_GetPredictedRangeArray = function(x, y, mov, item) {
	var indexSearchNormal = false;
	var indexSearchBox = false;
	var indexArray = [];

	var endRange         = OT_getCustomItemRangeMax(item);
	var endEffectRange   = OT_getCustomItemEffectRangeMax(item);
	var rangeType        = OT_getCustomItemRangeType(item);
	var effectRangeType  = OT_getCustomItemEffectRangeType(item);
	var tmpStartRange    = 0;
	var tmpEndRange      = mov + endRange + endEffectRange;
	
	switch( rangeType ) {
		case OT_EffectRangeType.XCROSS:
			indexSearchBox = true;
			break;
			
		case OT_EffectRangeType.DOUBLECROSS:
			indexSearchNormal = true;
			indexSearchBox = true;
			break;

		default:
			indexSearchNormal = true;
			break;
	}
	
	switch( effectRangeType ) {
		case OT_EffectRangeType.XCROSS:
		case OT_EffectRangeType.DOUBLECROSS:
		case OT_EffectRangeType.LINE:
		case OT_EffectRangeType.BOX:
		case OT_EffectRangeType.BREATH:
		case OT_EffectRangeType.HORIZONTALLINE:
			indexSearchBox = true;
			break;
	}
	
	//Square for objects with a range of 1 and diagonal 1 square
	//Otherwise use normal range as prediction range
	if(indexSearchBox) {
		indexArray = OT_getBoxIndexArray(x, y, tmpStartRange, tmpEndRange);
	} else {
		indexArray = IndexArray.getBestIndexArray(x, y, tmpStartRange, tmpEndRange);
	}
	
	return indexArray;
}

//----------------------------------------------------------
// Useful functions
//----------------------------------------------------------
// Remove array duplicates
function unique(array) {
	var storage = {};
	var uniqueArray = [];
	var i,value;
	for ( i=0; i<array.length; i++) {
		value = array[i];
		if (!(value in storage))
		{
			storage[value] = true;
			uniqueArray.push(value);
		}
	}
	return uniqueArray;
};

//-----------for debugging ----------
// console output
DebugPrint = function(msg) {
	//root.log(msg);
};

// Time measurement
checkTime = function(msg) {
	//root.log(msg + ' :' + (root.getElapsedTime() * 0.001));
	//root.watchTime();
};

})();

