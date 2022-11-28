
/*----------------------------------------------------------------------
  
　Add usable proficiency to a staff

■Overview
　Custom parameter {_wlv:XX} for the staff *If XX is a numerical value,
　If the weapon level of the unit is < _wlv, the staff will not be usable.

　It is a feeling that the required proficiency of weapons can also be done with a staff


16/12/02 new
17/04/30 Fixed a bug that the proficiency check was incorrect when used in conjunction with a script that increases ability values
18/12/01 Compatible with "00_Increase the type of Wand.js"


■ Correspondence version
　SRPG Studio Version:1.198

■ Terms
・Use is limited to games using SRPG Studio.
・Commercial or non-commercial. Free.
・There is no problem with processing. Please keep remodeling.
・ No credit stated OK
・ Redistribution, reprint OK
・Please comply with the SRPG Studio Terms of Use.
  
--------------------------------------------------------------------------*/


(function() {




//---------------------------
// ItemSentence.WeaponLevelAndWeight Class
//---------------------------
// Drawing item information
ItemSentence.WeaponLevelAndWeight.drawItemSentence= function(x, y, item) {
		var text;
		var dx = 0;
		var wlv;
		
		if (this._isWeaponLevelDisplayable(item)) {
			text = root.queryCommand('wlv_param');
			ItemInfoRenderer.drawKeyword(x, y, text);
			x += ItemInfoRenderer.getSpaceX();
			// If it is a weapon, acquire the required proficiency of the weapon
			if( item.isWeapon() ) {
				wlv = item.getWeaponLevel();
			}
			// If it is a cane, acquire the required proficiency of the cane (specified by Kaspar wlv)
			else {
				wlv = ItemControl.getWandLevel(item);
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
}


// Weapon level drawing propriety judgment
var alias1 = ItemSentence.WeaponLevelAndWeight._isWeaponLevelDisplayable;
ItemSentence.WeaponLevelAndWeight._isWeaponLevelDisplayable= function(item) {
		var result = alias1.call( this, item );
		// Weapons work normally
		if( result == true ) {
			return true;
		}
		
		var isWand = item.isWand();
		if( typeof isWandTypeExtra !== 'undefined' ) {
			// Add Weapon Type
			isWand = WandChecker.isWand(item);
		}
		// Returns false if not wand
		if (!isWand) {
			return false;
		}
		
		// Returns true if it is a cane and the weapon level can be displayed in the config
		return DataConfig.isWeaponLevelDisplayable();
}




//---------------------------
// ItemControl class
//---------------------------
// item availability
var alias10 = ItemControl.isItemUsable;
ItemControl.isItemUsable = function(unit, item) {

	// Call the item control.is item usable() processing (original judgment processing, etc.) up to this point
	var result = alias10.call(this, unit, item);

	// If False, the processing up to this point has resulted in an unusable result.
	if( result == false ) {
		return false;
	}

	// After that, we will judge whether the staff can be used according to the required proficiency level of the staff.
    // (The standard judgment such as whether the class can use a staff or not is supposed to have been judged in the original when alias2.call was executed, so it is omitted hereafter.)
	
	var isWand = item.isWand();
	if( typeof isWandTypeExtra !== 'undefined' ) {
		// Add Weapon Type
		isWand = WandChecker.isWand(item);
	}

	if (isWand) {
		// A staff can be used only if the proficiency of the unit exceeds the required proficiency of the staff.
		return this._isWandLevel(unit, item);
	}
	
	return true;
}


ItemControl._isWandLevel= function(unit, item) {
		var unit_wlv;
		var wlv_idx;
		var wand_wlv = ItemControl.getWandLevel(item);
		// If 1 comes back, it's not a wand
		if( wand_wlv < 0 ) {
			return false;
		}

		// Get proficiency index
		wlv_idx = ParamGroup.getParameterIndexFromType(ParamType.WLV);

		// Calling Param bonus.get bonus from weapon loops, so we have our own implementation
		unit_wlv = UnitParameter.WLV.getUnitValue(unit)+UnitParameter.WLV.getParameterBonus(unit.getClass());
		unit_wlv += (UnitParameter.WLV.getUnitTotalParamBonus(unit, item) + StateControl.getStateParameter(unit, wlv_idx));
		unit_wlv = FusionControl.getLastValue(unit, wlv_idx, unit_wlv);

		return unit_wlv >= wand_wlv;
//		return ParamBonus.getBonusFromWeapon(unit, ParamType.WLV, item) >= wand_wlv;
}


// Acquire the required staff proficiency
ItemControl.getWandLevel= function(item) {
		// returns 1 if there are no items
		if( item == null ) {
			return -1;
		}

		var isWand = item.isWand();
		if( typeof isWandTypeExtra !== 'undefined' ) {
			// Add Weapon Type
			isWand = WandChecker.isWand(item);
		}

		// Returns 1 if not a wand
		if( !isWand ) {
			return -1;
		}

		// If there is no Kaspara with the required proficiency on the cane, the required proficiency is set to 0.
		if( typeof item.custom._wlv !== 'number' ) {
			return 0;
		}

		return item.custom._wlv;
}


})();