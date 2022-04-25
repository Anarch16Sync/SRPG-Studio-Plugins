/*  NoFusion Transformation

Author: Anarch16Sync

Overview: 
Allows a way to disable unit transformation while carrying another unit (Fusion).
 
 The custom parameters is added to the transformation data (Config -> Transformation -> Custom Parameters).
 This makes that transformation disabled while the unit is carrying another unit.

Custom Parameter:
{noFusion:true}

Changelog:

ver 1.0 (20/04/2020)
Created

Terms of Use: 
This plugin is provided as is, use at your own discretion. Redistribution and modification is OK.
*/

(function() {
	var aliasMetamorphozeAllowed = MetamorphozeControl.isMetamorphozeAllowed;
	MetamorphozeControl.isMetamorphozeAllowed = function(unit, metamorphozeData){
		noFusion=metamorphozeData.custom.noFusion;
		if (noFusion == true){
			return (aliasMetamorphozeAllowed.call(this, unit, metamorphozeData)) && (unit.getUnitStyle().getFusionChild() == null);
		}
		return (aliasMetamorphozeAllowed.call(this, unit, metamorphozeData))
	};
})();