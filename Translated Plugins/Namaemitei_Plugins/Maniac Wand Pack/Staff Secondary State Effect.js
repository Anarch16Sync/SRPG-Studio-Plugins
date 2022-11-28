
/*----------------------------------------------------------------------
  
　Wand secondary State Effect

■Overview
　When creating HP recovery , Full recovery, Damage, Unlock, Again, Teleportation,
  Rescue, Resurrection, Repair, Inflict State, Cure State, Fusion or Transform Staves/items,
　you will be able to add the option to Add and/or Cure specific effects to the Staff User and/or Target
 on top of the normal effect of the item.

■ How to use
　1. Create a Staff/item.
　2. If you set {removestateid:XX} (where XX is the value of the state ID) with a custom parameter on the staff/item,
　　　"The specified state of the user is canceled" when using the staff.
　　　*Currently, only one state can be specified per item.
　3. If you set {addstateid:YY} (YY is the value of the state ID) with a custom parameter to the Staff/item,
　　　When using a staff, "a specified state is given to the user".
　　　*Currently, only one state can be specified per item.
　4. If you set {targetremovestateid:XX} (where XX is the value of the state ID) as a custom parameter to a Staff/item with a scope of "Specify or All",
　　　When using a staff, "the specified state of the target is canceled".
　　　*Currently, only one state can be specified for each type of Staff/item.
　5. If you set {targetaddstateid:YY} (where YY is the value of the state ID) in a custom parameter to a Staff/item with a a scope of "Specify or All",
　　　When using a staff, "specified state is given to the target.
　　　*Currently, only one state can be specified for each type of Staff/item.

　　　If you want to do both grant and release at the same time
　　　It is OK if you write like {removestateid:XX, addstateid:YY, targetremovestateid:AA, targetaddstateid:BB}


Fixes
20/06/09 New creation
20/10/03 Added a custom parameter that gives a state to the staff user
20/10/03b Made it possible to grant/remove states to the user even with state imparting staves and state recovery staves.
21/07/04 Added a custom parameter that grants/removes a state to the target of the staff (item)


■ Correspondence version
　SRPG Studio Version:1.218


■ Terms
・Use is limited to games using SRPG Studio.
・Commercial or non-commercial. Free.
・There is no problem with processing. Please keep remodeling.
・ No credit stated OK
・ Redistribution, reprint OK
・ Posted on wiki OK
・Please comply with the SRPG Studio Terms of Use.
  
----------------------------------------------------------------------*/


(function() {

//---------------------------------------------------
// setting
//---------------------------------------------------




//---------------------------------------------------
// program
//---------------------------------------------------


//--------------------------------------------
// DamageItemUse class
//--------------------------------------------
var alias10 = DamageItemUse.enterMainUseCycle;
DamageItemUse.enterMainUseCycle= function(itemUseParent) {
		var itemTargetInfo = itemUseParent.getItemTargetInfo();
		var item = itemTargetInfo.item;
		
		// If the wand has a custom parameter to cancel the state, cancel the specified state of the user
		if( WandStateRemoveControl.isRemoveState(item) === true ) {
			WandStateRemoveControl.removeState(item, itemTargetInfo.unit);
		}
		
		// If the cane has a custom parameter for giving a state, give the specified state to the user
		if( WandStateRemoveControl.isAddState(item) === true ) {
			WandStateRemoveControl.addState(item, itemTargetInfo.unit);
		}
		
		// If the cane has a custom parameter for canceling the target state, cancel the specified state of the target
		if( WandStateRemoveControl.isRemoveStateTarget(item) === true ) {
			WandStateRemoveControl.removeStateTarget(item, itemTargetInfo.targetUnit);
		}
		
		// If the cane has a custom parameter for giving a state to the target, the specified state is given to the target
		if( WandStateRemoveControl.isAddStateTarget(item) === true ) {
			WandStateRemoveControl.addStateTarget(item, itemTargetInfo.targetUnit);
		}
		
		return alias10.call(this, itemUseParent);
}




//--------------------------------------------
// DurabilityChangeItemUse class
//--------------------------------------------
var alias20 = DurabilityChangeItemUse.enterMainUseCycle;
DurabilityChangeItemUse.enterMainUseCycle= function(itemUseParent) {
		var itemTargetInfo = itemUseParent.getItemTargetInfo();
		var item = itemTargetInfo.item;
		
		// If the wand has a custom parameter to cancel the state, cancel the specified state of the user
		if( WandStateRemoveControl.isRemoveState(item) === true ) {
			WandStateRemoveControl.removeState(item, itemTargetInfo.unit);
		}
		
		// If the staff has a custom parameter for giving a state, give the specified state to the user
		if( WandStateRemoveControl.isAddState(item) === true ) {
			WandStateRemoveControl.addState(item, itemTargetInfo.unit);
		}
		
		// If the cane has a custom parameter for canceling the target state, cancel the specified state of the target
		if( WandStateRemoveControl.isRemoveStateTarget(item) === true ) {
			WandStateRemoveControl.removeStateTarget(item, itemTargetInfo.targetUnit);
		}
		
		// If the cane has a custom parameter for giving a state to the target, the specified state is given to the target
		if( WandStateRemoveControl.isAddStateTarget(item) === true ) {
			WandStateRemoveControl.addStateTarget(item, itemTargetInfo.targetUnit);
		}
		
		return alias20.call(this, itemUseParent);
}




//--------------------------------------------
// EntireRecoveryItemUse Class
//--------------------------------------------
var alias30 = EntireRecoveryItemUse.enterMainUseCycle;
EntireRecoveryItemUse.enterMainUseCycle= function(itemUseParent, animeData) {
		var itemTargetInfo = itemUseParent.getItemTargetInfo();
		var item = itemTargetInfo.item;
		
		// If the wand has a custom parameter to cancel the state, cancel the specified state of the user
		if( WandStateRemoveControl.isRemoveState(item) === true ) {
			WandStateRemoveControl.removeState(item, itemTargetInfo.unit);
		}
		
		// If the staff has a custom parameter for giving a state, give the specified state to the user
		if( WandStateRemoveControl.isAddState(item) === true ) {
			WandStateRemoveControl.addState(item, itemTargetInfo.unit);
		}
		
		// If the cane has a custom parameter for canceling the target state, cancel the specified state of the target
		if( WandStateRemoveControl.isRemoveStateTarget(item) === true ) {
			WandStateRemoveControl.removeStateTarget(item, itemTargetInfo.targetUnit);
		}
		
		// If the cane has a custom parameter for giving a state to the target, the specified state is given to the target
		if( WandStateRemoveControl.isAddStateTarget(item) === true ) {
			WandStateRemoveControl.addStateTarget(item, itemTargetInfo.targetUnit);
		}
		
		return alias30.call(this, itemUseParent, animeData);
}




//--------------------------------------------
// FusionItemUse class
//--------------------------------------------
var alias40 = FusionItemUse.enterMainUseCycle;
FusionItemUse.enterMainUseCycle= function(itemUseParent) {
		var itemTargetInfo = itemUseParent.getItemTargetInfo();
		var item = itemTargetInfo.item;
		
		// If the wand has a custom parameter to cancel the state, cancel the specified state of the user
		if( WandStateRemoveControl.isRemoveState(item) === true ) {
			WandStateRemoveControl.removeState(item, itemTargetInfo.unit);
		}
		
		// If the staff has a custom parameter for giving a state, give the specified state to the user
		if( WandStateRemoveControl.isAddState(item) === true ) {
			WandStateRemoveControl.addState(item, itemTargetInfo.unit);
		}
		
		// If the cane has a custom parameter for canceling the target state, cancel the specified state of the target
		if( WandStateRemoveControl.isRemoveStateTarget(item) === true ) {
			WandStateRemoveControl.removeStateTarget(item, itemTargetInfo.targetUnit);
		}
		
		// If the cane has a custom parameter for giving a state to the target, the specified state is given to the target
		if( WandStateRemoveControl.isAddStateTarget(item) === true ) {
			WandStateRemoveControl.addStateTarget(item, itemTargetInfo.targetUnit);
		}
		
		return alias40.call(this, itemUseParent);
}




//--------------------------------------------
// KeyItemUse class
//--------------------------------------------
var alias50 = KeyItemUse.enterMainUseCycle;
KeyItemUse.enterMainUseCycle= function(itemUseParent) {
		var itemTargetInfo = itemUseParent.getItemTargetInfo();
		var item = itemTargetInfo.item;
		
		// If the wand has a custom parameter to cancel the state, cancel the specified state of the user
		if( WandStateRemoveControl.isRemoveState(item) === true ) {
			WandStateRemoveControl.removeState(item, itemTargetInfo.unit);
		}
		
		// If the staff has a custom parameter for giving a state, give the specified state to the user
		if( WandStateRemoveControl.isAddState(item) === true ) {
			WandStateRemoveControl.addState(item, itemTargetInfo.unit);
		}
		
		// If the cane has a custom parameter for canceling the target state, cancel the specified state of the target
		if( WandStateRemoveControl.isRemoveStateTarget(item) === true ) {
			WandStateRemoveControl.removeStateTarget(item, itemTargetInfo.targetUnit);
		}
		
		// If the cane has a custom parameter for giving a state to the target, the specified state is given to the target
		if( WandStateRemoveControl.isAddStateTarget(item) === true ) {
			WandStateRemoveControl.addStateTarget(item, itemTargetInfo.targetUnit);
		}
		
		return alias50.call(this, itemUseParent);
}




//--------------------------------------------
// MetamorphozeItemUse Class
//--------------------------------------------
var alias60 = MetamorphozeItemUse.enterMainUseCycle;
MetamorphozeItemUse.enterMainUseCycle= function(itemUseParent) {
		var itemTargetInfo = itemUseParent.getItemTargetInfo();
		var item = itemTargetInfo.item;
		
		// If the wand has a custom parameter to cancel the state, cancel the specified state of the user
		if( WandStateRemoveControl.isRemoveState(item) === true ) {
			WandStateRemoveControl.removeState(item, itemTargetInfo.unit);
		}
		
		// If the staff has a custom parameter for giving a state, give the specified state to the user
		if( WandStateRemoveControl.isAddState(item) === true ) {
			WandStateRemoveControl.addState(item, itemTargetInfo.unit);
		}
		
		// If the cane has a custom parameter for canceling the target state, cancel the specified state of the target
		if( WandStateRemoveControl.isRemoveStateTarget(item) === true ) {
			WandStateRemoveControl.removeStateTarget(item, itemTargetInfo.targetUnit);
		}
		
		// If the cane has a custom parameter for giving a state to the target, the specified state is given to the target
		if( WandStateRemoveControl.isAddStateTarget(item) === true ) {
			WandStateRemoveControl.addStateTarget(item, itemTargetInfo.targetUnit);
		}
		
		return alias60.call(this, itemUseParent);
}




//--------------------------------------------
// QuickItemUse class
//--------------------------------------------
var alias70 = QuickItemUse.enterMainUseCycle;
QuickItemUse.enterMainUseCycle= function(itemUseParent) {
		var itemTargetInfo = itemUseParent.getItemTargetInfo();
		var item = itemTargetInfo.item;
		
		// If the wand has a custom parameter to cancel the state, cancel the specified state of the user
		if( WandStateRemoveControl.isRemoveState(item) === true ) {
			WandStateRemoveControl.removeState(item, itemTargetInfo.unit);
		}
		
		// If the staff has a custom parameter for giving a state, give the specified state to the user
		if( WandStateRemoveControl.isAddState(item) === true ) {
			WandStateRemoveControl.addState(item, itemTargetInfo.unit);
		}
		
		// If the cane has a custom parameter for canceling the target state, cancel the specified state of the target
		if( WandStateRemoveControl.isRemoveStateTarget(item) === true ) {
			WandStateRemoveControl.removeStateTarget(item, itemTargetInfo.targetUnit);
		}
		
		// If the cane has a custom parameter for giving a state to the target, the specified state is given to the target
		if( WandStateRemoveControl.isAddStateTarget(item) === true ) {
			WandStateRemoveControl.addStateTarget(item, itemTargetInfo.targetUnit);
		}
		
		return alias70.call(this, itemUseParent);
}




//--------------------------------------------
// RecoveryItemUse class
//--------------------------------------------
var alias80 = RecoveryItemUse.enterMainUseCycle;
RecoveryItemUse.enterMainUseCycle= function(itemUseParent) {
		var itemTargetInfo = itemUseParent.getItemTargetInfo();
		var item = itemTargetInfo.item;
		
		// If the wand has a custom parameter to cancel the state, cancel the specified state of the user
		if( WandStateRemoveControl.isRemoveState(item) === true ) {
			WandStateRemoveControl.removeState(item, itemTargetInfo.unit);
		}
		
		// If the staff has a custom parameter for giving a state, give the specified state to the user
		if( WandStateRemoveControl.isAddState(item) === true ) {
			WandStateRemoveControl.addState(item, itemTargetInfo.unit);
		}
		
		// If the cane has a custom parameter for canceling the target state, cancel the specified state of the target
		if( WandStateRemoveControl.isRemoveStateTarget(item) === true ) {
			WandStateRemoveControl.removeStateTarget(item, itemTargetInfo.targetUnit);
		}
		
		// If the cane has a custom parameter for giving a state to the target, the specified state is given to the target
		if( WandStateRemoveControl.isAddStateTarget(item) === true ) {
			WandStateRemoveControl.addStateTarget(item, itemTargetInfo.targetUnit);
		}
		
		return alias80.call(this, itemUseParent);
}




//--------------------------------------------
// RescueItemUse class
//--------------------------------------------
var alias90 = RescueItemUse.enterMainUseCycle;
RescueItemUse.enterMainUseCycle= function(itemUseParent) {
		var itemTargetInfo = itemUseParent.getItemTargetInfo();
		var item = itemTargetInfo.item;
		
		// If the wand has a custom parameter to cancel the state, cancel the specified state of the user
		if( WandStateRemoveControl.isRemoveState(item) === true ) {
			WandStateRemoveControl.removeState(item, itemTargetInfo.unit);
		}
		
		// If the staff has a custom parameter for giving a state, give the specified state to the user
		if( WandStateRemoveControl.isAddState(item) === true ) {
			WandStateRemoveControl.addState(item, itemTargetInfo.unit);
		}
		
		// If the cane has a custom parameter for canceling the target state, cancel the specified state of the target
		if( WandStateRemoveControl.isRemoveStateTarget(item) === true ) {
			WandStateRemoveControl.removeStateTarget(item, itemTargetInfo.targetUnit);
		}
		
		// If the cane has a custom parameter for giving a state to the target, the specified state is given to the target
		if( WandStateRemoveControl.isAddStateTarget(item) === true ) {
			WandStateRemoveControl.addStateTarget(item, itemTargetInfo.targetUnit);
		}
		
		return alias90.call(this, itemUseParent);
}




//--------------------------------------------
// ResurrectionItemUse class
//--------------------------------------------
var alias100 = ResurrectionItemUse.enterMainUseCycle;
ResurrectionItemUse.enterMainUseCycle= function(itemUseParent) {
		var itemTargetInfo = itemUseParent.getItemTargetInfo();
		var item = itemTargetInfo.item;
		
		// If the wand has a custom parameter to cancel the state, cancel the specified state of the user
		if( WandStateRemoveControl.isRemoveState(item) === true ) {
			WandStateRemoveControl.removeState(item, itemTargetInfo.unit);
		}
		
		// If the staff has a custom parameter for giving a state, give the specified state to the user
		if( WandStateRemoveControl.isAddState(item) === true ) {
			WandStateRemoveControl.addState(item, itemTargetInfo.unit);
		}
		
		// If the cane has a custom parameter for canceling the target state, cancel the specified state of the target
		if( WandStateRemoveControl.isRemoveStateTarget(item) === true ) {
			WandStateRemoveControl.removeStateTarget(item, itemTargetInfo.targetUnit);
		}
		
		// If the cane has a custom parameter for giving a state to the target, the specified state is given to the target
		if( WandStateRemoveControl.isAddStateTarget(item) === true ) {
			WandStateRemoveControl.addStateTarget(item, itemTargetInfo.targetUnit);
		}
		
		return alias100.call(this, itemUseParent);
}




//--------------------------------------------
// TeleportationItemUse class
//--------------------------------------------
var alias110 = TeleportationItemUse.enterMainUseCycle;
TeleportationItemUse.enterMainUseCycle= function(itemUseParent) {
		var itemTargetInfo = itemUseParent.getItemTargetInfo();
		var item = itemTargetInfo.item;
		
		// If the wand has a custom parameter to cancel the state, cancel the specified state of the user
		if( WandStateRemoveControl.isRemoveState(item) === true ) {
			WandStateRemoveControl.removeState(item, itemTargetInfo.unit);
		}
		
		// If the staff has a custom parameter for giving a state, give the specified state to the user
		if( WandStateRemoveControl.isAddState(item) === true ) {
			WandStateRemoveControl.addState(item, itemTargetInfo.unit);
		}
		
		// If the cane has a custom parameter for canceling the target state, cancel the specified state of the target
		if( WandStateRemoveControl.isRemoveStateTarget(item) === true ) {
			WandStateRemoveControl.removeStateTarget(item, itemTargetInfo.targetUnit);
		}
		
		// If the cane has a custom parameter for giving a state to the target, the specified state is given to the target
		if( WandStateRemoveControl.isAddStateTarget(item) === true ) {
			WandStateRemoveControl.addStateTarget(item, itemTargetInfo.targetUnit);
		}
		
		return alias110.call(this, itemUseParent);
}




//--------------------------------------------
// StateItemUse class
//--------------------------------------------
var alias120 = StateItemUse.enterMainUseCycle;
StateItemUse.enterMainUseCycle= function(itemUseParent) {
		var itemTargetInfo = itemUseParent.getItemTargetInfo();
		var item = itemTargetInfo.item;
		
		// If the wand has a custom parameter to cancel the state, cancel the specified state of the user
		if( WandStateRemoveControl.isRemoveState(item) === true ) {
			WandStateRemoveControl.removeState(item, itemTargetInfo.unit);
		}
		
		// If the staff has a custom parameter for giving a state, give the specified state to the user
		if( WandStateRemoveControl.isAddState(item) === true ) {
			WandStateRemoveControl.addState(item, itemTargetInfo.unit);
		}
		
		// If the cane has a custom parameter for canceling the target state, cancel the specified state of the target
		if( WandStateRemoveControl.isRemoveStateTarget(item) === true ) {
			WandStateRemoveControl.removeStateTarget(item, itemTargetInfo.targetUnit);
		}
		
		// If the cane has a custom parameter for giving a state to the target, the specified state is given to the target
		if( WandStateRemoveControl.isAddStateTarget(item) === true ) {
			WandStateRemoveControl.addStateTarget(item, itemTargetInfo.targetUnit);
		}
		
		return alias120.call(this, itemUseParent);
}




//--------------------------------------------
// StateRecoveryItemUse class
//--------------------------------------------
var alias130 = StateRecoveryItemUse.enterMainUseCycle;
StateRecoveryItemUse.enterMainUseCycle= function(itemUseParent) {
		var itemTargetInfo = itemUseParent.getItemTargetInfo();
		var item = itemTargetInfo.item;
		
		// If the wand has a custom parameter to cancel the state, cancel the specified state of the user
		if( WandStateRemoveControl.isRemoveState(item) === true ) {
			WandStateRemoveControl.removeState(item, itemTargetInfo.unit);
		}
		
		// If the staff has a custom parameter for giving a state, give the specified state to the user
		if( WandStateRemoveControl.isAddState(item) === true ) {
			WandStateRemoveControl.addState(item, itemTargetInfo.unit);
		}
		
		// If the cane has a custom parameter for canceling the target state, cancel the specified state of the target
		if( WandStateRemoveControl.isRemoveStateTarget(item) === true ) {
			WandStateRemoveControl.removeStateTarget(item, itemTargetInfo.targetUnit);
		}
		
		// If the cane has a custom parameter for giving a state to the target, the specified state is given to the target
		if( WandStateRemoveControl.isAddStateTarget(item) === true ) {
			WandStateRemoveControl.addStateTarget(item, itemTargetInfo.targetUnit);
		}
		
		return alias130.call(this, itemUseParent);
}




//--------------------------------------------
// WandStateControl class
//--------------------------------------------
var WandStateRemoveControl = {
	isAddState: function(item) {
		var stateid;
		
		if( item == null ) {
			return false;
		}
		
		stateid = item.custom.addstateid;
		if( typeof stateid === 'number' ) {
			return true;
		}
		
		return false;
	},
	
	addState: function(item, unit) {
		var stateid;
		
		if( item == null ) {
			return;
		}
		
		if( unit == null ) {
			return;
		}
		
		stateid = item.custom.addstateid;
		if( typeof stateid !== 'number' ) {
			return;
		}
		
		this._addStateFromStateId(unit, stateid);
	},
	
	isRemoveState: function(item) {
		var stateid;
		
		if( item == null ) {
			return false;
		}
		
		stateid = item.custom.removestateid;
		if( typeof stateid === 'number' ) {
			return true;
		}
		
		return false;
	},
	
	removeState: function(item, unit) {
		var stateid;
		
		if( item == null ) {
			return;
		}
		
		if( unit == null ) {
			return;
		}
		
		stateid = item.custom.removestateid;
		if( typeof stateid !== 'number' ) {
			return;
		}
		
		this._removeStateFromStateId(unit, stateid);
	},
	
	isAddStateTarget: function(item) {
		var stateid;
		
		if( item == null ) {
			return false;
		}
		
		stateid = item.custom.targetaddstateid;
		if( typeof stateid === 'number' ) {
			return true;
		}
		
		return false;
	},
	
	addStateTarget: function(item, unit) {
		var stateid;
		
		if( item == null ) {
			return;
		}
		
		if( unit == null ) {
			return;
		}
		
		stateid = item.custom.targetaddstateid;
		if( typeof stateid !== 'number' ) {
			return;
		}
		
		this._addStateFromStateId(unit, stateid);
	},
	
	isRemoveStateTarget: function(item) {
		var stateid;
		
		if( item == null ) {
			return false;
		}
		
		stateid = item.custom.targetremovestateid;
		if( typeof stateid === 'number' ) {
			return true;
		}
		
		return false;
	},
	
	removeStateTarget: function(item, unit) {
		var stateid;
		
		if( item == null ) {
			return;
		}
		
		if( unit == null ) {
			return;
		}
		
		stateid = item.custom.targetremovestateid;
		if( typeof stateid !== 'number' ) {
			return;
		}
		
		this._removeStateFromStateId(unit, stateid);
	},
	
	_addStateFromStateId: function(unit, stateid) {
		var state;
		
		if( unit != null && typeof stateid === 'number' ) {
			state = this._getStateFromId(stateid);
			if( state != null ) {
				StateControl.arrangeState(unit, state, IncreaseType.INCREASE);
			}
		}
	},
	
	_removeStateFromStateId: function(unit, stateid) {
		var state;
		
		if( unit != null && typeof stateid === 'number' ) {
			state = this._getStateFromId(stateid);
			if( state != null ) {
				StateControl.arrangeState(unit, state, IncreaseType.DECREASE);
			}
		}
	},
	
	_getStateFromId: function(stateId) {
		return root.getBaseData().getStateList().getDataFromId(stateId);
	}
}


})();