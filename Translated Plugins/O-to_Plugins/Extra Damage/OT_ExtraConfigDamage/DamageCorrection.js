
/*--------------------------------------------------------------------------
  
By introducing it, level difference correction and error will occur in the damage.

   how to use:
   With or without correction and correction of correction value
   This can be done by changing the values of OT_DCTolerance and OT_DCLevel.

   Author:
   o-to
  
   Change log:
   2017/07/03: Newly created 

--------------------------------------------------------------------------*/


(function() {

// Apply level correction to final damage
OT_DCLevel = {
	  Enable        : true	// true: yes, false: no
	, Value         : 5		// Correction value for 1 level difference (%)
	, Max           : 50	// Correction value upper limit (%)
};

// Add error to final damage
OT_DCTolerance = {
	  Enable       : true	// true: yes, false: no
	, Min          : 80		// minimum value(%)
	, Max          : 120	// Maximum value(%)
};

// Compensation check for final damage
var alias1 = AttackEvaluator.ActiveAction.evaluateAttackEntry;
AttackEvaluator.ActiveAction.evaluateAttackEntry = function(virtualActive, virtualPassive, attackEntry) {
	if (!attackEntry.isHit) {
		alias1.call(this, virtualActive, virtualPassive, attackEntry);
		return;
	}
	
	OT_DamageCorrection(virtualActive, virtualPassive, attackEntry);
	alias1.call(this, virtualActive, virtualPassive, attackEntry);
};


// Fix final damage
OT_DamageCorrection = function(virtualActive, virtualPassive, attackEntry)
{
	var damagePassive = attackEntry.damagePassive;
	
	//level correction
	if( OT_DCLevel.Enable )
	{
		damagePassive = OT_DamageLevel(virtualActive, virtualPassive, damagePassive);
	}
	
	// final damage error
	if( OT_DCTolerance.Enable )
	{
		damagePassive = OT_DamageTolerance(damagePassive);
	}
	attackEntry.damagePassive = damagePassive;
};

// Apply level correction to final damage
OT_DamageLevel = function(virtualActive, virtualPassive, damagePassive)
{
	var max   = OT_DCLevel.Max;

	var activeLV  = virtualActive.unitSelf.getLv();
	var passiveLV = virtualPassive.unitSelf.getLv();
	
	var value = (activeLV - passiveLV) * OT_DCLevel.Value;
	
	value = Math.min(max, value);
	value = Math.max(-max, value);
	
	damagePassive += Math.round(damagePassive * (value / 100));
	
	//root.log('Level correction: ' + value + '%');
	return damagePassive;
};

// Add error to final damage
OT_DamageTolerance = function(damagePassive)
{
	var min = OT_DCTolerance.Min;
	var max = OT_DCTolerance.Max;

	var value = Math.round( Math.random() * ( max - min ) ) + min;
	damagePassive = Math.round(damagePassive * (value / 100));
	
	//root.log('Damage rate: ' + value + '%');
	return damagePassive;
};

})();

