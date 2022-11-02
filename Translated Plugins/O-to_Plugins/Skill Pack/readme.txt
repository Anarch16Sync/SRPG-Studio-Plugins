-----------------------------------------------------------------------------------------
【Change log】
  2015/06/6: α version released
  2015/06/17: Beta version released
  2015/06/20: Added assault-like skills,
              Skill activation conditions Separate scripts for additional skills and scripts for additional skills
  2015/09/06: Assault skill correction due to deletion of official function
  2015/09/13: "Ranbu" corresponds to 1-239's integrated CalA nore attack
  2015/10/31: Corrected due to the name change of the official function in "Ranbu" and "Assault"
  2016/06/13: Recreate the cancellation posted on a certain thread
  2017/04/23: Fixed because the defense ignore of the option of the essential skill did not work when using skill-BreakAttack.js
  2019/05/25:
  ・ Skill-Assault.js (continue battle)
  When the opponent is invincible, the attack does not hit, HP absorbs each other and fights endlessly
  Unless you set the skill count limit together with the skill activation condition addition script
  Fixed a freeze issue, so the standard script for this skill now limits the number of activations.
  
  Fixed so that it can be set in Custom Parameter so that it can not be activated in situations where it can attack unilaterally.
  
  If the character is immortal in the event settings, the invoker will be at a disadvantage.
  Added Custom Parameter to alleviate it.
  
  When the skill activation display is re-combated by the skill after both battles are over
  Fixed to be displayed in the first offense and defense.
  
  2020/01/01:
  ・ Skill-StatusAttack.js (status-dependent attack)
  Create New.
  The attack power of the skill owner and the defense power of the attack target are specified by custom parameters.
  It depends on the status.

  2020/01/07:
  Corrected because some skills did not describe what is specified as a keyword for custom skills.
  Corrected the skill name of "Damage Absorption" to "Damage Absorption" (because it suffers from the official name) 
  
  
-----------------------------------------------------------------------------------------
[Installation method]
* If you installed this script before June 20, 2015, please delete the "OT_skill" folder once.
Put "OT_skill" in the Plugin folder.

Recommended for use with additional skill activation conditions.
(Especially for status-dependent attacks, it is assumed that the same type of skill activation order check (Duplicate Skill.js) is included)

Armor break (skill-BreakAttack.js) and status-dependent attack (skill-StatusAttack.js) are by design.
Since it is easy to conflict with another custom script (general Cal etc.), when using another custom script together
Whether to change the folder name of "OT_skill" to "0OT_skill" and read it first
Merge the description into another script,
Or if you do not use it, remove the corresponding script. 

-----------------------------------------------------------------------------------------
【Overview】
By introducing it, you will be able to use the following skills.

・ Always make a critical attack when activated
・ Defense-ignoring attack
・ Random multiple attacks
・ Damage absorption
・ Continue the battle
・ Reduce the number of rounds of the opponent when hitting an attack
-Depends the attack power of the skill owner and the defense power of the attack target on a specific status. 
-----------------------------------------------------------------------------------------
【how to use】
■ File name: skill-BreakAttack.js
・ Skill [Armor Break] (Luna-like)
Usage: Enter [OT_Break Attack] as the keyword for the custom skill.

When this skill is activated, it will be an attack that ignores the defense power of the enemy.
If you want to set what percentage of defense is ignored, set custom parameters
if you do not set the parameter, the defense power of the opponent will be completely ignored.

-Custom parameters that can be passed
{
 BreakPercent: (numerical value) // Set what percentage of the opponent's defense power is ignored
}

example:
If you set BreakPercent: 60, 60% of the opponent's defense will be ignored. 


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ File name: skill-Critical.js
・ Skill [Critical Attack]
Usage: Enter [OT_Critical] as the keyword for the custom skill.

When this skill is activated, the attack becomes critical.

Put it with the "OT_ExtraConfigSkill" folder
100% activation rate, with custom parameters
{
   EC_NowHP: '0-50%'
}
If you specify, you can reproduce the FE skill "Wrath" (critical attack with HP 50% or less). 


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ File name: skill-BoisterousDance.js
・Skill [Dance]
How to use: Enter [OT_BoisterousDance] in the custom skill keyword.

When the skill is activated, it will be a random attack multiple times.
Damage dealt while possessing this skill is reduced.
(It is also possible to reduce damage only when activated with custom parameters)

・Custom parameters that can be passed
{
    DamageRate : (number) //Set how much damage will be done
  , MaxAttackCount : (number) //You can set the maximum number of attacks
  , MinAttackCount : (number) //At least this set value will be attacked when the skill is activated
  , isRateChange : (number) // 0 changes the damage rate just by having the skill, and 1 changes the damage rate only when the skill is activated.
  , isNoReattack : (numerical value) //Set whether to be affected by Mr. 1-239's integrated CalA noreattack, 1 to receive, 0 to not
}

example:
DamageRate: 30
MinAttackCount : 3
MinAttackCount : 6
isRateChange : 1

After activating the skill, attack at least 3 times and attack at maximum 6 times.
Also, the damage dealt is reduced to 30% only when the skill is activated.

*
If DamageRate is not set, it will be 50.
If MaxAttackCount is not set, it will be 5.
If MinAttackCount is not set, it will be 2.
Will be 0 if isRateChange is not set.
isNoReattack will be 1 if unset.


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ File name: skill-AbsorptionDamage.js
・Skill "damage absorption"
Usage: Enter [OT_AbsorptionDamage] as the keyword for your custom skill.

Recovers HP by absorbing the damage received from the opponent when the skill is activated.

・Custom parameters that can be passed
{
   AbsorptionPercent: (number) //Set what percentage of damage to absorb
}

If AbsorptionPercent is not set, it will be 100.


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ File name: skill-Assault.js
・Skill "Battle Continuation"
How to use: Enter [OT_Assault] in the custom skill keyword.

When the skill activates, the battle will continue.
However, it will not activate in situations where the skill owner is attacked unilaterally.
(It can be activated if the skill owner can attack unilaterally, but can be set to not be activated with Custom Parameter)

・Custom parameters that can be passed
{
    AS_Max: (number) //Maximum number of activations (50 if not specified)
  , AS_OneSide: (Boolean value) // Will it be triggered in situations where it is possible to attack unilaterally (true if not specified)
  , AS_AbortCheck: (logical value) //If the opponent is an immortal unit, suppress the activation when the immortal unit is dying (false if not specified)
}

The default value when AS_Max is not specified is defined in AS_MaxActivate of skill-Assault.js.

If AS_AbortCheck is set to true, for characters who have become immortal in the event settings
When executing a forced evasion that occurs when you attack with a skill or critical hit that reduces HP to 0,
It will no longer activate when the amount of normal attack damage exceeds HP.
Alleviates the situation where the caster is attacked unilaterally and is at a disadvantage.

ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ File name: skill-Cancel.js
・Skill "Cancel+"
How to use: Enter [OT_Cancel] in the custom skill keyword.

Reduces the opponent's number of rounds when the skill is activated.

custom parameter
{
   CancelCount: (number) //Set how many rounds to reduce
}

If CancelCount is unset, decrements all rounds.


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ File name: skill-StatusAttack.js
・Skill "Status Dependent Attack"
How to use: Enter [OT_StatusAttack] in the custom skill keyword.

The attack power of the skill owner and the defense power of the attack target were specified with custom parameters.
It will be status dependent.

Basically set the skill to the weapon,
If you want to give it to a unit, it is recommended to make it a command skill.
You can also use (strength/2 + technique/2) as attack power like the bow of Disgaea.

It is also possible to turn it into a command skill when adding skill activation conditions.
If you have both a non-command skill and a command skill
Normally, non-command skills are activated, and command skills are activated when command skills are activated.

Custom parameter (each value can be omitted)
{
    SA_AttackValue:
    {
        LV: (Numeric value, decimal point/negative can be specified)
      , HP: (Numeric value, decimal point/negative can be specified) // Current value x Custom Parameter value
      , EP: (Numeric value, decimal point/negative can be specified) // Current value x Custom Parameter value, only when MP (EP) & special gauge (FP) additional plug-ins are installed
      , FP: (Numeric value, decimal point/negative can be specified) // Current value x Custom Parameter value, only when MP (EP) & special gauge (FP) additional plug-ins are installed
      , POW: (Numeric value, decimal point/negative can be specified)
      , MAG: (Numeric value, decimal point/negative can be specified)
      , SKI: (Numeric value, decimal point/negative can be specified)
      , SPD: (Numeric value, decimal point/negative can be specified)
      , LUK: (Numeric value, decimal point/negative can be specified)
      , DEF: (Numeric value, decimal point/negative can be specified)
      , MDF: (Numeric value, decimal point/negative can be specified)
      , MOV: (Numeric value, decimal point/negative can be specified)
      , WLV: (Numeric value, decimal point/negative can be specified)
      , BLD: (Numeric value, decimal point/negative can be specified)
      , WPN: (Numeric value, decimal point/negative can be specified) //Correct weapon attack power, default 1.0 when not specified
    }
    ,
    SA_DefenceValue:
    {
        LV: (Numeric value, decimal point/negative can be specified)
      , HP: (Numeric value, decimal point/negative can be specified) // Current value x Custom Parameter value
      , EP: (Numeric value, decimal point/negative can be specified) // Current value x Custom Parameter value, only when MP (EP) & special gauge (FP) additional plug-ins are installed
      , FP: (Numeric value, decimal point/negative can be specified) // Current value x Custom Parameter value, only when MP (EP) & special gauge (FP) additional plug-ins are installed
      , POW: (Numeric value, decimal point/negative can be specified)
      , MAG: (Numeric value, decimal point/negative can be specified)
      , SKI: (Numeric value, decimal point/negative can be specified)
      , SPD: (Numeric value, decimal point/negative can be specified)
      , LUK: (Numeric value, decimal point/negative can be specified)
      , DEF: (Numeric value, decimal point/negative can be specified)
      , MDF: (Numeric value, decimal point/negative can be specified)
      , MOV: (Numeric value, decimal point/negative can be specified)
      , WLV: (Numeric value, decimal point/negative can be specified)
      , BLD: (Numeric value, decimal point/negative can be specified)
    }
}

If SA_AttackValue is omitted, the attacker's attack power is normal,
Weapon + (strength if the weapon is physical, magic if the weapon is magic)
If SA_DefenceValue is omitted, the attack target's defense power is normal,
If the attacking side's weapon is physical, it will be the defense power, and if the weapon is magic, it will be the magic defense power.

Example 1:
{
    SA_AttackValue :{ POW:0.5, SKI:0.5 }
}

When attacking, (strength * 0.5) + (skill * 0.5) + weapon power becomes attack power.

Example 2:
{
     EC_Command : 'ATTACK'
   , EC_CommandDuration : 0
   , SA_AttackValue : { POW:1.5, WPN:1.5 }
   , SA_DefenceValue : { LUK:2.0 }
}

Offensive command skill.
When attacking with a command skill, (strength * 1.5) + (weapon power * 1.5) becomes attack power.
Skill owner's attack target's defense power is Luck * 2.0.

Example 3:
{
     EC_Command : 'WAIT'
   , EC_CommandDuration : 3
   , SA_AttackValue : { MAG:3.0, WPN:0.0 }
   , SA_DefenceValue : { MAG:1.0 }
}

standby command skill
After executing the command skill, (Magic power * 3.0) of the caster for 3 turns becomes the attack power.
During activation, the attack target's defense power becomes magical power * 1.0.


Example 4:
{
     SA_AttackValue : { DEF:1.0, WPN:0.0 }
   , SA_DefenceValue : { POW:-1.0, DEF:1.0 }
}

(Defense power * 1.0) becomes attack power when attacking.
The defense power of the skill owner's attack target is (defense power * 1.0) - strength.
