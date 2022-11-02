
/*--------------------------------------------------------------------------
  
Adds a setting for prohibited units to the map.

   how to use:
   In custom parameter of map information
   { OT_NGSortie:{ unit ID: flag, unit ID: flag, … } }
   and set.
   If the flag is 0, the sortie is allowed, and if it is 1, the sortie is prohibited.
  
   * The sortie prohibition flag for units set on the map is
     Priority over the sortie ban flag setting for each unit in EventNGSortie.js
  
   Author:
   o-to
  
   Change log:
   2015/9/6: Create new
  
--------------------------------------------------------------------------*/

var OT_NGSortieColor = 0x006296;

(function() {

UnitSortieListScrollbar.playSelectSound = function() {
	var object = this.getObject();
	var isSelect = true;
	
	if (this._isForceSortie(object) || this._isNGForceSortie(object)) {
		isSelect = false;
	}
	else if (SceneManager.getActiveScene().getSortieSetting().getSortieCount() === root.getCurrentSession().getCurrentMapInfo().getSortieMaxCount()) {
		if (object.getSortieState() === SortieType.SORTIE) {
			isSelect = true;
		}
		else {
			isSelect = false;
		}
	}
	
	if (isSelect) {
		MediaControl.soundDirect('commandselect');
	}
	else {
		MediaControl.soundDirect('operationblock');
	}
};

var alias1 = UnitSortieListScrollbar._getSortieColor;
UnitSortieListScrollbar._getSortieColor = function(object) {
	if (this._isNGForceSortie(object)) {
		return OT_NGSortieColor;
	}

	return alias1.call(this, object);
};
	
UnitSortieListScrollbar._isNGForceSortie = function(object) {
	return SceneManager.getActiveScene().getSortieSetting().isNGForceSortie(object);
};

SortieSetting._setInitialUnitPos = function() {
	var i, unit;
	var list = PlayerList.getAliveList();
	var count = list.getCount();
	var maxCount = this._sortiePosArray.length;
	var sortieCount = 0;
	
	// isFirstSetup returns false if you save even once in the battle preparation screen of the current map
	if (!root.getMetaSession().isFirstSetup()) {
		// Initialize unit of _sortiePosArray based on current unit position
		this._arrangeUnitPos();
		return;
	}
	
	// When the battle preparation screen is displayed for the first time, the sortie status is automatically set by the subsequent processing.
	
	this._clearSortieList();
	
	// Forced sortie (position specified) units to sortie state in order
	for (i = 0; i < count && sortieCount < maxCount; i++) {
		unit = list.getData(i);
		if (this.isForceSortie(unit)) {
			if (this._sortieFixedUnit(unit)) {
				sortieCount++;
			}
		}
	}
	
	// Forced sortie (no position specified) units to sortie state in order
	for (i = 0; i < count && sortieCount < maxCount; i++) {
		unit = list.getData(i);
		if (this.isForceSortie(unit) && unit.getSortieState() !== SortieType.SORTIE) {
			if (this._sortieUnit(unit)) {
				sortieCount++;
			}
		}
	}
	
	// Place units other than sortie-prohibited units in sortie state in order.
	for (i = 0; i < count && sortieCount < maxCount; i++) {
		unit = list.getData(i);
		if (!this.isNGForceSortie(unit) && unit.getSortieState() !== SortieType.SORTIE) {
			if (this._sortieUnit(unit)) {
				sortieCount++;
			}
		}
	}
	
};

var alias2 = SortieSetting.setSortieMark;
SortieSetting.setSortieMark = function(index) {
	var list = PlayerList.getAliveList();
	var unit = list.getData(index);
	
	if ( this.isNGForceSortie(unit) )
	{	
		//root.log( unit.getId() );
		return false;
	}
	
	return alias2.call(this, index);
};

SortieSetting.isNGForceSortie = function(unit) {	
	var i, forceSortie;
	var mapInfo = root.getCurrentSession().getCurrentMapInfo();
	var NGSortie = mapInfo.custom.OT_NGSortie;
	var NGSortieList = root.getMetaSession().global.OT_NGSortieList;

	// Confirmation of character sortie prohibition in map settings
	if( NGSortie != null )
	{
		//root.log( unit.getId() );
		for (var j in NGSortie)
		{
			//root.log( j + NGSortie[j] );
			if( unit.getId() == j )
			{
				if( NGSortie[j] == 1 )
				{
					return true;
				}
				else if( NGSortie[j] == 0 )
				{
					return false;
				}
			}
		}
	}

	// Characters banned from sorties in event settings
	if( NGSortieList != null )
	{
		for (var j in NGSortieList)
		{
			//root.log( j + NGSortieList[j] );
			if ( unit.getId() == j && NGSortieList[j] == 1 ) {
				return true;
			}
		}
	}
	
	return false;
};
	
})();

