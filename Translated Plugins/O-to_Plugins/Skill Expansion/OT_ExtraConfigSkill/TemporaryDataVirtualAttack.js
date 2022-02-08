
/*--------------------------------------------------------------------------
  
  During combat, the virtualAttackUnit is temporarily held in the Unit's custom.tmpNowVirtualAttack.
  You can reference the virtualAttackUnit in functions that cannot pass a virtualAttackUnit, such as SkillRandomizer._isSkillInvokedInternal.
  virtualAttackUnit can be referenced.

  How to use :
  unit.custom.tmpNowVirtualAttack can be used to reference the virtualAttackUnit
  
  Created by :
  o-to
  
  Update history:
  30/05/2015: Newly created
  2016/01/10:
  When the EP and FP system was introduced, there was a possibility that the EP and FP could be consumed by activating a skill before the EP and FP consumption of the weapon was determined.
  When the EP and FP system is introduced, there is a possibility that the weapon consumes EP and FP by activating a skill before the weapon's EP and FP consumption is determined, and the weapon cannot attack.

  
--------------------------------------------------------------------------*/

(function() {

// Do you activate the skill before the attack?
OT_BeforeAttackSkill = false;

// Temporary data is created when virtualAttackUnit is created
var alias1 = VirtualAttackControl.createVirtualAttackUnit;
VirtualAttackControl.createVirtualAttackUnit = function(unitSelf, targetUnit, isSrc, attackInfo) {
	var virtualAttackUnit = alias1.call(this, unitSelf, targetUnit, isSrc, attackInfo);

	delete virtualAttackUnit.unitSelf.custom.tmpNowVirtualAttack;
	virtualAttackUnit.unitSelf.custom.tmpNowVirtualAttack = virtualAttackUnit;
	//root.log('Temporary creation');

	OT_BeforeAttackSkill = true;
	return virtualAttackUnit;
};

// Deletion of temporary data after a battle (if not deleted, an error will occur when saving)
var alias2 = NormalAttackOrderBuilder._endVirtualAttack;
NormalAttackOrderBuilder._endVirtualAttack = function(virtualActive, virtualPassive)
{
	alias2.call(this, virtualActive, virtualPassive);
	delete virtualActive.unitSelf.custom.tmpNowVirtualAttack;
	delete virtualPassive.unitSelf.custom.tmpNowVirtualAttack;
	
	OT_BeforeAttackSkill = false;
	//root.log('Temporary deletion');
};

// Check this box as the skill may be activated before the attack starts.
var alias3 = VirtualAttackControl.isRound;
VirtualAttackControl.isRound = function(virtualAttackUnit)
{
	OT_BeforeAttackSkill = true;
	return alias3.call(this, virtualAttackUnit);
};

// Uncheck this box to avoid the possibility of activating a skill after the start of an attack when determining if an attack is possible.
var alias4 = VirtualAttackControl.isAttackContinue;
VirtualAttackControl.isAttackContinue = function(virtualAttackUnit)
{
	OT_BeforeAttackSkill = false;
	return alias4.call(this, virtualAttackUnit);
};

})();

