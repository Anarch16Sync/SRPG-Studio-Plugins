
/*----------------------------------------------------------------------
  
　Staff with magic dependent range

■Overview
　You can make the range of the staff dependent on magic power.

　Putting the custom parameter {MagDependence:2} in your staff will give you a range of magic/2.
　With {MagDependence: 1}, the range remains the same as the magic power.
　(Range is the value of magic/MagDependence)

　In addition, if you want to make the distance to transfer the target dependent on magical power with a teleportation staff
　If you put the custom parameter {MagDependenceTeleport:2} into your staff, the teleportation range will be magical power/2.
　(Range is the value of magic/MagDependenceTeleport)
　*Only teleportation is like this because there is a range for target selection and a range for skipping the selected target.

　If you put a custom parameter {DependenceRangeMin: a number greater than 0} in the staff, you can set the minimum range to this value.
　(prefer custom parameters over MagDependenceRangeMin)
　With {MagDependence:1, DependenceRangeMin:2}, the range is magic power (minimum 2).

　If you put a custom parameter {RangePlus: number} in the staff, you can extend the range by a fixed value.
　{MagDependence:1, RangePlus:2} gives range +2 magic power.

　If you put a custom parameter {ParamType: number} in the staff, you can set the range based on abilities other than magical power.
　The correspondence between the values ​​to be entered and the ability values ​​is as follows.
　*It may work with values ​​other than this, but operation is not guaranteed.
　　1: Strenght
　　2: Magic
　　3: Skill
　　4: Speed
　　5: Luck
　　6: Defense
　　7: Resistance
　　8: Move
　With {ParamType:3, MagDependence:1, RangePlus:3}, the range will be skill +3.


Fixes
18/04/17 New
18/12/01 Compatible with "00_Increase type of Wand.js"
21/07/08 Custom parameter {DependenceRangeMin: number} specifying the minimum range for each staff,
　　　　　Custom parameter {RangePlus: number} that extends the range with a fixed value,
　　　　　Added a custom parameter {ParamType: number} that can be referenced other than magical power
　　　　　Remove MagParamMinValue from settings


■ Correspondence version
　SRPG Studio Version:1.236


■ Terms
・Use is limited to games using SRPG Studio.
・Commercial or non-commercial. Free.
・There is no problem with processing. Please keep remodeling.
・ No credit stated OK
・ Redistribution, reprint OK
・ Wiki OK OK
・Please comply with the SRPG Studio Terms of Use.
  
----------------------------------------------------------------------*/

(function () {

//--------------------------------------------
// setting
//--------------------------------------------
var MagDependenceRangeMin = 0;	// Minimum range value (A value greater than 0. If it is 0, the minimum range display will disappear, and depending on the ability, the range may be 0.)




//--------------------------------------------
// MagDependenceControl class
//--------------------------------------------
var MagDependenceControl = {

	// Acquire magical power dependent range
	getItemRange: function(unit, item) {
		var mag, index, weapon, MagDependence;

		if( item == null ) {
			return 0;
		}

		if( item.isWeapon() ) {
			return 0;
		}

		var RangePlus = this._getItemRangePlus(item);

		MagDependence = item.custom.MagDependence;
		if( typeof MagDependence !== 'number' ) {
			return item.getRangeValue() + RangePlus;
		}

		if( unit == null ) {
			return 0;
		}

		weapon = ItemControl.getEquippedWeapon(unit);
		index = ParamGroup.getParameterIndexFromType(this._getItemParamType(item));
		mag = ParamGroup.getLastValue(unit, index, weapon);
		mag = Math.floor(mag/MagDependence) + RangePlus;

		var dependenceRangeMin = this._getItemDependenceRangeMinValue(item);
		if( mag <= dependenceRangeMin ) {
			return dependenceRangeMin;
		}
		return mag;
	},

	_getItemRangePlus: function(item) {
		var RangePlus = 0;

		if( item == null ) {
			return 0;
		}

		if( item.isWeapon() ) {
			return 0;
		}

		if( typeof item.custom.RangePlus === 'number' ) {
			RangePlus = item.custom.RangePlus;
		}

		return RangePlus;
	},

	_getItemDependenceRangeMinValue: function(item) {
		var DependenceRangeMin = MagDependenceRangeMin;

		if( item == null ) {
			return 0;
		}

		if( item.isWeapon() ) {
			return 0;
		}

		if( typeof item.custom.DependenceRangeMin === 'number' ) {
			DependenceRangeMin = item.custom.DependenceRangeMin;
		}
		return DependenceRangeMin;
	},

	_getItemParamType: function(item) {
		var paramType = ParamType.MAG;

		if( typeof item.custom.ParamType === 'number' ) {
			paramType = item.custom.ParamType;
		}

		return paramType;
	},

	getItemParameterName: function(item) {
		var index = ParamGroup.getParameterIndexFromType(this._getItemParamType(item));

		return ParamGroup.getParameterName(index);
	},

	// Determine if it is a magic-dependent staff
	isMagDependenceItem: function(item) {
		if( item == null ) {
			return false;
		}

		if( item.isWeapon() ) {
			return false;
		}

		if( typeof item.custom.MagDependence !== 'number' ) {
			return false;
		}

		return true;
	},

	// Acquire transfer destination range of teleportation dependent on magical power
	getTeleportRange: function(unit, item) {
		var mag, index, weapon, MagDependenceTeleport;
		var teleportationInfo;

		if( item == null ) {
			return 0;
		}

		if( item.isWeapon() ) {
			return 0;
		}

		MagDependenceTeleport = item.custom.MagDependenceTeleport;
		if( typeof MagDependenceTeleport !== 'number' ) {
			teleportationInfo = item.getTeleportationInfo();
			return teleportationInfo.getRangeValue();
		}

		if( unit == null ) {
			return 0;
		}

		weapon = ItemControl.getEquippedWeapon(unit);
		index = ParamGroup.getParameterIndexFromType(this._getItemParamType(item));
		mag = ParamGroup.getLastValue(unit, index, weapon);
		mag = Math.floor(mag/MagDependenceTeleport);

		var dependenceRangeMin = this._getItemDependenceRangeMinValue(item);
		if( mag <= dependenceRangeMin ) {
			return dependenceRangeMin;
		}

		return mag;
	},

	// Determines whether it is the transfer destination range of magical power-dependent teleportation
	isMagDependenceTeleport: function(item) {
		if( item == null ) {
			return false;
		}

		if( item.getItemType() !== ItemType.TELEPORTATION ) {
			return false;
		}

		if( typeof item.custom.MagDependenceTeleport !== 'number' ) {
			return false;
		}

		return true;
	},

	// Index array generation processing for magic-dependent staffs
	createIndexArray: function(x, y, item, unit) {
		var i, rangeValue, rangeType, arr;
		var startRange = 1;
		var endRange = 1;
		var count = 1;
		
		if (this.isMagDependenceItem(item) != true && this.isMagDependenceTeleport(item) != true) {
			root.log('Warning Range: Not dependent on magic power:'+item.getName());
			return this.getBestIndexArray(x, y, startRange, endRange);
		}

		if (item.getItemType() === ItemType.TELEPORTATION && item.getRangeType() === SelectionRangeType.SELFONLY) {
			if( MagDependenceControl.isMagDependenceTeleport(item) != true ) {
				rangeValue = item.getTeleportationInfo().getRangeValue();
			}
			else {
				rangeValue = MagDependenceControl.getTeleportRange(unit, item);
			}
			rangeType = item.getTeleportationInfo().getRangeType();
		}
		else {
			if( MagDependenceControl.isMagDependenceItem(item) != true ) {
				rangeValue = item.getRangeValue();
			}
			else {
				rangeValue = MagDependenceControl.getItemRange(unit, item);
			}
			rangeType = item.getRangeType();
		}
		
		if (rangeType === SelectionRangeType.SELFONLY) {
			return [];
		}
		else if (rangeType === SelectionRangeType.MULTI) {
			endRange = rangeValue;
		}
		else if (rangeType === SelectionRangeType.ALL) {
			count = CurrentMap.getSize();
			
			arr = [];
			arr.length = count;
			for (i = 0; i < count; i++) {
				arr[i] = i;
			}
			
			return arr;
		}
		
		return IndexArray.getBestIndexArray(x, y, startRange, endRange);
	}
};




//--------------------------------------------
// ItemInfoWindow class
//--------------------------------------------
var alias01 = ItemInfoWindow.getWindowWidth;
ItemInfoWindow.getWindowWidth= function() {
		var width = alias01.call(this);

//		if( MagDependenceControl.isMagDependenceItem(this._item) == true ) {
			width += 30;
//		}
		return width;
}




//--------------------------------------------
// BaseItemInfo class
//--------------------------------------------
var alias10 = BaseItemInfo.drawRange;
BaseItemInfo.drawRange= function(x, y, rangeValue, rangeType, item) {
		// If the argument is less than 5, it is the same as before
		if( arguments.length < 5 ) {
			alias10.call(this, x, y, rangeValue, rangeType, item);
			return;
		}

		// If the range is self or the whole area, it is the same as before
		if( rangeType !== SelectionRangeType.MULTI ) {
			alias10.call(this, x, y, rangeValue, rangeType, item);
			return;
		}

		// If the argument item is null, it is the same as before (because it cannot be processed)
		if( item == null ) {
			alias10.call(this, x, y, rangeValue, rangeType, item);
			return;
		}

		// If the item does not have Kaspara mag dependence, it is the same as before.
		var MagDependence = item.custom.MagDependence;
		if( typeof MagDependence !== 'number' ) {
			alias10.call(this, x, y, rangeValue, rangeType, item);
			return;
		}

		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var text = MagDependenceControl.getItemParameterName(this._item);
		
		if( MagDependence > 1 ) {
			text = text+'/'+MagDependence;
		}

		var RangePlus = MagDependenceControl._getItemRangePlus(item);
		if( RangePlus > 0 ) {
			text = text+'+'+this._item.custom.RangePlus;
		}
		else if( RangePlus < 0 ) {
			text = text+'-'+this._item.custom.RangePlus;
		}

		var DependenceRangeMin = MagDependenceControl._getItemDependenceRangeMinValue(this._item);
		if( DependenceRangeMin > 0 ) {
			text = text+'(lowest'+DependenceRangeMin+')';
		}
		
		ItemInfoRenderer.drawKeyword(x, y, root.queryCommand('range_capacity'));
		x += ItemInfoRenderer.getSpaceX();
		
		TextRenderer.drawKeywordText(x, y, text, -1, color, font);
}




//--------------------------------------------
// DamageItemInfo class
//--------------------------------------------
DamageItemInfo._drawValue= function(x, y) {
		var damageInfo = this._item.getDamageInfo();
		
		ItemInfoRenderer.drawKeyword(x, y, this._getName());
		x += ItemInfoRenderer.getSpaceX();
		NumberRenderer.drawRightNumber(x, y, damageInfo.getDamageValue());
		
		x += 40;
		this.drawRange(x, y, this._item.getRangeValue(), this._item.getRangeType(), this._item);
}




//--------------------------------------------
// DurabilityItemInfo class
//--------------------------------------------
DurabilityItemInfo.drawItemInfoCycle= function(x, y) {
		ItemInfoRenderer.drawKeyword(x, y, this.getItemTypeName(StringTable.ItemInfo_Durability));
		
		y += ItemInfoRenderer.getSpaceY();
		this._drawType(x, y);
		
		y += ItemInfoRenderer.getSpaceY();
		this.drawRange(x, y, this._item.getRangeValue(), this._item.getRangeType(), this._item);
}




//--------------------------------------------
// KeyItemInfo class
//--------------------------------------------
KeyItemInfo.drawItemInfoCycle= function(x, y) {
		ItemInfoRenderer.drawKeyword(x, y, this.getItemTypeName(StringTable.ItemInfo_Key));
		y += ItemInfoRenderer.getSpaceY();
	
		this._drawValue(x, y);
		y += ItemInfoRenderer.getSpaceY();
		
		if (!KeyEventChecker.isPairKey(this._item)) {
			this.drawRange(x, y, this._item.getRangeValue(), this._item.getRangeType(), this._item);
		}
}




//--------------------------------------------
// QuickItemInfo class
//--------------------------------------------
QuickItemInfo.drawItemInfoCycle= function(x, y) {
		ItemInfoRenderer.drawKeyword(x, y, this.getItemTypeName(StringTable.ItemInfo_Quick));
		
		y += ItemInfoRenderer.getSpaceY();
		this.drawRange(x, y, this._item.getRangeValue(), this._item.getRangeType(), this._item);
}




//--------------------------------------------
// RecoveryItemInfo class
//--------------------------------------------
RecoveryItemInfo._drawValue= function(x, y) {
		var recoveryInfo = this._item.getRecoveryInfo();
		
		if (recoveryInfo.getRecoveryType() === RecoveryType.SPECIFY) {
			ItemInfoRenderer.drawKeyword(x, y, StringTable.Recovery_Value);
			x += ItemInfoRenderer.getSpaceX();
			NumberRenderer.drawRightNumber(x, y, recoveryInfo.getRecoveryValue());	
		}
		else {
			ItemInfoRenderer.drawKeyword(x, y, StringTable.Recovery_All);
			x += ItemInfoRenderer.getSpaceX();
		}
		
		x += 40;
		this.drawRange(x, y, this._item.getRangeValue(), this._item.getRangeType(), this._item);
}




//--------------------------------------------
// RescueItemInfo class
//--------------------------------------------
RescueItemInfo.drawItemInfoCycle= function(x, y) {
		ItemInfoRenderer.drawKeyword(x, y, this.getItemTypeName(StringTable.ItemInfo_Rescue));
		y += ItemInfoRenderer.getSpaceY();
		
		this.drawRange(x, y, this._item.getRangeValue(), this._item.getRangeType(), this._item);
}




//--------------------------------------------
// StateItemInfo class
//--------------------------------------------
StateItemInfo.drawItemInfoCycle= function(x, y) {
		ItemInfoRenderer.drawKeyword(x, y, this.getItemTypeName(StringTable.ItemInfo_State));
		y += ItemInfoRenderer.getSpaceY();
		this.drawRange(x, y, this._item.getRangeValue(), this._item.getRangeType(), this._item);
		y += ItemInfoRenderer.getSpaceY();
		this._drawValue(x, y);
}




//--------------------------------------------
// StealItemInfo class
//--------------------------------------------
StealItemInfo.drawItemInfoCycle= function(x, y) {
		ItemInfoRenderer.drawKeyword(x, y, this.getItemTypeName(StringTable.ItemInfo_Steal));
		
		y += ItemInfoRenderer.getSpaceY();
		this.drawRange(x, y, this._item.getRangeValue(), this._item.getRangeType(), this._item);
}




//--------------------------------------------
// TeleportationItemSelection class
//--------------------------------------------
TeleportationItemSelection.setPosSelection= function() {
		var indexArray = [];
		var teleportationInfo = this._item.getTeleportationInfo();
		var rangeType = teleportationInfo.getRangeType();
		var rangeValue = teleportationInfo.getRangeValue();
		
		if( MagDependenceControl.isMagDependenceTeleport(this._item) == true ) {
			rangeValue = MagDependenceControl.getTeleportRange(this._unit, this._item);
		}
		
		if (rangeType === SelectionRangeType.MULTI) {
			indexArray = this._getMultiTeleportationIndexArray(rangeValue);
		}
		else if (rangeType === SelectionRangeType.ALL) {
			indexArray = this._getAllTeleportationIndexArray();
		}
		
		// Specify pos selector type.free to select any location
		this._posSelector.setPosSelectorType(PosSelectorType.FREE);
		this._posSelector.setPosOnly(this._unit, this._item, indexArray, PosMenuType.Item);
		
		// Don't call setFirstPos so that the cursor doesn't jump too far
        // this._posSelector.setFirstPos();
}




//--------------------------------------------
// TeleportationItemInfo class
//--------------------------------------------
TeleportationItemInfo.drawItemInfoCycle= function(x, y) {
		ItemInfoRenderer.drawKeyword(x, y, this.getItemTypeName(StringTable.ItemInfo_Teleportation));
		y += ItemInfoRenderer.getSpaceY();
		
		this.drawRange(x, y, this._item.getRangeValue(), this._item.getRangeType(), this._item);
		y += ItemInfoRenderer.getSpaceY();
		
		this._drawValue(x, y);
}


var alias20 = TeleportationItemInfo._drawValue;
TeleportationItemInfo._drawValue= function(x, y) {
		if( MagDependenceControl.isMagDependenceTeleport(this._item) != true ) {
			alias20.call(this, x, y);
			return;
		}
		
		var teleportationInfo = this._item.getTeleportationInfo();
		
		if (teleportationInfo.getRangeType() !== SelectionRangeType.MULTI) {
			alias20.call(this, x, y);
			return;
		}
		
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		var text = MagDependenceControl.getItemParameterName(this._item);
		
		if( this._item.custom.MagDependenceTeleport > 1 ) {
			text = text+'/'+this._item.custom.MagDependenceTeleport;
		}
		var RangePlus = MagDependenceControl._getItemRangePlus(item);
		if( RangePlus > 0 ) {
			text = text+'+'+this._item.custom.RangePlus;
		}
		else if( RangePlus < 0 ) {
			text = text+'-'+this._item.custom.RangePlus;
		}

		var DependenceRangeMin = MagDependenceControl._getItemDependenceRangeMinValue(this._item);
		if( MagDependenceRangeMin > 0 ) {
			text = text+'(最低'+MagDependenceRangeMin+')';
		}
		
		ItemInfoRenderer.drawKeyword(x, y, StringTable.Teleportation_Range);
		x += ItemInfoRenderer.getSpaceX();
		
		TextRenderer.drawKeywordText(x, y, text, -1, color, font);
}




//--------------------------------------------
// TeleportationItem AI class
//--------------------------------------------
var alias30 = TeleportationItemAI._isTeleportationEnabled;
TeleportationItemAI._isTeleportationEnabled= function(unit, combination) {
		var targetUnit = combination.targetUnit;
		var teleportationInfo = combination.item.getTeleportationInfo();
		var rangeType = teleportationInfo.getRangeType();
		var item = combination.item;
		
		if (rangeType !== SelectionRangeType.MULTI || MagDependenceControl.isMagDependenceTeleport(item) != true) {
			return alias30.call(this, unit, combination);
		}

		return this._isMultiRangeEnabledMagDependenceTeleport(unit, targetUnit, teleportationInfo, item);
}



TeleportationItemAI._isMultiRangeEnabledMagDependenceTeleport= function(unit, targetUnit, teleportationInfo, item) {
		var i, index, x, y, focusUnit;
		var indexArray = IndexArray.getBestIndexArray(unit.getMapX(), unit.getMapY(), 1, MagDependenceControl.getTeleportRange(unit, item) + 1);
		var count = indexArray.length;
		
		for (i = 0; i < count; i++) {
			index = indexArray[i];
			x = CurrentMap.getX(index);
			y = CurrentMap.getY(index);
			focusUnit = PosChecker.getUnitFromPos(x, y);
			if (focusUnit === null) {
				continue;
			}
			
			if (!this._isUnitTypeAllowed(targetUnit, focusUnit)) {
				continue;
			}
			
			// Allow teleportation because there is some unit (focus unit) within the range based on the target unit
			return true;
		}
		
		return false;
}




//--------------------------------------------
// TeleportationControl class
//--------------------------------------------
var alias40 = TeleportationControl.getTeleportationPos;
TeleportationControl.getTeleportationPos= function(unit, targetUnit, item) {
		var teleportationInfo = item.getTeleportationInfo();
		var rangeType = teleportationInfo.getRangeType();
		var curUnit = null;
		var parentIndexArray = null;
		
		if (rangeType !== SelectionRangeType.MULTI || MagDependenceControl.isMagDependenceTeleport(item) != true) {
			return alias40.call(this, unit, targetUnit, item);
		}

		curUnit = this._getMultiRangeUnitMagDependenceTeleport(unit, targetUnit, teleportationInfo, item);
		parentIndexArray = IndexArray.getBestIndexArray(unit.getMapX(), unit.getMapY(), 1, MagDependenceControl.getTeleportRange(unit, item));

		// Call get nearby pos ex instead of get nearby pos to avoid returning out-of-range positions
		return PosChecker.getNearbyPosEx(curUnit, targetUnit, parentIndexArray);
}


TeleportationControl._getMultiRangeUnitMagDependenceTeleport= function(unit, targetUnit, teleportationInfo, item) {
		var i, index, x, y, focusUnit;
		var indexArray = IndexArray.getBestIndexArray(unit.getMapX(), unit.getMapY(), 1, MagDependenceControl.getTeleportRange(unit, item) + 1);
		var count = indexArray.length;
		var curUnit = null;
		
		for (i = 0; i < count; i++) {
			index = indexArray[i];
			x = CurrentMap.getX(index);
			y = CurrentMap.getY(index);
			focusUnit = PosChecker.getUnitFromPos(x, y);
			if (focusUnit === null) {
				continue;
			}
			
			if (!this._isUnitTypeAllowed(targetUnit, focusUnit)) {
				continue;
			}
			
			curUnit = this._checkUnit(curUnit, focusUnit);
		}
		
		return curUnit;
}




//--------------------------------------------
// BaseCombinationCollector class
//--------------------------------------------
BaseCombinationCollector._setPlaceKeyCombination= function(misc, obj, keyFlag) {
		var rangeMetrics, rangeValueGate, rangeTypeGate, rangeValueTreasure, rangeTypeTreasure;
		
		if (KeyEventChecker.isPairKey(obj)) {
			rangeValueGate = 1;
			rangeTypeGate = SelectionRangeType.MULTI;
			rangeValueTreasure = 0;
			rangeTypeTreasure = SelectionRangeType.SELFONLY;
		}
		else {
			if( misc.item == null ) {
				rangeValueGate = obj.getRangeValue();
				rangeTypeGate = obj.getRangeType();
				rangeValueTreasure = obj.getRangeValue();
				rangeTypeTreasure = obj.getRangeType();
			}
			else if( MagDependenceControl.isMagDependenceItem(obj) != true ) {
				rangeValueGate = obj.getRangeValue();
				rangeTypeGate = obj.getRangeType();
				rangeValueTreasure = obj.getRangeValue();
				rangeTypeTreasure = obj.getRangeType();
			}
			else {
				rangeValueGate = MagDependenceControl.getItemRange(misc.unit, obj);
				rangeTypeGate = obj.getRangeType();
				rangeValueTreasure = rangeValueGate;
				rangeTypeTreasure = rangeTypeGate;
			}
		}
		
		if (keyFlag & KeyFlag.GATE) {
			rangeMetrics = StructureBuilder.buildRangeMetrics();
			rangeMetrics.endRange = rangeValueGate;
			rangeMetrics.rangeType = rangeTypeGate;
			this._setPlaceRangeCombination(misc, PlaceEventFilterFlag.GATE, rangeMetrics);
		}
		
		if (keyFlag & KeyFlag.TREASURE) {
			rangeMetrics = StructureBuilder.buildRangeMetrics();
			rangeMetrics.endRange = rangeValueTreasure;
			rangeMetrics.rangeType = rangeTypeTreasure;
			this._setPlaceRangeCombination(misc, PlaceEventFilterFlag.TREASURE, rangeMetrics);
		}
}




//--------------------------------------------
// CombinationCollector class
//--------------------------------------------
CombinationCollector.Item._setUnitCombination= function(misc) {
		var filter, rangeValue, rangeType, rangeMetrics;
		var unit = misc.unit;
		var item = misc.item;
		var obj = ItemPackageControl.getItemAIObject(item);
		
		if (obj === null) {
			return;
		}
		
		filter = obj.getUnitFilter(unit, item);
		
		if (item.getItemType() === ItemType.TELEPORTATION && item.getRangeType() === SelectionRangeType.SELFONLY) {
			if( MagDependenceControl.isMagDependenceTeleport(item) != true ) {
				rangeValue = item.getTeleportationInfo().getRangeValue();
			}
			else {
				rangeValue = MagDependenceControl.getTeleportRange(unit, item);
			}
			rangeType = item.getTeleportationInfo().getRangeType();
		}
		else {
			if( MagDependenceControl.isMagDependenceItem(item) != true ) {
				rangeValue = item.getRangeValue();
			}
			else {
				rangeValue = MagDependenceControl.getItemRange(unit, item);
			}

			rangeType = item.getRangeType();
		}
		
		rangeMetrics = StructureBuilder.buildRangeMetrics();
		rangeMetrics.endRange = rangeValue;
		rangeMetrics.rangeType = rangeType;
			
		this._setUnitRangeCombination(misc, filter, rangeMetrics);
}




//--------------------------------------------
// KeyItemSelection class
//--------------------------------------------
var alias50 = KeyItemSelection.setInitialSelection;
KeyItemSelection.setInitialSelection= function() {
		if( MagDependenceControl.isMagDependenceItem(this._item) != true ) {
			return alias50.call(this);
		}

		this._keyData = KeyEventChecker.buildKeyDataItemMagDependence(this._item, KeyFlag.ALL, this._unit);
		
		// Check if the key is used at the current location
		if (this._keyData.rangeType === SelectionRangeType.SELFONLY) {
			// check if the position is an event
			if (KeyEventChecker.getKeyEvent(this._unit.getMapX(), this._unit.getMapY(), this._keyData) === null) {
				this._isSelection = false;
				return EnterResult.NOTENTER;
			}
			
			// Selectable because there is an event at the current position
			this._isSelection = true;
			return EnterResult.NOTENTER;
		}
		else {
			this.setPosSelection();
		}
		
		return EnterResult.OK;
}




//--------------------------------------------
// KeyItemAvailability class
//--------------------------------------------
var alias60 = KeyItemAvailability.isItemAvailableCondition;
KeyItemAvailability.isItemAvailableCondition= function(unit, item) {
		if( MagDependenceControl.isMagDependenceItem(item) != true ) {
			return alias60.call(this, unit, item);
		}

		var keyData = KeyEventChecker.buildKeyDataItemMagDependence(item, KeyFlag.ALL, unit);
		
		return KeyEventChecker.getIndexArrayFromKeyType(unit, keyData).length > 0;
}




//--------------------------------------------
// KeyEventChecker class
//--------------------------------------------
KeyEventChecker.buildKeyDataItemMagDependence= function(item, requireFlag, unit) {
		var keyData = KeyEventChecker.buildKeyDataItem(item, requireFlag);
		
		keyData.rangeValue = MagDependenceControl.getItemRange(unit, item);
		
		return keyData;
}




//--------------------------------------------
// BaseItemSelection class
//--------------------------------------------
var alias70 = BaseItemSelection.setUnitSelection;
BaseItemSelection.setUnitSelection= function() {
		if( MagDependenceControl.isMagDependenceItem(this._item) !== true ) {
			alias70.call(this);
			return;
		}
		
		var filter = this.getUnitFilter();
		var indexArray = MagDependenceControl.createIndexArray(this._unit.getMapX(), this._unit.getMapY(), this._item, this._unit);
		
		indexArray = this._getUnitOnlyIndexArray(this._unit, indexArray);
		this._posSelector.setUnitOnly(this._unit, this._item, indexArray, PosMenuType.Item, filter);
		
		this.setFirstPos();
}


var alias71 = BaseItemSelection.setPosSelection;
BaseItemSelection.setPosSelection= function() {
		if( MagDependenceControl.isMagDependenceItem(this._item) != true ) {
			alias71.call(this);
			return;
		}
		
		var indexArray = MagDependenceControl.createIndexArray(this._unit.getMapX(), this._unit.getMapY(), this._item, this._unit);
		
		this._posSelector.setPosOnly(this._unit, this._item, indexArray, PosMenuType.Item);
		
		this.setFirstPos();
}




//--------------------------------------------
// BaseItemAvailability class
//--------------------------------------------
var alias80 = BaseItemAvailability._checkMulti;
BaseItemAvailability._checkMulti= function(unit, item) {
		if( MagDependenceControl.isMagDependenceItem(item) !== true ) {
			return alias80.call(this, unit, item);
		}
		
		var i, index, x, y;
		var indexArray = MagDependenceControl.createIndexArray(unit.getMapX(), unit.getMapY(), item, unit);
		var count = indexArray.length;
		
		for (i = 0; i < count; i++) {
			index = indexArray[i];
			x = CurrentMap.getX(index);
			y = CurrentMap.getY(index);
			if (this.isPosEnabled(unit, item, x, y)) {
				return true;
			}
		}
		
		return false;
}




//--------------------------------------------
// UnitRangePanel class
//--------------------------------------------
// Change the range calculation process of the cane if not used together with the display change script of the standby movement range and the attack range of the own army
if( typeof WAND_MARKING_EXTRA_DISPLAY === 'undefined' ) {
	UnitRangePanel._getRangeMetricsFromItem= function(unit, item) {
		var rangeMetrics = null;
		
		if (item.isWeapon()) {
			if (ItemControl.isWeaponAvailable(unit, item)) {
				rangeMetrics = StructureBuilder.buildRangeMetrics();
				rangeMetrics.startRange = item.getStartRange();
				rangeMetrics.endRange = item.getEndRange();
			}
		}
		else {
			if (item.getRangeType() === SelectionRangeType.MULTI && (item.getFilterFlag() & UnitFilterFlag.ENEMY)) {
				rangeMetrics = StructureBuilder.buildRangeMetrics();
				if( MagDependenceControl.isMagDependenceItem(item) != true ) {
					rangeMetrics.endRange = item.getRangeValue();
				}
				else {
					rangeMetrics.endRange = MagDependenceControl.getItemRange(unit, item);
				}
			}
		}
		
		return rangeMetrics;
	}
}


// Change the range calculation process of the cane when using it together with the display change script of the standby type movement range and the attack range of the own army
if( typeof WAND_MARKING_EXTRA_DISPLAY !== 'undefined' ) {
	UnitRangePanel._getRangeMetricsFromWand= function(unit, item) {
		var rangeMetrics = null;
		
//		if (item.isWeapon()) {
//			if (ItemControl.isWeaponAvailable(unit, item)) {
//				rangeMetrics = StructureBuilder.buildRangeMetrics();
//				rangeMetrics.startRange = item.getStartRange();
//				rangeMetrics.endRange = item.getEndRange();
//			}
//		}
//		else{
			var isWand = item.isWand();
			if( typeof isWandTypeExtra !== 'undefined' ) {
				// Add Weapon Type
				isWand = WandChecker.isWand(item);
			}
			// In the case of a staff and a unit that can be used, the one with the longest range among the staffs that can be used is displayed.
			if( isWand && ItemControl.isItemUsable(unit, item) ) {
				if( item.getRangeType() === SelectionRangeType.MULTI ) {
					rangeMetrics = StructureBuilder.buildRangeMetrics();
					if( MagDependenceControl.isMagDependenceItem(item) != true ) {
						rangeMetrics.endRange = item.getRangeValue();
					}
					else {
						rangeMetrics.endRange = MagDependenceControl.getItemRange(unit, item);
					}
				}
			}
//		}
		
		return rangeMetrics;
	}
}


// When used in combination with the display change script for standby type movement range and own attack range
if( typeof WAND_MARKING_EXTRA_DISPLAY !== 'undefined' && WAND_MARKING_EXTRA_DISPLAY == true ) {
	// Acquiring the attack range of the unit (for the marking panel. When using a different color for the range display marking of the cane than the attack)
	MarkingPanel._getUnitAttackRangeEx= function(unit) {
		var item, count, rangeMetrics;
		var i = 0;
		var startRange = 99;
		var endRange = 0;
		var endWandRange = 0;
		var isWeapon = false;
		var isWand = false;
		var itemIsWand;			// For checking whether it is a cane or not (used in combination with "00 weapon type cane: increase .js")
		var obj = {};
		
		// See Weapons with the Most Range
		count = UnitItemControl.getPossessionItemCount(unit);
		while ( i < count ) {
			item = UnitItemControl.getItem(unit, i);
			rangeMetrics = UnitRangePanel._getRangeMetricsFromItem(unit, item);
			if (rangeMetrics !== null) {
				if (rangeMetrics.startRange < startRange) {
					startRange = rangeMetrics.startRange;
				}
				if (rangeMetrics.endRange > endRange) {
					endRange = rangeMetrics.endRange;
				}
				
				isWeapon = endRange !== 0;
			}

			itemIsWand = item.isWand();
			if( typeof isWandTypeExtra !== 'undefined' ) {
				// Add Weapon Type
				itemIsWand = WandChecker.isWand(item);
			}
			if( itemIsWand && ItemControl.isItemUsable(unit, item) ) {
				if ( item.getRangeType() === SelectionRangeType.MULTI ) {
					if( MagDependenceControl.isMagDependenceItem(item) != true ) {
						endWandRange = item.getRangeValue();
					}
					else {
						endWandRange = MagDependenceControl.getItemRange(unit, item);
					}
					isWand = true;
				}
			}
			i++;
		}
		
		obj.startRange   = startRange;
		obj.endRange     = endRange;
		obj.endWandRange = endWandRange;		// max range of wand
		obj.mov          = this._getMove(unit);	// Mobility
		obj.isWeapon     = isWeapon;			// With/without weapons
		obj.isWand       = isWand;				// With/without cane
		
		return obj;
	}
}


})();