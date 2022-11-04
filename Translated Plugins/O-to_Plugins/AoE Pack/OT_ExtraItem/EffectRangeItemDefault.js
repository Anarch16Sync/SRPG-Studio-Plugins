
/*-----------------------------------------------------------------------------------------------
  
  Default settings when custom parameters for area attack items are not set
    
  Author:
  o-to
  
  Change log:
  2020/04/28:
  Create New

-----------------------------------------------------------------------------------------------*/
(function() {

// Default setting when custom parameters is not set
OT_EffectRangeItemDefault = {
	  DamageType          : 2			// attack type (1: physical, 2: magic, 0: fixed damage)
	, MinRange            : 0			// minimum range
	, EffectRange         : '0-1'		// Effect range
	, RangeType           : 0			// range type
	, EffectRangeType     : 0			// shape of effect range
	, UnitReflection      : true		// Unit ability added to power
	, WeaponReflection    : false		// Weapon attack power added to power
	, HitValue            : 70			// Accuracy when set to attack type
	, RecoveryHitValue    : 100			// hit rate when set to recovery type
	, HitReflectionUnit   : true		// Add user's skill x 3 to accuracy
	, HitReflectionWeapon : false		// Add the hit value of the equipped weapon to the hit rate
	, HitAvoid            : true		// Whether to subtract the target avoidance value from the above hit rate
	, RecoveryHitAvoid    : false		// Subtract the target's avoidance value from the above hit rate (default for recovery system)
	, Indifference        : false		// indiscriminate attack
	, SupportAtk          : true		// If the unit ability is reflected in the power, the attack correction by the support effect is reflected
	, SupportHit          : true		// Hit correction due to support effect is reflected when skill correction is included in hit rate
	, SupportDef          : true		// If the attack type is physical or magic, the defense correction by the support effect is reflected
	, SupportAgi          : true		// If the hit rate is subtracted by the target's avoidance value, the avoidance correction by the support effect is also reflected
	, EXPMagnification    : 0.75		// Experience value multiplier, acquired experience value increases as the number of target units in the effect range increases, and increases or decreases according to the strength of the target
	, GetEXP              : 10			// The amount of EXP that is guaranteed when used
	, SoundDuplicate      : false		// Sound duplication on hit etc.
};

// Old default value
OT_EffectRangeItemDefaultOld = {
	  DamageType          : 0			// attack type (1: physical, 2: magic, 0: fixed damage)
	, MinRange            : 0			// minimum range
	, EffectRange         : '0-0'		// Effect range
	, RangeType           : 0			// range type
	, EffectRangeType     : 0			// shape of effect range
	, UnitReflection      : false		// Unit ability added to power
	, WeaponReflection    : false		// Weapon attack power added to power
	, HitValue            : 100			// Accuracy
	, RecoveryHitValue    : 100			// hit rate when set to recovery type
	, HitReflectionUnit   : false		// Add user's skill x 3 to hit rate
	, HitReflectionWeapon : false		// Add the hit value of the equipped weapon to the hit rate
	, HitAvoid            : false		// Subtract the hit rate from the above hit rate with the target avoidance value
	, RecoveryHitAvoid    : false		// Subtract the target's avoidance value from the above hit rate (default for recovery system)
	, Indifference        : false		// indiscriminate attack
	, SupportAtk          : true		// If the unit ability is reflected in the power, the attack correction by the support effect is reflected
	, SupportHit          : true		// Hit correction due to support effect is reflected when skill correction is included in hit rate
	, SupportDef          : true		// If the attack type is physical or magic, the defense correction by the support effect is reflected
	, SupportAgi          : true		// If the hit rate is subtracted by the target's avoidance value, the avoidance correction by the support effect is also reflected
	, EXPMagnification    : 1.0			// Experience value multiplier, acquisition experience value increases as the number of target units in the effect range increases, and increases or decreases according to the strength of the target
	, GetEXP              : 0			// The amount of experience that always enters when used
	, SoundDuplicate      : true		// Sound duplication on hit, etc.
};

//If you want to use the default value of the old version, rewrite the contents of OT_EffectRangeItemDefault
//Please delete the comment out part bellow
//OT_EffectRangeItemDefault = OT_EffectRangeItemDefaultOld;

})();

