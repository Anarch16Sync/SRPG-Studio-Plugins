/*--------------------------------------------------------------------------

Location event: do not wait to enter the arena without a weapon.


■■ Overview.
　When an opponent does not want to fight in the arena or when a unit without a weapon tries to join the arena.
　Allows the user to select the command again without going into standby mode.

■ Usage.
　This script must be used in conjunction with the arena-like.js.

　The script has a command name set at "var BattlingCommandText = ['arena','ahhhh'];" in the configuration of this script.
　If there is a location event, the arena result is referenced.
　If the arena result is anything other than "Player wins, enemy wins, draw (both alive), both dead, give up".
　It will no longer be placed in standby status.
　(i.e. if the arena result is no battle or a value other than the above, it will not wait).

■ Customisation.
　1. to prevent the arena from waiting for a location event called "Battling" when the result is "no battle or any other value than the above" as in the arena
　　Change 'ahhhh' in 'var BattlingCommandText = ['arena','ahhhh'];' in the configuration of this script to 'battling'.
　　Then add the command Battling in Data Settings → Config → String Settings and
　　Simply select battling when setting the location event.

　　The 'ah ah' in var BattlingCommandText is prepared for adding commands, so there is no need to create a command called 'ah ah'.

　2. you want to prepare three or more corresponding commands.
　　For example, if you want to add a command called 'good good', then you need to create a command called
　　in the configuration of this script.
　　'var BattlingCommandText = ['Arena','Tournament','ahhhh'];'
　　Add something like "var BattlingCommandText = ['arena','Tournament','ahhhh','good good'];".


Fixed by.
25/08/16 New.
17/06/18 Fixed a bug that caused error failures in location events that completed instantly (e.g. just the map chip changes).

Version supported.
　SRPG Studio Version:1.089
　SRPG Studio Version:1.133


■Terms and Conditions.
Use is limited to games that use SRPG Studio.
Commercial and non-commercial use is not required. Free of charge.
No problem with modification, etc. Please modify it as much as you like.
No credits OK.
Redistribution and reprinting OK
Wiki-Posting OK
The SRPG Studio Terms of Use must be observed.


--------------------------------------------------------------------------*/

(function() {

//-------------------------------
// Configuration
//-------------------------------
var BattlingCommandText = ['Arena','Tournament','ahhhh'];




//-------------------------------------------
// UnitCommand.PlaceCommand class.
//-------------------------------------------
UnitCommand.PlaceCommand.moveCommand= function() {
		var result = MoveResult.CONTINUE;
		
		if (this._capsuleEvent.moveCapsuleEvent() !== MoveResult.CONTINUE) {
			// Attempting to participate in the arena without a weapon
			if( this.isBattlingNoFinish() == true ) {
				// Rebuild, as there may be more commands that can be executed.
				this.rebuildCommand();
			}
			// otherwise
			else {
				this.endCommandAction();
			}
			return MoveResult.END;
		}
		
		return result;
}


// Determining whether the arena command has been terminated (occurs when attempting to join without a weapon).
UnitCommand.PlaceCommand.isBattlingNoFinish= function() {
		var i;
		var battleResult = VATableControlForBattlingPlace.getVATable(Battling_ID_PAGE, BattlingResult_ID);

		// Returns false if not an arena command.
		if( !this.isBattlingCommand() ) {
			return false;
		}

		// Return false if the result of the arena is "Player wins, enemy wins, draw (both alive), both dead, give up".
		if( battleResult == BattlingResult_WinPlayer || 
			battleResult == BattlingResult_WinEnemy  || 
			battleResult == BattlingResult_Draw      || 
			battleResult == BattlingResult_DoubleKO  || 
			battleResult == BattlingResult_GiveUp ) {
				return false;
		}
		// Returns true if the arena result is "no battle or any value other than the above".
		return true;
}


// Determining whether the command name of the location event is the arena command name set in BattlingCommandText.
UnitCommand.PlaceCommand.isBattlingCommand= function() {
		var i;
		var commandText = this._capsuleEvent.getPlaceEventCommandText();

		if( commandText != null ) {
			for( i = 0;i < BattlingCommandText.length;i++ ) {
				if( commandText == BattlingCommandText[i] ) {
					return true;
				}
			}
		}
		return false;
}




//-------------------------------------------
// CapsuleEvent class
//-------------------------------------------
// Get event type.
CapsuleEvent.getEventType= function() {
		// Returns -1 if this._event is empty (to return a value that does not match the EventType).
		if( this._event == null ) {
			return -1;
		}
		return this._event.getEventType();
}


// Get PlaceEventInfo for location events.
CapsuleEvent.getPlaceEventInfo= function() {
		if( this.getEventType() != EventType.PLACE ) {
			return null;
		}
		return this._event.getPlaceEventInfo();
}


//Get command name for location event
CapsuleEvent.getPlaceEventCommandText= function() {
		var place_event_info = this.getPlaceEventInfo();
		if( place_event_info == null ) {
			return null;
		}
		return place_event_info.getCommandText();
}




//-------------------------------------------
// VATableControlForBattlingPlace class
//-------------------------------------------
var VATableControlForBattlingPlace = {

	// Setting of designated variables
	setVATable: function(tablepage, tableid, value) {
		var table = root.getMetaSession().getVariableTable(tablepage);
		var index = table.getVariableIndexFromId(tableid);
		table.setVariable(index, value);
	},
	
	// Obtaining specified variables
	getVATable: function(tablepage, tableid) {
		var table = root.getMetaSession().getVariableTable(tablepage);
		var index = table.getVariableIndexFromId(tableid);
		return table.getVariable(index);
	}
};


})();