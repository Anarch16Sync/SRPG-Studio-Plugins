
/*----------------------------------------------------------------------
  
　A script that changes the accuracy of state wands

■Overview
　Makes the accuracy of staffs that give bad states conform to FE.
　(30 + (Magic Power -Enemy Magic Defense) x 5 + Skill -Distance x 2)%)

■ Customization
　1. I want to make only some bad state canes FE compliant
　　　→ After rewriting true of "var alwaysStateWandFE = true;" to false,
　　　　Set the custom parameter {isFEState:1} on the bad state wand you want to have FE compliant shape

　2. I want to change the basic hit rate only for some bad state canes
　　　→ Please set the custom parameter {baseHitForState:XX} (*XX is a number of 0 or more) to the bad state staff whose basic hit rate you want to change.

　3. I want to change the coefficient for user magic power and target magic defense only for some bad state staffs
　　　→ A bad state cane that wants to change the coefficient for the user's magic power and the target's magic defense
　　　　Please set the custom parameter {baseKeisuuForState:XX} (*XX is a number greater than or equal to 0)

　4. I want to change the coefficient for the distance to the target only for some bad state canes
　　　→ For bad state canes that want to change the coefficient for the distance to the target
　　　　Please set the custom parameter {distKeisuuForState:XX} (*XX is a number greater than or equal to 0)

Fixes
17/07/20 New creation
17/07/20b Corrected to round the state hit rate to the range of (minimum hit rate to maximum hit rate)
17/12/06 1.164 compatible
18/12/01 Compatible with "00_Weapon type: Increase staff.js"
19/07/23 Corrected that EnterResult.OK was set to true (Currently EnterResult.OK=true, but it will be strange if it is changed in the future)


■ Correspondence version
　SRPG Studio Version:1.198


■ Terms
・Use is limited to games using SRPG Studio.
・Commercial or non-commercial. Free.
・There is no problem with processing. Please keep remodeling.
・ No credits OK
・ Redistribution, reprint OK
・ Posted on wiki ok
・Please comply with the SRPG Studio Terms of Use.
  
----------------------------------------------------------------------*/
(function() {


//--------------------------------------------
// setting
//--------------------------------------------
var alwaysStateWandFE = true;			// Does the state stick always perform FE type abnormal state processing (true: do false: do not)
var baseHitForState = 30;				// Base Accuracy (default is 30%)
var baseKeisuuForState = 5;				// Coefficient for user magic power and target magic defense (default is magic power *5, magic defense *5)
var distKeisuuForState = 2;				// Coefficient for distance to target (default is distance*2)




//--------------------------------------------
// internal variable
//--------------------------------------------
var StateWandExec = false;				// Fe-type status ailment
var StateWandData = null;				// Variable for holding items during Fe-type status ailments
var StateActive = null;					// Attacker unit retention variable for Fe-type status ailments
var StatePassive = null;				// Variable for holding the attacked unit during Fe-type status ailments


//--------------------------------------------
// StateItemUse class
//--------------------------------------------
StateItemUse.enterMainUseCycle= function(itemUseParent) {
		var generator;
		var result;
		var itemTargetInfo = itemUseParent.getItemTargetInfo();
		var info = itemTargetInfo.item.getStateInfo();
		
		var item = itemTargetInfo.item;
		var unit = itemTargetInfo.unit;
		var targetUnit = itemTargetInfo.targetUnit;
		
		StateWandExec = false;
		// If the cane is an fe-type abnormal state cane and the unit and target unit exist, set the value to the internal variable
		if( CalculatorForState.isFEStateWand(item) && unit != null && targetUnit != null ) {
			StateWandExec = true;
			StateWandData = item;
			StateActive = unit;
			StatePassive = targetUnit;
		}
		
		this._dynamicEvent = createObject(DynamicEvent);
		generator = this._dynamicEvent.acquireEventGenerator();
		generator.unitStateAddition(itemTargetInfo.targetUnit, info.getStateInvocation(), IncreaseType.INCREASE, itemTargetInfo.unit, itemUseParent.isItemSkipMode());
		
		result = this._dynamicEvent.executeDynamicEvent();
		
		// If skip processing is performed during state assignment, clear the flag and exit
		if( result != EnterResult.OK ) {
			StateWandExec = false;
			StateWandData = null;
			StateActive = null;
			StatePassive = null;
		}
		
		return result;
}


var alias1 = StateItemUse.moveMainUseCycle;
StateItemUse.moveMainUseCycle= function() {
		var result = alias1.call(this);
		
		// When the state assignment process is completed, clear the flag and exit
		if( result != MoveResult.CONTINUE ) {
			StateWandExec = false;
			StateWandData = null;
			StateActive = null;
			StatePassive = null;
		}
		
		return result;
}




//--------------------------------------------
// Probability class
//--------------------------------------------
var alias10 = Probability.getInvocationProbability;
Probability.getInvocationProbability= function(unit, type, value) {
		// If it is not a Fe-type status ailment wand, it will be processed as before.
		if( StateWandExec != true ) {
			return alias10.call(this, unit, type, value);
		}
		
		StateWandExec = false;
		
		// Calculate the success rate if it is a Fe-type status ailment wand
		var value = CalculatorForState.getFEStatePercent(StateActive, StateWandData, StatePassive);
		
		// Check if state assignment was successful
		result = Probability.getProbability(value);
// Below is the log for viewing the state data. If you want to check the result, delete //from //root.log
//root.log('result (succeeded in adding state if true):'+result);
		
		return result;
}




//--------------------------------------------
// StateItemPotency class
//--------------------------------------------
var alias20 = StateItemPotency.setPosMenuData;
StateItemPotency.setPosMenuData= function(unit, item, targetUnit) {

		this._isFEStateWand = false;

		// Calculate and set the hit value if the item is a conventional state staff
		if( CalculatorForState.isFEStateWand(item) == false ) {
			alias20.call(this, unit, item, targetUnit);
		}
		// If the item is an fe-type status ailment staff, calculate and set the hit value of the fe-type status ailment staff.
		else {
			this._isFEStateWand = true;
			this._value = CalculatorForState.getFEStatePercent(unit, item, targetUnit);
		}
}


var alias21 = StateItemPotency.drawPosMenuData;
StateItemPotency.drawPosMenuData= function(x, y, textui) {
		var font = textui.getFont();
		
		// If it is an FE type abnormal state staff, draw the hit value
        // If the item is a conventional state cane, the conventional rendering process is performed.
		if (this._isFEStateWand == false ) {
			alias21.call(this, x, y, textui);
		}
		// If it is a Fe-type status ailment staff, draw the hit value
		else {
			TextRenderer.drawKeywordText(x, y, this.getKeywordName(), -1, ColorValue.KEYWORD, font);
			NumberRenderer.drawNumber(x + 65, y, this._value);

			TextRenderer.drawKeywordText(x + 76, y + 1, StringTable.SignWord_Percent, -1, textui.getColor(), font);
		}
}




//--------------------------------------------
// StateItemInfo class
//--------------------------------------------
var alias31 = StateItemInfo._drawValue;
StateItemInfo._drawValue= function(x, y) {
		// If it is not a Fe-type abnormal state wand, conventional processing is performed.
		if( CalculatorForState.isFEStateWand(this._item) == false ) {
			alias31.call(this, x, y);
			return;
		}
		
		// If it is a Fe-type status ailment staff, convert the hit value calculation formula into text and draw it.
		var stateInvocation = this._item.getStateInfo().getStateInvocation();
		var state = stateInvocation.getState();
		var text = CalculatorForState.getInvocationText(this._item);
		var textui = this.getWindowTextUI();
		var color = textui.getColor();
		var font = textui.getFont();
		
		TextRenderer.drawKeywordText(x, y, state.getName() + ' ' + text, -1, color, font);
}




//--------------------------------------------
// class
//--------------------------------------------
var alias41 = ItemInfoWindow.getWindowWidth;
ItemInfoWindow.getWindowWidth= function() {
		var result = alias41.call(this);
		
		// Increase the width of the info window if you have a Fe-type status ailment wand.
		if( CalculatorForState.isFEStateWand(this._item) == true ) {
			result += 88;
		}
		
		return result;
}




//--------------------------------------------
// class
//--------------------------------------------
var CalculatorForState = {
	// Determining whether it is an Fe-type status ailment wand
	isFEStateWand: function(item) {
		// If Item is null, it is not an fe-type status ailment staff.
		if( item == null ){
			return false;
		}
		
		var isWand = item.isWand();
		if( typeof isWandTypeExtra !== 'undefined' ) {
			// Add Weapon Type
			isWand = WandChecker.isWand(item);
		}
		// If the Item is not a cane, it is not an fe-type status ailment cane.
		if( isWand == false ){
			return false;
		}
		
		// If the type of item (cane) is not a state-adding cane, it is not an fe-type status ailment cane.
		if( item.getItemType() != ItemType.STATE ){
			return false;
		}
		
		// If the state to be added is not a bad state, it is not an fe-type status ailment wand.
		if( item.getStateInfo().getStateInvocation().getState().isBadState() == false ){
			return false;
		}
		
		// If always state wand fe is true, all wands that add bad state are fe type abnormal state wands.
		if( alwaysStateWandFE == true ){
			return true;
		}
		
		// Even if the Always state wand fe is false, wands with bad state additions with Custom Parameter {is fe state:1} are fe-type abnormal state wands.
		if( typeof item.custom.isFEState === 'number' ) {
			return true;
		}
		
		return false;
	},
	
	// Calculating the success rate of the Fe-type status ailment wand
	getFEStatePercent: function(unit, item, targetUnit) {
		var mag, ski, mdf, value, result;
		var baseHit = this.getBaseHit(item);		// basic hit rate
		var baseKeisuu = this.getBaseKeisuu(item);	// Coefficient for magic power and magic defense power
		var distKeisuu = this.getDistKeisuu(item);	// Coefficient for distance
		
		var distHosei = CalculatorForState.getDist(unit, targetUnit) * distKeisuu;	// Correction value calculation for distance
		
		mag = RealBonus.getMag(unit);				// Magic acquisition
		ski = RealBonus.getSki(unit);				// Technological acquisition
		mdf = RealBonus.getMdf(targetUnit);			// Acquisition of Caravan Magic Defense
		
		// Accuracy calculation (truncated after the decimal point in case the coefficient contains a decimal value)
		value = Math.floor( (baseHit + ((mag - mdf)*baseKeisuu) + ski - distHosei) );
		
		// Round the hit rate to the range of min hit rate and max hit rate
		value = this.validValue(value);
		
// Below is the log for viewing the state data. If you want to check the result, delete //from //root.log
//root.log('Base hit rate:'+baseHit);
//root.log('Base coefficient:'+baseKeisuu);
//root.log('magic power:'+mag);
//root.log('Target's defense:'+mdf);
//root.log('Correction value by distance:'+distHosei);
//root.log('Skill:'+ski);
//root.log('State success rate:'+value);
		
		return value;
	},
	
	// Round the hit rate to the range of min hit rate and max hit rate
	validValue: function(percent) {
		if (percent < DefineControl.getMinHitPercent()) {
			percent = DefineControl.getMinHitPercent();
		}
		else if (percent > DefineControl.getMaxHitPercent()) {
			percent = DefineControl.getMaxHitPercent();
		}
		
		return percent;
	},
	
	// Calculate the distance to the target
	getDist: function(unit, targetUnit) {
		// Find the difference in x and y between the reference position and the target position
		var x = unit.getMapX() - targetUnit.getMapX();
		var y = unit.getMapY() - targetUnit.getMapY();
		// Set the difference in X and y as absolute values
		var absx = Math.abs(x);
		var absy = Math.abs(y);

		// returns the orientation of the unit
		return (absx+absy);
	},
	
	// Acquiring basic accuracy
	getBaseHit: function(item) {
		var baseHit = baseHitForState;
		
		// Use Custom Parameter {base hit for state:xx} if the item has it
		if( item != null && typeof item.custom.baseHitForState == 'number' ) {
			baseHit = item.custom.baseHitForState;
		}
		
		return baseHit;
	},
	
	// Acquisition of coefficients for magic power and magic defense power
	getBaseKeisuu: function(item) {
		var baseKeisuu = baseKeisuuForState;
		
		// If the item has Custom Parameter {base keisuu for state:xx} specified, use that
		if( item != null && typeof item.custom.baseKeisuuForState == 'number' ) {
			baseKeisuu = item.custom.baseKeisuuForState;
		}
		
		return baseKeisuu;
	},
	
	// Get Coefficient for Distance
	getDistKeisuu: function(item) {
		var distKeisuu = distKeisuuForState;
		
		// If the item has Custom Parameter {dist keisuu for state:xx} specified, use that
		if( item != null && typeof item.custom.distKeisuuForState == 'number' ) {
			distKeisuu = item.custom.distKeisuuForState;
		}
		
		return distKeisuu;
	},
	
	// Get the text of the hit formula in the info window of the Fe type status ailment staff
	getInvocationText: function(item) {
		var text = '';
		var baseHit = this.getBaseHit(item);
		var baseKeisuu = this.getBaseKeisuu(item);
		var distKeisuu = this.getDistKeisuu(item);
		
		// If the item is null, return text (leave empty)
		if( item == null ) {
			return text;
		}
		
		text = '(';
		
		// If the basic hit rate is other than 0, describe the basic hit rate
		if( baseHit != 0 ) {
			text = text+baseHit;
		}
		
		// If the coefficient for magic power and magic defense > 0, describe the coefficient for magic power and magic defense
		if( baseKeisuu > 0 ) {
			text = text+'+('+root.queryCommand('mag_param')+'enemy'+root.queryCommand('mdf_param')+')*'+this.getBaseKeisuu(item);
		}
		
		// describe the technique
		text = text+'+'+root.queryCommand('ski_param');

		// If getting coefficient for distance > 0, describe getting coefficient for distance
		if( distKeisuu > 0 ) {
			text = text+'-distance*'+distKeisuu;
		}
		
		text = text+')'+StringTable.SignWord_Percent;
		
		return text;
	}
};


})();