
/*----------------------------------------------------------------------
  
　01 Skill: Item Master
　*The file name has been changed due to conflict measures.

■Overview
　Skill: You can create an item master.
　Friendly units with this skill can select attacks, exchanges, stocks, etc. after using a "non-staff" item. 
　(Item version of unit command.js that does not wait after execution)


■ Preparation
　With this script in your plugin, you need to do the following:

　1. Create a custom skill and put 'item_master' in the keyword.
　2. Give your unit the skill.

　I want to be able to use the item command more than once in a turn:
　If you put {useMax:XX} (XX is a number greater than 1) in the custom parameter of the custom skill, you can use the item command multiple times.
　(Example)
  {useMax:2}
  You can use the item command twice without spending your turn.


■ Customization
　1. I want to change the custom skill keyword
　　　Please rewrite "item_master" in var SKILL_ITEM_MASTER_NAME = 'item_master'; in the settings.
　　　(If you change the keyword, you need to replace the keyword on the custom skill side as well.)

　2. I want to change the item that does not wait /the item that waits
　　　Please rewrite true or false for each item type in var item_master_item_type_arr = in the settings.
　　　If it is true, it will not wait, and if it is false, it will wait (currently only custom is fixed to false)
　　　Item type: Custom is targeted by changing false to true in var item_master_CustomItemEnable = false;


16/06/06 New
16/06/07 Skill: Fixed a bug where a unit that does not have an item master consumes the item used twice.
　　　　　Staff skill: Removed from Item Master scope
18/12/01 Compatible with "00_Weapon type: Increase staff.js"
22/03/20 Changed to be able to set how many times the item master can be used at once. Fixed a bug that teleportation items do not work properly
22/03/21 Fixed some formatting
22/03/21b Fixed a bug that the item master did not work well due to a mistake in processing UnitCommand.Item._completeCommandMemberData


■ Correspondence version
　SRPG Studio Version:1.254


■ Terms
・Use is limited to games using SRPG Studio.
・Commercial or non-commercial. Free.
・There is no problem with processing. Please keep remodeling.
・ No credits OK
・ Redistribution, reprint OK
・Please comply with the SRPG Studio Terms of Use.
  
----------------------------------------------------------------------*/
(function() {

//-------------------------------
// setting
//-------------------------------
var SKILL_ITEM_MASTER_NAME = 'item_master';		// skill name


// Change true to false in the array below to wait after using an item.
// If you change the false in the following array to true, it will not wait after using the item.
// However, even if teleportation, rescue, resuscitation, overall recovery, unlocking, and action recovery are set to true, it seems to wait if the experience value at the time of use is 0.
// (There may be other conditions, but they have not been verified.)
var item_master_item_type_arr = [
//  Unusable   HP recovery  Full recovery   Damage    Stat Boosting
	false,         true,        false,       true,     true, 
//  Class Change Learn Skill   unlock       Again
	true,          true,        false,       false,
//  Teleportation Rescue      Resurrection  Repair
	false,         false,       false,       true,
//  Steal    Inflict State   Cure State     Switch
	true,          true,        true,        true,
// Fusion 		Transform
	true,          true
];

// Item type: Does the effect of item master appear after using a custom one?
var item_master_CustomItemEnable = false;		// true: item master has effect false: no effect (as usual)




//--------------------------------------------------
// UnitCommand class
//--------------------------------------------------
var alias01 = UnitCommand.openListCommandManager;
UnitCommand.openListCommandManager= function() {
		this.initItemUsed();
		this.initItemUsedMax();
		this._itemTempCommand = null;

		alias01.call(this);
}


var alias02 = UnitCommand.getExitCommand
UnitCommand.getExitCommand= function() {
		var command = alias02.call(this);
		
		if( command !== null ) {
			return command;
		}
		
		if( this._itemTempCommand !== null ) {
			return this._itemTempCommand;
		}
		
		return command;
}


// Initialize item usage count
UnitCommand.initItemUsed= function() {
		this._itemUseCnt = 0;
}


// Item use count +1
UnitCommand.incItemUsed= function() {
		this._itemUseCnt++;
}


// Setting the maximum number of times items can be used
UnitCommand.initItemUsedMax= function() {
		this._itemUseMax = 1;
		
		var unit = this.getListCommandUnit();
		var skill = SkillControl.getPossessionCustomSkill(unit, SKILL_ITEM_MASTER_NAME);
		if( skill ){
			var useMax = skill.custom.useMax;
			if( typeof useMax === 'number' && useMax > 1 ) {
				this._itemUseMax = useMax;
			}
		}
}


// Return item used status (true: item used false: item not used)
UnitCommand.isItemUsed= function() {
		return this._itemUseCnt >= this._itemUseMax;
}


// Evacuate item commands
UnitCommand.setItemTempCommand= function(command) {
		this._itemTempCommand = command;
}


//--------------------------------------------------
// UnitListCommand class
//--------------------------------------------------
// Item use count +1 (used in lower classes)
UnitListCommand.incItemUsed= function() {
		this._listCommandManager.incItemUsed();
}


// Returns the status of the item used flag (used by lower class)
UnitListCommand.isItemUsed= function() {
		return this._listCommandManager.isItemUsed();
}


// Save item command (used in lower class)
UnitListCommand.setItemTempCommand= function(command) {
		this._listCommandManager.setItemTempCommand(command);
}




//--------------------------------------------------
// UnitCommand.Item class
//--------------------------------------------------
// Item use
var alias10 = UnitCommand.Item._moveUse;
UnitCommand.Item._moveUse= function() {
		var skill;
		var skill_enable = false;
		var item = this._itemSelectMenu.getSelectItem();
		var type = item.getItemType();
		var isWand = item.isWand();
		if( typeof isWandTypeExtra !== 'undefined' ) {
			// Add Weapon Type
			isWand = WandChecker.isWand(item);
		}
		
		// If the item is something other than a staff, the effect of Item Master is applied.
		if( !isWand ) {
			// Item type: Non-custom
			if (type != ItemType.CUSTOM) {
				skill_enable = item_master_item_type_arr[type];
			}
			// Item type: Custom
			else {
				skill_enable = item_master_CustomItemEnable;
			}
			
			// Skill: If you have Item Master, just finish executing the command.
			skill = this._itemMasterSkill;
			if( skill && skill_enable ){
				if (this._itemUse.moveUseCycleNoDecreaseItem() !== MoveResult.CONTINUE) {
					// Since we called move use cycle no decrease item that does not consume items, consume items explicitly
					this._itemUse.decreaseItem();
					
					// Item use count +1
					this.incItemUsed();
					this.setItemTempCommand(this);
					
					if( this.isItemUsed() === true ) {
						// It doesn't immediately go to standby, but marks it as having performed some operation.
						this.setExitCommand(this);
					}
					
					// It is possible that the number of executable commands has increased, so rebuild
					this.rebuildCommand();
					return MoveResult.END;
				}
				
				return MoveResult.CONTINUE;
			}
		}
		
		// Conventional processing if you do not have the item master
		return alias10.call(this);
}


// Command display judgment
var alias11 = UnitCommand.Item.isCommandDisplayable;
UnitCommand.Item.isCommandDisplayable= function() {
		// Cannot be displayed if the item has been used
		if( this.isItemUsed() ) {
			return false;
		}
		
		// Normal processing if the item is not used
		return alias11.call(this);
}


var alias12 = UnitCommand.Item._completeCommandMemberData;
UnitCommand.Item._completeCommandMemberData= function() {
		alias12.call(this);
		
		// Skill: Acquire Item Master in advance
		this._itemMasterSkill = SkillControl.getPossessionCustomSkill(this.getCommandTarget(), SKILL_ITEM_MASTER_NAME);
}




//--------------------------------------------------
// ItemUseParent class
//--------------------------------------------------
// moveUseCycle without consuming items
ItemUseParent.moveUseCycleNoDecreaseItem= function() {
		if (InputControl.isStartAction()) {
			this.setItemSkipMode(true);
		}
		
		if (this._straightFlow.moveStraightFlow() !== MoveResult.CONTINUE) {
			if (this._itemTargetInfo.isPlayerSideCall) {
			// Via commands through items and staffs on your side,
			// By unconditionally disabling the skip here, the skip will not affect subsequent operations (attacks, etc.).
				this.setItemSkipMode(false);
			}
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
}


})();