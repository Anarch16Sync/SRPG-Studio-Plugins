
/*----------------------------------------------------------------------
  
00_Increase Wand Types

■Overview
　Normaly only the Item type with Id = 0 is considered like the Staff item type for staff users.
 With this plugin is possible to add more item types the function as Staves, and make different classes use different Staff Types.

■ Initial Setup
 In the Item type list, create a new item type and add the custom parameter {isWand:XX} (where XX is equal to 1 or more).
　With this the item type will funtion as a new type of staff and be used with the Staff command.

■ Class customization
　 I want to create two additional "Staff types" and specify whether to use "traditional staff" (id = 0), "additional staff 1", and "additional staff 2" for each class.
　　→ First, set {isWand:1} to the custom parameter of "additional staff 1"
　　　　then add {isWand:2} in the custom parameter of "additional staff 2"

　　　On top of that, for classes that can use staves (Class Details -> Can use Staves)
　　　Set the following in your custom parameters for each case:

　　　　A. A class that wants to use all of "traditional staff", "additional staff 1" and "additional staff 2"
　　　　　　→ You don't have to do anything

　　　　B. A class that only wants to use "additional staff 1"
　　　　　　→ Please put {extraWandId:[1]} in the custom parameter of the class

　　　　C. A class that only wants to use "added wand 2"
　　　　　　→ Please put {extraWandId:[2]} in the custom parameter of the class

　　　　D. A class that wants to use only "traditional staff"
　　　　　　→ Please put {extraWandId:[0]} in the custom parameter of the class

　　　　E. A class that wants to use two types of "traditional staff" and "additional staff 1"
　　　　　　→ Please put {extraWandId:[0,1]} in the custom parameter of the class

　　　　F. A class that wants to use two types of "traditional staff" and "additional staff 2"
　　　　　　→ Please put {extraWandId:[0,2]} in the custom parameter of the class

　　　　G. Classes that want to use 2 types of "additional staff 1" and "additional staff 2"
　　　　　　→ Please put {extraWandId:[1,2]} in the custom parameter of the class


18/12/01 New
18/12/02 You can now specify which of the added "weapon type: staff" can be used in classes that can use staffs.
21/01/10 Compatible with FPEP plug-in
21/09/17 1.244 compatible


■ Correspondence version
　SRPG Studio Version:1.244


■ Terms
・Use is limited to games using SRPG Studio.
・Commercial or non-commercial. Free.
・There is no problem with processing. Please keep remodeling.
・ No credit stated OK
・ Redistribution, reprint OK
・Please comply with the SRPG Studio Terms of Use.
  
----------------------------------------------------------------------*/
//-------------------------------------------------------
// Settings (external)
//-------------------------------------------------------
var isWandTypeExtra = true;				// For judgment with different plug-ins




(function() {
//-------------------------------------------------------
// Setting (for internal use)
//-------------------------------------------------------




//-------------------------------------------------------
// Below is the program
//-------------------------------------------------------

//-----------------------------
// WandChecker class
//-----------------------------
// Determining whether the wand is usable
WandChecker.isWandUsableInternal= function(unit, wand) {
		var obj;
		
		if( this.isWand(wand) == false ) {
			return false;
		}
		
		if (!ItemControl.isItemUsable(unit, wand)) {
			return false;
		}
		
		obj = ItemPackageControl.getItemAvailabilityObject(wand);
		if (obj === null) {
			return false;
		}
		
		return obj.isItemAvailableCondition(unit, wand);
}


// Determining whether it is a cane
WandChecker.isWand= function(item) {
		// If Wand.is wand() is itue, wand (conventional processing)
		if ( item.isWand() == true ) {
			return true;
		}
		
		// Wand checker.is extra wand() if itue wand (additional processing)
		if( this.isExtraWand(item) == true ) {
			return true;
		}
		
		return false;
}


// Added Weapon Type: Cane Cane or (additional processing)
WandChecker.isExtraWand= function(item) {
		// Returns whether or not the added "weapon type: cane"
		return this.isExtraWandWeaponType(item.getWeaponType());
}


// Added Weapon Type: Cane Cane or (additional processing)
WandChecker.isExtraWandWeaponType= function(weaponType) {
		// If the weapon type has a custom parameter {is wand:xx} (xx is 1 or more), it is the added "weapon type: staff"
		var isWand = weaponType.custom.isWand;
		if (typeof isWand === 'number' && isWand >= 1) {
			return true;
		}
		
		return false;
}


// Determining whether a unit that can use normal staffs and a combination of normal staffs
WandChecker.isUnitUsableTargetWand= function(unit, item) {
		// Get wand type id
		var wandTypeId = this.getWandTypeId(item);

		// Returns whether the wand type id matches the usable wand type of the unit
		return this.isUnitUsableWandTypeId( unit, wandTypeId);
}


// Usual Weapon Type: Is it a unit that can use staves (additional processing)
WandChecker.getWandTypeId= function(item) {
		// If the item is a staff, set the staff type id to 0.
		if( item.isWand() == true ) {
			return 0;
		}
		
		// If the weapon type does not have a custom parameter {is wand:xx} (xx is 1 or more) or less than 1, an error (returns 1)
		var isWand = item.getWeaponType().custom.isWand;
		if (typeof isWand !== 'number' || isWand < 1) {
			return -1;
		}
		
		// If the weapon type has a custom parameter {is wand:xx} (xx is 1 or more), that value will be the wand type id
		return isWand;
}


// Usual Weapon Type: Is it a unit that can use staves (additional processing)
WandChecker.isUnitUsableWandTypeId= function(unit, wandTypeId) {
		var i, cnt;
		
		// If the cane type id is 1, it is not a cane, so false
		if ( wandTypeId == -1 ) {
			return false;
		}
		
		// false if the unit is a class that cannot use staffs
		if ( !(unit.getClass().getClassOption() & ClassOptionFlag.WAND) ) {
			return false;
		}
		
		// Match unconditionally if there is no caspara related to the added "weapon type: cane"
        // (If Kaspara is not specified in the class, any staff can be used)
		var extraWandIdArr = this.getExtraWandArray(unit.getClass());
		if( extraWandIdArr == null ) {
			return true;
		}
		
		// true if there is a match for the wand type id in the added "weapon type: wand" array
		cnt = extraWandIdArr.length
		for( i = 0;i < cnt;i++ ) {
			if( extraWandIdArr[i] == wandTypeId ) {
				return true;
			}
		}
		
		// true if there is a match for the wand type id in the added "weapon type: wand" array
		return false;
}


// Get an array of available "weapon type: cane" from class Caspar
WandChecker.getExtraWandArray= function(cls) {
		var extraWandId = cls.custom.extraWandId;
		
		// null if there is no array in the class caspara
		if( typeof extraWandId === 'undefined' ) {
			return null;
		}
		
		return extraWandId;
}




//--------------------------------------------
// BaseItemInfo class
//--------------------------------------------
var alias10 = BaseItemInfo.getItemTypeName;
BaseItemInfo.getItemTypeName= function(name) {
		if( WandChecker.isExtraWand(this._item) ) {
			return name + StringTable.ItemWord_SuffixWand;
		}
		return alias10.call(this, name);
}




//--------------------------------------------
// StateScoreChecker class
//--------------------------------------------
var alias20 = StateScoreChecker._getFlagData;
StateScoreChecker._getFlagData= function(unit, flag) {
		var data = alias20.call(this, unit, flag);
		
		var i, item;
		var count = UnitItemControl.getPossessionItemCount(unit);
		
		for (i = 0; i < count; i++) {
			item = UnitItemControl.getItem(unit, i);
			if (item === null) {
				continue;
			}
			
			if (flag & BadStateFlag.WAND) {
				if (ItemControl.isItemUsable(unit, item) && WandChecker.isExtraWand(item)) {
					data.wand++;
				}
			}
		}
		
		return data;
}




//--------------------------------------------
// ItemControl class
//--------------------------------------------
// Check if a unit can use an item
var alias30 = ItemControl.isItemUsable;
ItemControl.isItemUsable= function(unit, item) {
		var result = alias30.call(this, unit, item);
		
		// If it is not a cane, end with conventional processing
		if (!WandChecker.isWand(item)) {
			return result;
		}
		
		// In the case of a cane, false if not combined with a class that can use that cane
		if( !WandChecker.isUnitUsableTargetWand(unit, item) == true ) {
			return false;
		}
		
		// After this, the judgment will be made in the class where the cane can be used.
		
		// Normal canes are already checked, so the result is returned as is.
		if (!WandChecker.isExtraWand(item)) {
			return result;
		}
		
		// Weapon type added: Cane only, check the unchecked parts
		
		// false if ep is not enough
		if( this._isEpEnough(unit, item) !== true ) {
			return false;
		}
		
		// false if Fp is not enough
		if( this._isFpEnough(unit, item) !== true ) {
			return false;
		}
		
		// Check if an item is prohibited
		if (StateControl.isBadStateFlag(unit, BadStateFlag.ITEM)) {
			return false;
		}
		
		// If the item is a wand, the class must be able to use wands
		if (!(unit.getClass().getClassOption() & ClassOptionFlag.WAND)) {
			return false;
		}
		
		// Find out if the use of canes is prohibited
		if (StateControl.isBadStateFlag(unit, BadStateFlag.WAND)) {
			return false;
		}
		
		if (item.getItemType() === ItemType.KEY) {
			if (item.getKeyInfo().isAdvancedKey()) {
				// For "Private Key", the class must be able to use the key
				if (!(unit.getClass().getClassOption() & ClassOptionFlag.KEY)) {
					return false;
				}
			}
		}
		
		// Look up "private data"
		if (!this.isOnlyData(unit, item)) {
			return false;
		}
		
		return true;
}


// Get a key item containing a flag from the items in the unit's possession
ItemControl.getKeyItem= function(unit, flag) {
		var i, item, info, isKey;
		var count = UnitItemControl.getPossessionItemCount(unit);
		
		// Examine items in order.
		// Items in front have priority.
		for (i = 0; i < count; i++) {
			item = UnitItemControl.getItem(unit, i);
			if (item === null) {
				continue;
			}
			
			if (!item.isWeapon() && item.getItemType() === ItemType.KEY && this.isItemUsable(unit, item)) {
				isKey = false;
				info = item.getKeyInfo();
				
				// Does not return items if it is a wand
				if (!WandChecker.isWand(item)) {
					if (info.getKeyFlag() & flag) {
						isKey = true;
					}
					else {
						isKey = false;
					}
				}
				
				if (isKey) {
					return item;
				}
			}
		}
		
		return null;
}


// Check if Ep is enough
ItemControl._isEpEnough= function(unit, item) {
		
		// true if no ep stats
		if( typeof ParamType.MEP === 'undefined' ) {
			return true;
		}
		
		// true if the item does not specify ep
		if( item.custom.OT_EP == null ) {
			return true;
		}
		
		var unitEp = 0;
		if (typeof unit.custom.tmpNowEp === 'number') {
			unitEp = parseInt(unit.custom.tmpNowEp)
		}
		
		var unitMaxEp = 0;
		if (typeof unit.custom.tmpMaxEp === 'number') {
			unitMaxEp = parseInt(unit.custom.tmpMaxEp);
		}
		
		// Calculate ep consumption of items
		var itemEp = this._getValueForExtraWand( item.custom.OT_EP.Use, unitMaxEp );
		
		if(itemEp > 0) {
			if(typeof unit.custom.tmpMoveEP === 'number') {
				itemEp += unit.custom.tmpMoveEP;
			}
		}
		
		// The condition is that the ep of the unit exceeds the ep consumption of the item.
		return unitEp >= itemEp;
}


// Check if Fp is enough
ItemControl._isFpEnough= function(unit, item) {
		
		// true if there are no Fp stats
		if( typeof ParamType.MFP === 'undefined' ) {
			return true;
		}
		
		// true if the item does not specify fp
		if( item.custom.OT_FP == null ) {
			return true;
		}
		
		var unitFp = 0;
		if (typeof unit.custom.tmpNowFp === 'number') {
			unitFp = parseInt(unit.custom.tmpNowFp)
		}
		
		var unitMaxFp = 0;
		if (typeof unit.custom.tmpMaxFp === 'number') {
			unitMaxFp = parseInt(unit.custom.tmpMaxFp);
		}
		
		// Calculate item consumption fp
		var itemFp = this._getValueForExtraWand( item.custom.OT_FP.Use, unitMaxFp );
		
		if(itemFp > 0) {
			if(typeof unit.custom.tmpMoveFP === 'number') {
				itemFp += unit.custom.tmpMoveFP;
			}
		}
		
		// The condition is that the unit's fp exceeds the item's consumption fp
		return unitFp >= itemFp;
}


// Get the normalized value of Epfp
ItemControl._getValueForExtraWand = function(value, valueMax)
{
	if( value == null ) {
		return 0;
	}
	
	if (typeof value === 'number') {
		return parseInt(value);
	}
	
	var regex = /^([\-]*[0-9]+)\%$/;
	var regexNum = /^([\-]*[0-9]+)$/;
	
	if(value.match(regex)) {
		var percent = parseInt(RegExp.$1);
		var num = Math.floor( valueMax * (percent / 100) );

		return parseInt(num);
	}
	else if( value.match(regexNum) ) {
		return parseInt(value);
	}
	
	return 0;
}




//--------------------------------------------
// ItemSelectMenu class
//--------------------------------------------
var alias40 = ItemSelectMenu._isItemUsable;
ItemSelectMenu._isItemUsable= function(item) {
		
		// Disable the added staff from the item column
		if (WandChecker.isExtraWand(item)) {
			return false;
		}
		
		return alias40.call(this, item);
}




//--------------------------------------------
// Calculator class
//--------------------------------------------
var alias50 = Calculator.calculateRecoveryItemPlus;
Calculator.calculateRecoveryItemPlus= function(unit, targetUnit, item) {
		var plus = alias50.call(this, unit, targetUnit, item);
		var itemType = item.getItemType();
		
		if (itemType !== ItemType.RECOVERY && itemType !== ItemType.ENTIRERECOVERY) {
			return plus;
		}
		
		// If the item is a staff added, add the user's magical power
		if (WandChecker.isExtraWand(item)) {
			plus = ParamBonus.getMag(unit);
		}
		
		return plus;
}


var alias60 = Calculator.calculateDamageItemPlus;
Calculator.calculateDamageItemPlus= function(unit, targetUnit, item) {
		var plus = alias50.call(this, unit, targetUnit, item);

		var damageInfo, damageType;
		var itemType = item.getItemType();
		
		if (itemType !== ItemType.DAMAGE) {
			return plus;
		}

		damageInfo = item.getDamageInfo();
		damageType = damageInfo.getDamageType();
		// If the item is a staff added, add the user's magical power
		if (WandChecker.isExtraWand(item)) {
			if (damageType === DamageType.MAGIC) {
				plus = ParamBonus.getMag(unit);
			}
		}
		
		return plus;
}


})();