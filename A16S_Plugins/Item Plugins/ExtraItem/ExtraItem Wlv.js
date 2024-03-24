/* 
ExtraItem Wlv
Author: Anarch16Sync

Overview: 
This plugin allows to set a Wlv requirement to use items.

Custom Parameter:
Add {_wlv:XX} to any item, where XX is the required Wlv to use the item, when not added items are usable at any Wlv.

Changelog:

2024-03-24 ver 1.0 
Created based on Namae_mitei's Wand Weapon Level plugin

Terms of Use: 
This plugin is provided as is, use at your own discretion. Redistribution and modification is OK.

*/

(function() {

var aliasisItemUsable = ItemControl.isItemUsable;
ItemControl.isItemUsable = function(unit, item) {
	
		// Call the item control.is item usable() processing (original judgment processing, etc.) up to this point
		var result = aliasisItemUsable.call(this, unit, item);
	
		// If False, the processing up to this point has resulted in an unusable result.
		if( result == false ) {
			return false;
		}
		
		//When the original process returns true, return the result of the wlv check

		return this._isItemLevel(unit, item);
	};


var _isWLvDisplayableAlias = ItemSentence.WeaponLevelAndWeight._isWeaponLevelDisplayable;
ItemSentence.WeaponLevelAndWeight._isWeaponLevelDisplayable = function(item){
	var result = _isWLvDisplayableAlias.call(this, item)

	if( result == true ) {
		return true;
	}

	if (ItemControl.getItemLevel(item) <= 0 ){
		return false
	}

	return DataConfig.isWeaponLevelDisplayable();
};

ItemSentence.WeaponLevelAndWeight.drawItemSentence= function(x, y, item) {
	var text;
	var wlv;
	
	if (this._isWeaponLevelDisplayable(item)) {
		text = root.queryCommand('wlv_param');
		ItemInfoRenderer.drawKeyword(x, y, text);
		x += ItemInfoRenderer.getSpaceX();
		// If it is a weapon, acquire the required wlv
		if( item.isWeapon() ) {
			wlv = item.getWeaponLevel();
		}
		// If it is an item acquire item required wlv
		else {
			wlv = ItemControl.getItemLevel(item);
		}
		NumberRenderer.drawRightNumber(x, y, wlv);
		
		x += 42;
	}
	
	if (this._isWeightDisplayable(item)) {
		text = root.queryCommand('weight_capacity');
		ItemInfoRenderer.drawKeyword(x, y, text);
		x += ItemInfoRenderer.getSpaceX();
		NumberRenderer.drawRightNumber(x, y, item.getWeight());
	}
};

ItemControl.getItemLevel= function(item) {
	// returns -1 if there are no items
	if( item == null ) {
		return -1;
	}

	if( item.isWeapon() ) {
		return -1;
	}

	if( typeof item.custom._wlv !== 'number' ) {
		return 0;
	}

	return item.custom._wlv;
};

ItemControl._isItemLevel= function(unit, item) {
	var unit_wlv;
	var wlv_idx;
	var item_wlv = ItemControl.getItemLevel(item);
	// If -1 comes back, it's not an item
	if( item_wlv < 0 ) {
		return false;
	}

	// Get proficiency index
	wlv_idx = ParamGroup.getParameterIndexFromType(ParamType.WLV);

	// Calling ParamBonus.getBonusFromWeapon loops, so we have our own implementation
	unit_wlv = UnitParameter.WLV.getUnitValue(unit)+UnitParameter.WLV.getParameterBonus(unit.getClass());
	unit_wlv += (UnitParameter.WLV.getUnitTotalParamBonus(unit, item) + StateControl.getStateParameter(unit, wlv_idx));
	unit_wlv = FusionControl.getLastValue(unit, wlv_idx, unit_wlv);

	return unit_wlv >= item_wlv;

};

})();