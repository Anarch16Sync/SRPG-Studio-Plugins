
/*----------------------------------------------------------------------
  
　Put together stock categories

■Overview
　Weapon types can be grouped by category group.
　It is also possible to display an image as an icon that is not the weapon type icon displayed in the stock classification.
　(Fire, wind, and thunder can be used as logic magic, and by preparing separate icon images for logic magic)

■ How to use
　Enter the custom parameter {categoryGroup:XX} (where XX is a number) for the weapon types you want to group together.
　Enter the same number for all weapon types that you want to be in the same group.
　(Example) If you want to group Weapon Types: Fire, Wind, and Lightning, put {categoryGroup:1} in the Custom Parameter for Weapon Types: Fire, Wind, and Lightning.

　If you want to create multiple groups, change the number of {categoryGroup:XX} for each group.
　(Example) Weapon type: Fire, Wind, Thunder group is {categoryGroup:1}, Weapon type: Recovery staff, Baste staff group is {categoryGroup:2}
　　　　Each can be grouped together as a separate group.

　You can also change the stock category icon.
　In that case, create a folder called CategoryGroupIcon in the Material folder, put a 24*24 dot png image to be used for the icon, and then
　Write {categoryGroup:1, categoryImg:'XXXX.png'} in the weapon type custom parameter.

　(Example) If you want to replace the weapon type: fire, wind, lightning group (categoryGroup: 1) icon with magic.png in CategoryGroupIcon,
　　　　Enter {categoryGroup:1, categoryImg:'magic.png'} in custom parameters for weapon types: fire, wind, and lightning.


Fixes
18/11/17 New creation


■ Correspondence version
　SRPG Studio Version:1.197


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

//---------------------------------------------------------------
// setting
//---------------------------------------------------------------
CATEGORY_GROUP_SETTING = {
	  Folder        : 'CategoryGroupIcon'			// Folder name created in the Material folder
};




//---------------------------------------------------------------
// Program related
//---------------------------------------------------------------


//---------------------------------------
// StockCategory class
//---------------------------------------
var alias01 = StockCategory._drawWeaponType;
StockCategory._drawWeaponType= function(x, y, object, isSelect) {
		// If the custom parameter {group icon: 'file name'} does not specify an icon image for the weapon type, it will be processed as usual.
		var imgText = object.custom.groupIcon;
		if( typeof imgText === 'undefined' ) {
			return alias01.call(this, x, y, object, isSelect);
		}
		
		// If an icon image is specified in the custom parameter {group icon:'file name'} for the weapon type, the icon image in the material folder is displayed.
		var pic = root.getMaterialManager().createImage(CATEGORY_GROUP_SETTING.Folder, imgText);
		if( pic === null ) {
			return alias01.call(this, x, y, object, isSelect);
		}
		
		var width = pic.getWidth();
		var height = pic.getHeight();
		pic.drawStretchParts(x, y, width, height, 0, 0, width, height);
}


StockCategory._getWeaponTypeArray= function() {
		var i, j, list, count, weapontype;
		var arr = [];
		
		for (i = 0; i < 4; i++) {
			list = root.getBaseData().getWeaponTypeList(i);
			count = list.getCount();
			for (j = 0; j < count; j++) {
				weapontype = list.getData(j);
				// Add if there is no registered weapon type and registered custom parameter {category group:xx}
				if (this._isWeaponTypeAllowed(weapontype) && this._isUsedCategoryGroup(arr, weapontype) == false ) {
					arr.push(weapontype);
				}
			}
		}
		
		return arr;
}


// Is there already registered custom parameter {category group:xx} in the array?
StockCategory._isUsedCategoryGroup= function(arr, weapontype) {
		var i, cnt, usedGroup;
		var categoryGroup = weapontype.custom.categoryGroup;
		
		// Returns false if weapontype has no custom parameter {category group:xx}
		if( typeof categoryGroup === 'undefined' ) {
			return false;
		}
		
		cnt = arr.length;
		for( i = 0;i < cnt;i++ ) {
			// If there is no custom parameter {category group:xx} in the array arr, go to the next data
			usedGroup = arr[i].custom.categoryGroup;
			if( typeof usedGroup === 'undefined' ) {
				continue;
			}

			// Returns true if the custom parameter in array arr matches the custom parameter in weapontype
			if( usedGroup == categoryGroup ) {
				return true;
			}
		}
		
		// Check all arrays and return false if none exist
		return false;
}




//---------------------------------------
// ItemListScrollbar class
//---------------------------------------
ItemListScrollbar.setStockItemFormationFromWeaponType= function(weapontype) {
		var i, item;
		var maxCount = StockItemControl.getStockItemCount();
		
		this._unit = null;
		
		this.resetScrollData();
		
		for (i = 0; i < maxCount; i++) {
			item = StockItemControl.getStockItem(i);
			// Add if weapon type matches or custom parameter {category group:xx} matches
			if (item.getWeaponType() === weapontype || this._isEaualCategoryGroup(item.getWeaponType(), weapontype) == true) {
				this.objectSet(item);
			}
		}
		
		this.objectSetEnd();
		
		this.resetAvailableData();
}


// Does custom parameter {category group:xx} match?
ItemListScrollbar._isEaualCategoryGroup= function(itemWeaponType, weapontype) {
		var itemCategoryGroup = itemWeaponType.custom.categoryGroup;
		var categoryGroup = weapontype.custom.categoryGroup;
		
		// Returns false if neither has a custom parameter {category group:xx}
		if( (typeof itemCategoryGroup === 'undefined') || (typeof categoryGroup === 'undefined') ) {
			return false;
		}
		
		// Returns false if custom parameter {category group:xx} does not match
		if( itemCategoryGroup !== categoryGroup ) {
			return false;
		}
		
		// Returns true because the custom parameter {category group:xx} matched
		return true;
}


})();