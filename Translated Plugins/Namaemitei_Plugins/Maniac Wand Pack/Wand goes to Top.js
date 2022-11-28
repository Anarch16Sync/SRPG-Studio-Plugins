
/*----------------------------------------------------------------------
  
　Plugin to put used staff on top

■Overview
　The staff used with the staff command will now move to the top of the staffs you have.


17/08/28 New
17/12/01 Fixed a bug where used wands were sometimes not on top of wands
18/12/01 Compatible with "00_Weapon type: Increase staff.js"


■ Correspondence version
　SRPG Studio Version:1.198


■ Terms
・Use is limited to games using SRPG Studio.
・Commercial or non-commercial. Free.
・There is no problem with processing. Please keep remodeling.
・ No credit stated OK
・ Redistribution, reprint OK
・Please comply with the SRPG Studio Terms of Use.
  
----------------------------------------------------------------------*/
(function() {

//----------------------------------------
// setting
//----------------------------------------




//----------------------------------------
// UnitCommand.Wand Class
//----------------------------------------
var alias1 = UnitCommand.Wand.endCommandAction;
UnitCommand.Wand.endCommandAction= function() {
		alias1.call(this);

		// change the position of the cane
		this._exchangeWandIndex();
}


var alias2 = UnitCommand.Wand._prepareCommandMemberData;
UnitCommand.Wand._prepareCommandMemberData= function() {
		alias2.call(this);
		
		// Clear the evacuation area of ​​the staff used
		this._useWand = null;
}


var alias3 = UnitCommand.Wand._useItem;
UnitCommand.Wand._useItem= function() {
		alias3.call(this);
		
		// Set the wand used in the evacuation area
		this._useWand = this._itemSelectMenu.getSelectWand();
}


// Gets the number of wands that the specified unit possesses and can use.
UnitCommand.Wand._getUsableWandCount= function(unit) {
		var i, item;
		var count = UnitItemControl.getPossessionItemCount(unit);
		var wandCnt = 0;
		var isWand;
		
		for (i = 0; i < count; i++) {
			item = UnitItemControl.getItem(unit, i);
			if (item !== null) {
				isWand = item.isWand();
				if( typeof isWandTypeExtra !== 'undefined' ) {
					// Add Weapon Type
					isWand = WandChecker.isWand(item);
				}

				if (isWand == true) {
					if (ItemControl.isItemUsable(unit, item) == true) {
						wandCnt++;
					}
				}
			}
		}
		
		return wandCnt;
}


// Get the position of the specified staff among the items possessed by the unit.
UnitCommand.Wand._getUseWandIndex= function(unit, targetItem) {
		var i, item, count;
		
		if (unit === null || targetItem === null) {
			return -1;
		}
		
		count = UnitItemControl.getPossessionItemCount(unit);

		// Check if the target item is in possession of the unit
		for (i = 0; i < count; i++) {
			item = UnitItemControl.getItem(unit, i);
			if (item === targetItem) {
				return i;
			}
		}
		
		return -1;
}


// Get the position of the first cane owned by the unit
UnitCommand.Wand._getFirstWandIndex= function(unit) {
		var i, item;
		var count = UnitItemControl.getPossessionItemCount(unit);
		var isWand;
		
		for (i = 0; i < count; i++) {
			item = UnitItemControl.getItem(unit, i);
			if (item !== null) {
				isWand = item.isWand();
				if( typeof isWandTypeExtra !== 'undefined' ) {
					// Add Weapon Type
					isWand = WandChecker.isWand(item);
				}
				
				if (isWand == true) {
					if (ItemControl.isItemUsable(unit, item) == true) {
						return i;
					}
				}
			}
		}
		
		return -1;
}


})();




UnitCommand.Wand._exchangeWandIndex= function() {
		var item1, item2;
		var unit = this.getCommandTarget();
		var useWandIndex = this._getUseWandIndex(unit, this._useWand);			// Get the position of the wand used (if it is 1, the wand is broken and does not exist)
		var firstWandIndex = this._getFirstWandIndex(unit);						// Get the position of the leading staff (1 means no staff)
		
		// If there are 2 or more wands that can be used, and the used wand is not at the top and is not lost, replace it with the wand at the top.
		if( this._getUsableWandCount(unit) >= 2 ) {
			if( useWandIndex != -1 && firstWandIndex != -1 ){
				if( useWandIndex != firstWandIndex ){
					item1 = UnitItemControl.getItem(unit, useWandIndex);		// Get used wand
					item2 = UnitItemControl.getItem(unit, firstWandIndex);		// get the wand at the top
					
					UnitItemControl.setItem(unit, useWandIndex, item2);			// Set the cane at the top to the position of the used cane
					UnitItemControl.setItem(unit, firstWandIndex, item1);		// Set the cane used in the position of the cane at the top
				}
			}
		}
}


