/* 
ExtraItem ClassWeaponList
Author: Anarch16Sync

Overview: 
This plugin is a companion to ExtraItem Command and handles the display of the new usable item type on the unit window.


Dev Note:
If you created copies of ExtraItem Command to have more than 1 ExtraItem, you need to add a  new block for the addition of that item type to the weaponlist.

Changelog:

2024-03-24 ver 1.0 
Separeted from ExtraItem Command as it's own file

Terms of Use: 
This plugin is provided as is, use at your own discretion. Redistribution and modification is OK.

*/

(function() {

WeaponTypeRenderer.drawClassWeaponList = function(x, y, cls) {
    var i, data, handle;
		var refList = cls.getEquipmentWeaponTypeReferenceList();
		var count = refList.getTypeCount();
		
		for (i = 0; i < count; i++) {
			data = refList.getTypeData(i);
			handle = data.getIconResourceHandle();
			GraphicsRenderer.drawImage(x + (i * 30), y, handle, GraphicsType.ICON);
		}
		
		if (cls.getClassOption() & ClassOptionFlag.WAND) {
			handle = this._getWandIcon();
			GraphicsRenderer.drawImage(x + (i * 30), y, handle, GraphicsType.ICON)
            i+=1;
		}

        //Block for addition of ExtraItemA16S icon on the usable weapon list (can be copy-pasted and edited when having multiple ExtraItems)
        if (cls.custom.UseExtraItemA16S){
            handle = this._getExtraItemA16SIcon();
			GraphicsRenderer.drawImage(x + (i * 30), y, handle, GraphicsType.ICON)
        }
}

})();