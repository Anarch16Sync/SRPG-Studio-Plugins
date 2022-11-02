
/*--------------------------------------------------------------------------
  
*Must be installed with MapNGSortie.js

  From "Run Code" in "Run Script"
  You can now set the unit's sortie prohibition flag.
  Characters with a sortie prohibited flag will not be able to select a sortie during sortie preparation.
  Items that can be set as sortie prohibition are as follows.

  ・Set the sortie prohibition flag individually SetNGSortieList( { unit ID:flag, … } );
  ・Sortie prohibited for all characters AllNGSortieList();
  ・Release all character sortie prohibition flag SetNGSortieList();
  ・Prohibit sorties only for sortied characters AddSortieNGSortieList();
  ・Prohibit characters that have not sortied from sortie AddNonSortieNGSortieList();

  how to use
  
  *Sortie ban flag setting:
  Check "Execute code" in "Execute script" of the event command,
  in the text area
  SetNGSortieList(
    { unit ID: flag, unit ID: flag, … }
  );
  Write like this:
  The flag part is 1 to prohibit sortie, 0 to cancel sortie prohibition.
  
  Example: Disable unit number 0, release ban on unit number 2
  SetNGSortieList(
    { 0:1, 2:0 }
  );

  * All characters are prohibited from sortieing:
  Write AllNGSortieList(); in the text area.
  When you want to allow only some characters to sortie (but not forcibly)
  Temporarily prohibit all characters from sortieing with AllNGSortieList()
  It is recommended to set them individually with SetNGSortieList({…}).
  
  * All character sortie ban flag canceled:
  Write SetNGSortieList(); in the text area.

  * Disable sorties only for characters that have sortied:
  Write AddSortieNGSortieList(); in the text area.
  It is used in situations such as dividing troops on multiple maps.
  (If you want to use it, please use it before clearing the map)

  * Prohibit characters that have not sortieed from sortieing:
  Write AddNonSortieNGSortieList(); in the text area.
  When preparing for a sortie on a map with multiple configurations
  Use this when you want to allow only characters that sortied on the previous map.
  (If you want to use it, please use it before clearing the map)

  Author:
  o-to
  
  Change log:
  2015/9/6: Create new
  2016/02/28:
  1.060 compatible, corrected because it was an error due to official function deletion
  
  2017/02/05:
  Fixed the place where the declaration of the variable used for the for loop was forgotten
  *If there is another script that forgets to declare in the same way, unintended behavior will occur.

--------------------------------------------------------------------------*/

// Set sortie prohibition status for the specified unit
function SetNGSortieList(aryList)
{
	//root.log( aryList );
	if( aryList != null )
	{
		if(root.getMetaSession().global.OT_NGSortieList == null)
		{
			root.getMetaSession().global.OT_NGSortieList = {};
		}
		
		for (var j in aryList)
		{
			//root.log( j + aryList[j]);
			root.getMetaSession().global.OT_NGSortieList[j] = aryList[j];
		}
	}
	else
	{
		root.getMetaSession().global.OT_NGSortieList = {};
	}
}

// Disable all unit sorties
function AllNGSortieList()
{
	var list = PlayerList.getMainList();
	var count = list.getCount();
	root.getMetaSession().global.OT_NGSortieList = {};
	
	for (var i = 0; i < count ; i++) {
		root.getMetaSession().global.OT_NGSortieList[i] = 1;
	}

}

// Prohibit sortie units that participated in the battle
function AddSortieNGSortieList()
{
	var list = PlayerList.getSortieList();
	var count = list.getCount();
	if(root.getMetaSession().global.OT_NGSortieList == null)
	{
		root.getMetaSession().global.OT_NGSortieList = {};
	}

	// Put sortie unit into sortie prohibited state
	for (var i = 0; i < count ; i++) {
		var unit = list.getData(i);
		root.getMetaSession().global.OT_NGSortieList[unit.getId()] = 1;
	}
}

// Disable units that are not participating in the battle
function AddNonSortieNGSortieList()
{
	var list = PlayerList.getMainList();
	var count = list.getCount();
	if(root.getMetaSession().global.OT_NGSortieList == null)
	{
		root.getMetaSession().global.OT_NGSortieList = {};
	}

	// Puts units that have not sortie into a sortie prohibited state.
	for (var i = 0; i < count ; i++) {
		var unit = list.getData(i);
		
		if(unit.getSortieState() !== SortieType.SORTIE)
		{
			root.getMetaSession().global.OT_NGSortieList[unit.getId()] = 1;
		}
	}
}

