
/*----------------------------------------------------------------------
  
  *Must be installed as a set with battle talk.js

  how to use:
  Check "Execute code" in "Execute script" of the event command,
  in the text area
  SetBattleTalk( Unit ID, ID created in Custom.ini );
  Write like this.
  
  Example: Set the unit number 0 as the test line in Custom.ini
  SetBattleTalk( 0, 'test' );

  Author:
  o-to
  
  Change log:
  2015/9/23: Create new
  
  2017/02/05:
  Fixed the place where the declaration of the variable used for the for loop was forgotten
  *If there is another script that forgets to declare in the same way, unintended behavior will occur.

----------------------------------------------------------------------*/
// Set the battle dialogue of the specified unit to a dedicated one
function SetBattleTalk(unitID, TalkID)
{
	var list = PlayerList.getMainList();
	var count = list.getCount();
	var i = 0;
	//root.log(count);

	if( TalkID != null && OT_BattleTalkData.CheckCustomData(TalkID) == false )
	{
		root.msg('I tried to set a talk id not listed in Custom.ini.');
		return ;
	}

	for (i = 0; i < count ; i++) {
		var unit = list.getData(i);
		
		if(unit.getId() == unitID)
		{
			unit.custom.OT_BattleTalkID = TalkID;
			return;
		}
	}

	// Enemies can also be set
	list = EnemyList.getMainList();
	count = list.getCount();
	for (i = 0; i < count ; i++) {
		var unit = list.getData(i);
		
		//root.log(unit.getId() + ':' + unit.getName());

		if(unit.getId() == unitID)
		{
			unit.custom.OT_BattleTalkID = TalkID;
			return;
		}
	}

	// others
	list = AllyList.getMainList();
	count = list.getCount();
	for (i = 0; i < count ; i++) {
		var unit = list.getData(i);

		if(unit.getId() == unitID)
		{
			unit.custom.OT_BattleTalkID = TalkID;
			return;
		}
	}
}
