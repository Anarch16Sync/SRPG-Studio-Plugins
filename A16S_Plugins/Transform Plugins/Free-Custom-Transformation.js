
/*  Free Custom Transformation

Author: Anarch16Sync

Overview: 
Adding the custom parameter {FreeTrans:true} to a Transformation allows to take different actions after transforming and canceling the transformation.
(Works like Trade or Convoy commands)

Custom Parameter:
{FreeTrans:true}

Changelog:

ver 1.0 (20/04/2020)
Created


Terms of Use: 
This plugin is provided as is, use at your own discretion. Redistribution and modification is OK.
*/

//Alias of the original UnitCommand.Metamorphoze._moveEvent funtion to use it when there isn't a custom parameter.
var metamorphoseAlias = UnitCommand.Metamorphoze._moveEvent;

UnitCommand.Metamorphoze._moveEvent = function() {
	var FreeMetamorphoze=this._metamorphozeData.custom.FreeTrans;
	if (FreeMetamorphoze === true){
		var result = this._dynamicEvent.moveDynamicEvent();
		if (result === MoveResult.END) {
			// For trading items, after trading it, it isn't immediately a wait mode, but mark it with some sort of operation has been done.
			this.setExitCommand(this);
					
			// With trading items, commands which can be executed may be increased, so rebuild it.
			this.rebuildCommand();
		}
		return result;
	}else{
		return (metamorphoseAlias.call(this))
	}
};

//Alias of MetamorphozeCancel
var metamorphoseCancelAlias = UnitCommand.MetamorphozeCancel;

UnitCommand.MetamorphozeCancel = defineObject(UnitListCommand,
	{
		_dynamicEvent: null,
		//Added this metamorphozeData because It needs to be saved before the openCommand is executed so that moveCommand can read it.
		_metamorphozeData: null,

		openCommand: function() {
			// This function has no return value, so no need to Return the call
			metamorphoseCancelAlias.openCommand.call(this)
		},
		
		//Added the conditions for the custom parameter
		moveCommand: function() {
			var FreeMetamorphoze=this._metamorphozeData.custom.FreeTrans;
			if (FreeMetamorphoze === true){
				if (this._dynamicEvent.moveDynamicEvent() !== MoveResult.CONTINUE) {
					// For trading items, after trading it, it isn't immediately a wait mode, but mark it with some sort of operation has been done.
					this.setExitCommand(this);
								
					// With trading items, commands which can be executed may be increased, so rebuild it.
					this.rebuildCommand();
					return MoveResult.END;
				}
				return MoveResult.CONTINUE;
			}else{
				return metamorphoseCancelAlias.moveCommand.call(this)
			}
		},
		
		drawCommand: function() {
		},
		
		//make it use this._metamorphozeData so it saves the value for later
		isCommandDisplayable: function() {
			this._metamorphozeData = MetamorphozeControl.getMetamorphozeData(this.getCommandTarget());
			
			return metamorphoseCancelAlias.isCommandDisplayable.call(this);
		},
		
		getCommandName: function() {
			return metamorphoseCancelAlias.getCommandName.call(this);
		},
		
		isRepeatMoveAllowed: function() {
			return metamorphoseCancelAlias.isRepeatMoveAllowed.call(this);
		}
	}
	);
