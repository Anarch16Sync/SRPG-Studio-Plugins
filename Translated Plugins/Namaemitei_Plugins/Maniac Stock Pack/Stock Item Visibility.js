
/*----------------------------------------------------------------------
  
　Stock_Item Display Change

■Overview
　When you put in or take out an item from the stock side or when you switch weapon types
　The text color of the item becomes darker when the weapon tool on the unit side cannot be used.


Fixes
20/01/11 Create new
20/01/23 Corrected that when switching units during stock operation, the item list was displayed from the beginning and the cursor position remained unchanged
20/05/16 Support for combined use with Mr. Kyuub's "Summary of stock and unit exchange screens"
20/05/21 Added the corresponding process again because the combined use process with stock category summary.js was missing


■ Correspondence version
　SRPG Studio Version:1.211


■ Terms
・Use is limited to games using SRPG Studio.
・Commercial or non-commercial. Free.
・There is no problem with processing. Please keep remodeling.
・ No credit stated OK
・ Redistribution, reprint OK
・ Wiki OK OK
・Please comply with the SRPG Studio Terms of Use.
  
----------------------------------------------------------------------*/
(function() {
//--------------------------------------
// Configuration
//--------------------------------------




//--------------------------------------------------
// Below is the program part
//--------------------------------------------------


//--------------------------------------
// StockItemTradeScreen class
//--------------------------------------
var alias01 = StockItemTradeScreen._prepareScreenMemberData;
StockItemTradeScreen._prepareScreenMemberData= function(screenParam) {
		alias01.call(this, screenParam);
		
		// regenerate the stock window
		this._stockItemWindow = createWindowObject(ItemListWindowByEquipInfluence, this);
		// Set the target unit in the stock window
		this._stockItemWindow.setUnit(this._unit);
}


var alias02 = StockItemTradeScreen._moveOperation;
StockItemTradeScreen._moveOperation= function() {
		var result = alias02.call(this);
		var yScroll, cnt, weapontype;
		
		// If the current unit and the unit in the stock window are different, reset the unit and update the stock data.
		if (this._unit !== this._stockItemWindow.getUnit()) {
			this._stockItemWindow.setUnit(this._unit);
			
			// (Added for combined use with Mr. Kyuub's stock and unit exchange screen)
			if (typeof this._stockItemWindow.setExceptUnit !== 'undefined' ) {
				this._stockItemWindow.setExceptUnit(this._unit);
			}
			
			// When switching units, save the amount of y scroll movement
			yScroll = this._stockItemWindow.getItemScrollbar().getScrollYValue();
			
			// If it is an old stock screen, call the conventional process
			if( this._stockCategory == null ) {
				this._stockItemWindow.setStockItemFormation();
			}
			// If the weapon type display stock screen, call the processing for the weapon type
			else {
				weapontype = this._stockCategory.getWeaponType();
				this._stockItemWindow.setStockItemFormationFromWeaponType(weapontype);
			}
			
			// When switching units, restore the amount of y scroll movement
			cnt = this._stockItemWindow.getItemScrollbar().getObjectCount();
			if( yScroll >= cnt ) {
				// Correct the scroll position if the scroll position ≥ the number of stock items
				yScroll = cnt - this._stockItemWindow.getItemScrollbar().getRowCount();
			}
			this._stockItemWindow.getItemScrollbar().setScrollYValue(yScroll);
		}
		
		return result;
}




//--------------------------------------
// ItemListWindow class
// (Added for combined use with Mr. Kyuub's stock and unit exchange screen)
//--------------------------------------
ItemListWindow.getUnit= function() {
	return this._unit;
}

ItemListWindow.setUnit= function(unit) {
	this._unit = unit;
}




//--------------------------------------
// ItemListWindowByEquipInfluence class
//--------------------------------------
// In the window on the stock side, darken the color when weapons and tools are not equipped or usable
var ItemListWindowByEquipInfluence = defineObject(ItemListWindow,
{
	_unit: null,
	
	initialize: function() {
		// change the scrollbar class to call
		this._scrollbar = createScrollbarObject(ItemListScrollbarByEquipInfluence, this);
	},
	
	getUnit: function() {
		return this._unit;
	},
	
	setUnit: function(unit) {
		this._unit = unit;
	},
	
	setStockItemFormation: function() {
		this._scrollbar.setStockItemFormation(this._unit);
		this._scrollbar.enablePageChange();
	},
	
	setStockItemFormationFromWeaponType: function(weapontype) {
		this._scrollbar.setStockItemFormationFromWeaponType(weapontype, this._unit);
	}
}
);




//--------------------------------------
// ItemListScrollbarByEquipInfluence class
//--------------------------------------
// The scroll bar on the stock side darkens the color when weapons and tools are equipped/unusable.
var ItemListScrollbarByEquipInfluence = defineObject(ItemListScrollbar,
{
	setStockItemFormation: function(unit) {
		var i;
		var maxCount = StockItemControl.getStockItemCount();
		
		this._unit = null;
		if( unit != null ) {
			this._unit = unit;
		}
		
		
		this.resetScrollData();
		
		for (i = 0; i < maxCount; i++) {
			this.objectSet(StockItemControl.getStockItem(i));
		}
		
		this.objectSetEnd();
		
		this.resetAvailableData();
	},
	
	setStockItemFormationFromWeaponType: function(weapontype, unit) {
		var i, item;
		var maxCount = StockItemControl.getStockItemCount();
		
		this._unit = null;
		if( unit != null ) {
			this._unit = unit;
		}
		
		this.resetScrollData();
		
		for (i = 0; i < maxCount; i++) {
			item = StockItemControl.getStockItem(i);
			if (item.getWeaponType() === weapontype) {
				this.objectSet(item);
			}
			// Combined check with stock category summary
			else if (typeof this._isEaualCategoryGroup !== 'undefined' && this._isEaualCategoryGroup(item.getWeaponType(), weapontype) == true) {
				this.objectSet(item);
			}
		}
		
		this.objectSetEnd();
		
		this.resetAvailableData();
	}
}
);


})();