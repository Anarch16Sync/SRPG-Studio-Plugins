-----------------------------------------------------------------------------------------
【Change log】
  2015/10/11: Create a new range attack item (prototype)
  2015/10/13: Added various elements such as range designation and additional status
  2015/10/16: Fixed to correspond to official update 1.035
  2015/10/31: Responding to skill status ailments, improving enemy AI
              Added damage value display, fixed to play damage effect and unit disappearance at the same time
              Fixed the animation when adding a state to depend on the state's map animation
              Add map terrain change effect
              Changed the damage when used to be done with the enemy's damage
  2015/12/04: Fixed because it ends with an error in the latest version
              Supports animation playback on the tool side
  2015/12/06: Added readme setting example, corrected some descriptions
  
  2016/02/28:
  Fixed a bug that caused an error when the enemy was surrounded by allies or terrain.
  Fixed an error due to enemy AI correction in 1.060

  2016/03/23:
  First aid for 1.067 error

  2016/04/26:
  Fixed a bug that prevented enemies from using auxiliary-only range items

  2016/05/03:
  Corrected so that damage display and HP recovery amount display are omitted when auxiliary only (fixed damage or fixed recovery amount is 0)
  It is now possible to set a multiplier for the score used to determine the action of the enemy AI.
  Corrected to recover HP when specifying negative damage when using
  Ability to set the HP absorption rate of the damage dealt

  2016/07/31:
  1.086 compatible, fixed to end with an error when using

  2016/10/17:
  Modified so that the value of each status can be set to affect the correction of power
  Added a setting to multiply the final attack power by a correction value
  Fixed some typos, reworked readme

  2017/01/16:
  Error handling when adding states in Ver 1.109

  2017/01/29:
  Fixed OT_setCustomItemAddState which was not used for error handling when adding state just in case.

  2017/02/05:
  Fixed the place where the declaration of the variable used for the for loop was forgotten
  *If there is another script that forgets to declare in the same way, unintended behavior will occur.

  2017/12/16:
  Fixed an issue that stopped with an error when hovering over a unit when selecting the activation position of a range attack item

  2018/05/01:
  Fixed a bug that caused an error when destroying an enemy with a ranged attack.

  2019/07/07:
  With the state data deleted on the editor side and the ID missing
  'BadState' or 'GoodState' was specified for IER_DelState or OT_UseDelState of Custom Parameter
  Fixed an issue where hovering over an item would cause an error.
  Items with 'BadState', 'GoodState', or 'AllState' that do not support OT_UseAddState and IER_AddState
  Fixed to exit with a warning that you do not want to specify an error message when you hover the cursor.

  2019/10/06:
  When OT_UnitReflection is set to true and unit ability is reflected in power,
  Fixed so that the correction value of the attack by "support effect" is referenced.
  Corrected so that the correction value of defense by "support effect" is referred to when the damage type set by OT_DamageType is physical or magic.
  Fixed whether or not to be affected by the attack, defense, hit, and evasion of the support effect can be set with Custom Parameter (each default is true).

  2020/02/23:
  If the user is included in the target when recovering the range with OT_Recovery set to true,
  Fixed an issue where the user was being healed twice.
  Regarding the acquisition experience value, since there was no description in the readme such as when there are multiple targets within the effect range, I added it.

  2020/04/28:
  Added a custom parameter called IER_HitMark as a mandatory setting.
  
  Fixed so that the effect range becomes "whole area" when 99 is set to IER_EffectRangeType.
  If the range of effect is the entire area, the range type specification is invalid and can be activated anywhere.
  Also added a square type to the area effect type.
  
  Added a custom parameter called IER_SoundDuplicate to prevent duplication of hit sounds.
  
  Fixed an issue where if the area of ​​effect is Breath type, moving the cursor diagonally to the user would cause an extreme drop in processing.
  Fixed the variable name that was likely to be the source of the problem (IndexArray → indexArray)
  Also, when the effect range type is breath type, the range type is now forced to be a cross type.
  
  The description of the item is divided, and the display can be switched with the key specified by SYSTEM in [keyboard] of game.ini (default: left shift).
  
  Fixed the window so that the damage and hit rate for characters within the effect range are displayed.
  The display can be switched with the key specified by SYSTEM in [keyboard] of game.ini (default: left shift).
  
  Greatly modified AI processing when enemies use range attack items. Greatly improved processing speed.
  (There is still room for review, but it is released because it is much better than before)
  
  Reviewed the default value so that it works universally with the minimum custom parameter (power [IER_Value]).
  Create a file EffectRangeItemDefault.js that defines default values.
  
  About IER_HitReflection (adding unit skill to hit rate, adding weapon hit value to hit rate)
  Split parameters into IER_HitReflectionUnit, IER_HitReflectionWeapon.
  (It is possible to specify either the old model or the new method)

  Move custom parameter example to caspara template.txt

  2020/05/04:
  Fixed AI processing when enemies use area attack items.
  When using area recovery or indiscriminate type, if the total number of enemies was large, the score check was heavy,
  Reduced processing so as not to check the predicted range and check the score of units that are sure to be out of range.
  When indiscriminate, if there are enemies and allies around, range attack items may not be used.
  Fixed range attack check processing.
  Fixed because the log for debug confirmation was output.

  2020/05/05:
  Fixed an issue where an enemy would get an error when trying to use ranged attacks of certain range types.

  2020/05/06:
  It seems that there was an error caused by script conflict in the report,
  Corrected variable names in reported parts.
  Because it affects when BaseCombinationCollector._getTargetListArray is modified
  Modified to do the same processing as BaseCombinationCollector._getTargetListArray that has not been modified with a dedicated function.
  The checkTime for debugging is not output to the console at the origin, but just in case, comment out

  2020/09/06:
  By playing the effect animation specified by Custom Parameter (OT_EffectAnime)
  I was using animationPlay of DynamicEvent
  Even if the effect finishes playing, it will not proceed to the next process unless the skip key is pressed to skip.
  Modified processing to play back with DynamicAnime because there was a possibility of malfunction

-----------------------------------------------------------------------------------------
[Introduction method]
Put "OT_ExtraItem" in the Plugin folder.

-----------------------------------------------------------------------------------------
【Overview】
By installing it, you can use items that can perform ranged attacks.
You can:

・You can reflect the unit ability and weapon power to the power of the item.
- Effects can be played when using items.
You can also specify effects for hits, effects for avoidance, and effects for damage when used.
・When used, recoil damage and states can be added or eliminated.
・The hit rate can be set and the ability of the unit can be reflected in the hit rate.It is also possible to fix it.
・You can give or extinguish a state for the hit unit.
　You can specify multiple grant/disappear states, and you can also set the grant probability.
・The shape of the effect area can be made into a cross shape or a breath shape.
・It is possible to change the terrain of map chips that have specific terrain effects.
・In addition to the set fixed value, the amount of experience gained when using the effect will increase as the number of target units within the effect range increases.
Also, if the level of the target unit is higher than the user's, if the user is a lower class and the target unit is a higher class, and the target unit is defeated, the experience gained will increase,
Conversely, if the target unit is lower in level than the user, the user is a higher class and the target unit is a lower class, and no damage is taken, the experience gained will be reduced.
(If the target is a ranged attack or ranged recovery that requires 5 or more people to be involved, set the IER_EXPMagnification to 0.5 or less to set the acquisition experience value multiplier low.
　It is recommended to set it to 0 and set only IER_GetEXP)

Regarding the item description window and the information window of the target unit within the effect range,
The explanation display can be switched with the key specified by SYSTEM in [keyboard] of game.ini (default: left shift).

-----------------------------------------------------------------------------------------
【how to use】
How to use: Enter [OT_ItemEffectRange] in the custom item keyword.
The value of "range setting" is the maximum range.

・ Custom parameters that can be set
OT_DamageType : (Damage type) 											// 1 for physical attack, 2 for magic attack. If you specify anything else, it will be fixed damage. (When not specified: 2, default value can be changed with EffectRangeItemDefault.js)
OT_Recovery : (set damage or recovery) 									// false for attack type, true for recovery type. If you want range recovery or range buff, set it to true (when not specified: false)
OT_UnitReflection : (Reflect unit ability in power) 					// False to not reflect unit ability in power, true to reflect unit ability in power
																			If OT_DamageType is specified, physical power will be referenced, and magical power will be referenced (when not specified: true, default value can be changed with EffectRangeItemDefault.js)
OT_WeaponReflection : (Weapon power reflected in power) 				// False to not reflect weapon power, true to reflect weapon power (when not specified: false, default value can be changed with EffectRangeItemDefault.js)
                                                            

IER_Value : (Power) 													// Sets the power of the item with a numerical value. (When not specified: 0)
IER_HitValue : (hit rate) 												// Set the hit rate of the item as a numerical value (when not specified: 70, 100 when set to recovery type with OT_Recovery, default value can be changed with EffectRangeItemDefault.js)
IER_HitReflectionUnit : (adds the skill of the unit to the hit rate) 	// If set to true, the user's skill x 3 is added to the hit rate (when not specified: true, default value can be changed with EffectRangeItemDefault.js))
IER_HitReflectionWeapon: (Add weapon hit value to hit rate) 			// If set to true, add equipped weapon hit value to hit rate (if not specified: false, default value can be changed with EffectRangeItemDefault.js))
IER_HitAvoid : (Avoidance value affects hit rate) 						// If set to true, hit rate will be "Item's hit rate - target unit's avoidance value" (when not specified: true, if set to recovery type with OT_Recovery is false, default value can be changed in EffectRangeItemDefault.js)
IER_HitMark : (Must hit) 												// When set to true, the above hit rate setting will be ignored and the hit will always hit. (When not specified: false)
IER_Indifference: (Indiscriminate attack) 								// If set to true, it will be an indiscriminate attack involving allies (when not specified: false, default value can be changed with EffectRangeItemDefault.js)
IER_EXPMagnification : (experience value multiplier) 					// Set the experience value multiplier, the acquired experience value increases as the number of target units in the effect range increases, and also increases or decreases according to the strength of the target (if not specified : 0.75, default value can be changed in EffectRangeItemDefault.js)
IER_GetEXP: (Fixed EXP) 												// Set the EXP to be obtained when using the item (unspecified: 10, default value can be changed with EffectRangeItemDefault.js)

OT_AbsorptionRate : (Damage Absorption Rate) 							// When set, HP will be recovered by damage amount x rate, rate can be negative.
																			If you set it as a recovery system, you will receive damage equal to the recovery amount x magnification (if omitted: 0.0)

OT_MinRange : (start range) 											// Set a value to (start range) (when not specified: start range is 0 (default value can be changed with EffectRangeItemDefault.js)
																		// Set the end range in the "Range setting" of the item on the editor side
IER_EffectRange : '(start range)-(end range)' 							// Set numerical values ​​for (start range) and (end range) (if not specified: '0-1', default value can be changed with EffectRangeItemDefault.js )
IER_RangeType: (Range type) 											// *See below　Specify the shape of the range (if not specified: 0)
IER_RangeSpread: (Spread of range) 										// *See below　Adjust the spread of a part of the range (when not specified: 1)
IER_EffectRangeType: (type of effect range) 							// *See later Specify the shape of the effect range. If you want the range to be the entire map, specify 99 (if not specified: 0)
IER_EffectSpread: (Spread of effect range) 								// *See below　Adjust the spread of a part of the effect range (when not specified: 1)

IER_AddState : {(state ID):(activation rate)} 							// Set the state ID and activation rate to be given when the attack hits (when not specified: {})
IER_DelState : {(state ID):(activation rate)} 							// Set the state ID and activation rate to be canceled when the attack hits (when not specified: {})
OT_UseAddState : {(state ID):(activation rate)} 						// Set the state ID (number) and activation rate (number) to be given to the user (when not specified: {})
OT_UseDelState : {(state ID):(activation rate)} 						// Set the state ID (number) and activation rate (number) to be canceled by the user (when not specified: {})
OT_UseDamage : (recoil damage value) 									// Sets the recoil damage after use as a number. If you specify '(number)%' in the character string, it will be the percentage damage of the current HP, and 'M(number)%' will be the percentage damage of the maximum HP.

---Advanced Settings---
OT_DamageMagnification : (Damage Magnification) 						// The final attack power is the value calculated by this magnification of the attack power calculated by OT_UnitReflection, IER_Value, etc. (not set: 1.00)
OT_StatueReflection: {(parameter name):(magnification),...} 			// *See later　Add each status to power (if not specified, OT_DamageType is 1 for strength, 2 for magic, etc.) is not set)
OT_AIScoreRate : (score rate) 											// Sets the score rate used when determining enemy AI actions. The higher the number, the higher the priority for using that item (default: 1.0)

OT_UseDamageAnime : [(anime ID), (runtime use)] 						// Sets the animation when the user damages {(anime ID) is a number, (runtime use) is set to false or true (if not specified: null )}
OT_UseDelGoodAnime : [(anime ID), (runtime use)] 						// Set the animation when the user's good state is released { (anime ID) is a number, (runtime use) is set to false or true ( When not specified: [200, true])}
OT_UseDelBadAnime : [(anime ID), (runtime use)] 						// Set the animation when the user's bad state is released {(anime ID) is a number, (runtime use) is set to false or true( When not specified: [101, true])}
IER_HitAnime : [(anime ID), (runtime use)] 								// Set the animation when hitting the target {(anime ID) is a number, (runtime use) is set to false or true (if not specified: null )}
IER_MissAnime : [(anime ID), (runtime use)] 							// Set the animation when the target avoids {(anime ID) is a number, (runtime use) is set to false or true (when not specified: null )}
IER_DelGoodAnime : [(anime ID), (runtime use)] 							// Set the animation when the target good state is released {(anime ID) is a number, (runtime use) is set to false or true (not When specified: [200, true])}
IER_DelBadAnime : [(anime ID), (runtime use)] 							// Set the animation when the target bad state is released {(anime ID) is a number, (runtime use) is set to false or true (not When specified: [101, true])}
IER_SoundDuplicate: (whether or not sound is duplicated) 				// If set to false, the sound effect will not be duplicated when the effect occurs when hit, state is granted, or released (when not specified: false, change the default value with EffectRangeItemDefault.js Possible)

// For the setting of support reflection below
// Effective when power and hit rate depend on unit ability.

IER_SupportAtk : (reflect support {attack correction}) 					// If set to true, attack correction by support effect will be reflected in power (when not specified: true, default value can be changed with EffectRangeItemDefault.js)
IER_SupportHit : (reflect support {hit correction}) 					// If set to true, the hit correction by the support effect will be reflected in the hit rate (when not specified: true, default value can be changed with EffectRangeItemDefault.js)
IER_SupportDef : (reflect support {defense correction}) 				// If set to true, the defense correction from the support effect will be reflected in the damage value given to the opponent (when not specified: true, default value can be changed with EffectRangeItemDefault.js)
IER_SupportAgi : (reflect support {avoidance correction}) 				// When set to true, the avoidance correction due to the support effect will be reflected in the opponent's evasion value (when not specified: true, default value can be changed with EffectRangeItemDefault.js)

OT_UseDamageDeath : (whether to die) 									// Sets whether damage to the user with OT_UseDamage or OT_AbsorptionRate dies.
																			True allows death, false leaves 1 HP (unspecified: true)

IER_MapChipChangeAfter : [ (Setting method is described later) ] 		// Change a specific map chip within the range to the specified chip (default: null)

---Previous version setting---
-----------------
// If IER_Range is set even if the following is set, it will take precedence.

-----------------
//If IER_HitReflectionUnit and IER_HitReflectionWeapon are set, they will take precedence.
IER_HitReflection : [(adds unit's skill to hit rate), (adds weapon's hit value to hit rate)] // (adds unit's skill to Weapon hit value added to rate) is set to true, the hit value of the equipped weapon is added to the hit rate.

-----------------
// Currently, the "animation when using" is played on the editor side.
// If ↓ was set when setting "animation when using" on the editor side
// The animation specified by ↓ is played after the animation on the editor side is played.
OT_EffectAnime : [(anime ID), (runtime use)] // set a number to (anime ID), use runtime with true for (use run time), use the original with false (if not specified: null)

ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■OT_DamageType
Sets the damage type.
(Not set: 1) * Default value can be changed with EffectRangeItemDefault.js

example:
OT_DamageType: 0
Treated as fixed damage. (The value obtained by calculating the power will be the damage as it is)

OT_DamageType: 1
It will be treated as a physical attack. (Damage can be reduced by defensive power)

OT_DamageType: 2
It will be treated as a magic attack. (Magic resistance can reduce damage)

ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ OT_Recovery
Set whether to treat it as a recovery item.
(not set: false)

example:
OT_Recovery: false
It will be treated as an attack.

OT_Recovery: true
It will be treated as recovery. Ignores the target's defense and magic defense.

ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ OT_Unit Reflection
The ability of the unit (including bonuses such as item possession) is reflected in the calculation of the power of the item.
If true, if OT_DamageType is 1, power will be added to power, if OT_DamageType is 2, magic power will be added to power.
(Not set: true) * Default value can be changed with EffectRangeItemDefault.js

Regardless of the setting of OT_DamageType, if you want to set in detail which ability is added to the power, you also need to set OT_StatueReflection.

example:
OT_Unit Reflection: true
Unit abilities are reflected.

ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ OT_Weapon Reflection
The power of the weapon equipped by the unit is added to the calculation of the power of the item.
(Not set: false) * Default value can be changed with EffectRangeItemDefault.js

example:
OT_WeaponReflection: true
Reflects the power of the equipped weapon.


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■IER_Value
Specifies the strength of range attack and range recovery.
(Not set: 0)

final damage value
((value of IER_Value) + [A] - [B]) * (OT_DamageMagnification)
will be

[A]:
OT_DamageType is 0 (fixed damage), or 0 if OT_UnitReflection is false,

if OT_UnitReflection is true
If OT_DamageType is 1, the power of the user,
If OT_DamageType is 2, it will be the magic power of the user.
In addition, if IER_SupportAtk is not false, the target's support correction [Attack] value is also added.

[B]
0 if OT_DamageType is 0 (fixed damage),

If OT_DamageType is 1, the target's defense power,
If OT_DamageType is 2, it will be the target's defense.
In addition, if IER_SupportDef is not false, the target's support correction [defense] value is also added.

example:
IER_Value: 5
set power to 5

ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■IER_HitValue
Set the hit rate of the item with a numerical value.
(Unspecified: 70 for range attack, 100 for range recovery)

The final hit rate will be:
   ([value set by IER_HitValue] + [user's skill x 3] + [support correction applied to user (hit)] + [hit value of equipped weapon])
- ([(target speed * 2) + terrain correction] + [target support correction (evasion)] )

[User's skill x 3], [Support correction for user (hit)], [Hit value of equipped weapon],
[(target speed * 2) + terrain correction] and [target support correction (evasion)] can be set to be reflected or not by Caspara.
(specified by IER_HitReflectionUnit, IER_HitReflectionWeapon, IER_HitAvoid, IER_SupportAgi described later)

* Only [Hit value of equipped weapon] is not reflected in the default value setting.

example:
IER_HitValue: 80

ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■IER_HitReflectionUnit
Set whether to add the user's (skill x 3) to the hit value
(Not set: true) * Default value can be changed with EffectRangeItemDefault.js

example:
   IER_HitValue: 50
, IER_HitReflectionUnit: true
Unit skill x 3 is added to the hit rate set in IER_HitValue

Example 2:
   IER_HitValue: 50
, IER_HitReflectionUnit: false
The unit's skill x 3 is not added to the hit rate set by IER_HitValue

ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■IER_HitReflectionWeapon
命中値に武器の命中値を加算するか設定します
(未設定：false) ※EffectRangeItemDefault.jsでデフォルト値を変更可能

これをtrueにする場合はIER_HitValueは低めに設定する事をおすすめします。

例：
  IER_HitValue:10
, IER_HitReflectionWeapon:true
IER_HitValueで設定した命中率に武器命中率が加算されます

例2：
  IER_HitValue:80
, IER_HitReflectionWeapon:false
IER_HitValueで設定した命中率に武器命中率が加算されません

ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■IER_HitAvoid
Set whether to subtract the (target speed * 2 + terrain correction) of the target unit from the hit value.
(If IER_SupportAgi is true or not set (target speed * 2 + terrain correction + support correction [avoid]))

(When not specified: true) * Default value can be changed with EffectRangeItemDefault.js

example:
  IER_HitValue: 50
, IER_HitReflectionWeapon: true
, IER_HitAvoid: true

(value of IER_HitValue) + (user's skill * 3) + (support correction applied to user (hit)) + (hit value of equipped weapon)
- ((Target Speed ​​* 2) + Terrain Correction + Target Support Correction (Evasion) )
is the actual hit rate.

Example 2:
  IER_HitValue: 50
, IER_HitReflectionUnit: false
, IER_HitReflectionWeapon: false
, IER_HitAvoid: true

(value of IER_HitValue) - (target speed * 2 + terrain correction + support correction (avoidance) applied to the target) is the actual hit rate


Example 2:
  IER_HitValue: 40
, IER_HitReflectionUnit: false
, IER_HitReflectionWeapon: false
, IER_HitAvoid: false

(value of IER_HitValue) will be the actual hit rate

ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■IER_HitMark
Ignores the hit rate setting above and always hits.
(not set: true)

example:
IER_HitMark: true


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■IER_Indifference
Set whether to make it an indiscriminate attack involving allies
(When not specified: false) * Default value can be changed with EffectRangeItemDefault.js

example:
   IER_Indifference: true

Ranged attacks will also hit allies

Example 2:
   OT_Recovery: true
, IER_Indifference: true

Ranged recovery now hits enemies


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■IER_EXPMagnification
Set the experience value multiplier when you hit per person with a range attack.
(When not specified: 0.75) * Default value can be changed with EffectRangeItemDefault.js


example:
   IER_EXPMagnification: 3.0

If you get 10 experience points when hitting a target, you get 30 experience points.

example:
   IER_EXPMagnification: 0.5

If you get 10 experience points when hitting a target, you get 5 experience points.

ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■IER_GetEXP
Set the acquisition experience value that can always be obtained regardless of whether or not you hit when using a range attack.
(When not specified: 10) * Default value can be changed with EffectRangeItemDefault.js

example:
   IER_GetEXP:20

If you use an item and hit an enemy or ally, you will get 20+ α experience points.
If you do not hit an enemy or ally, you will always receive 20 experience points.
(Experience multiplier for IER_EXPMagnification is applied only to the +α part.)

example:
   IER_GetEXP: 0

When using an item, no experience value is acquired unless it hits an enemy or ally.


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ OT_Absorption Rate
Recovers HP equal to the amount of damage x the multiplier.The multiplier can be specified as a negative value.
If you set it as a recovery system, you will receive damage equal to the recovery amount x magnification (if omitted: 0.0)

example:
OT_Absorption Rate: 1.0
Recovers HP equal to damage

Example 2:
OT_Absorption Rate: -0.5
Give half of the damage dealt to the caster

Example 3:
   OT_Recovery: true
, OT_AbsorptionRate: 1.0
Damage to the caster according to the recovery amount


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ OT_MinRange, IER_RangeType, IER_RangeSpread, IER_EffectRangeType, IER_EffectSpread, IER_EffectRange
(Regarding range and effect range)

OT_MinRange : The area around the invoker will be out of range for the set value (when not specified: 0) *Default value can be changed with EffectRangeItemDefault.js
                     When IER_EffectRangeType is set to 4-6, if this value is less than 0
                     Forced to 1.
                     
IER_RangeType : Specifies the shape of the range range (when not specified: 0) * Default value can be changed with EffectRangeItemDefault.js
IER_RangeSpread : Adjust the spread of some ranges (when not specified: 1)
IER_EffectRangeType: Specifies the shape of the effect range (when not specified: 0) * Default value can be changed with EffectRangeItemDefault.js
IER_EffectSpread : Adjust the spread of some effect ranges (when not specified: 1)
IER_EffectRange : Specify the effect range from the item's activation position (when not specified: '0-0') * Default value can be changed with EffectRangeItemDefault.js

IER_RangeType is 0-3,
IER_EffectRangeType can be set from 0 to 7,99. (see also reference image for image of area of ​​effect)

0:
It's normal shape. Not affected by IER_RangeSpread, IER_EffectSpread.

1:
A cross-shaped range. Increasing IER_～Spread makes the range thicker

2:
X type range. Increasing IER_～Spread makes the range thicker

3:
It is a combination of ranges 1 and 2. Increasing IER_～Spread makes the range thicker

Four:
The range extends in a straight line from the activation point to the direction of activation. Increasing IER_~Spread makes the range thicker.
If OT_MinRange is specified as 0, the value of OT_MinRange is forced to 1.

Five:
The range extends horizontally to the direction of activation from the activation point. Increasing IER_~Spread makes the range thicker.
If OT_MinRange is specified as 0, the value of OT_MinRange is forced to 1.

6:
The range extends radially in the direction of activation from the activation point.
Increasing IER_~Spread narrows the range. (Diagonal shot is not possible for this type only)
If OT_MinRange is specified as 0, the value of OT_MinRange is forced to 1.
Also, IER_RangeType is forced to 1.

7:
A rectangular range. Not affected by IER_RangeSpread, IER_EffectSpread.

99:
The area of ​​effect is the entire map. If you specify this type,
The IER_RangeType and OT_MinRange settings are ignored and can be used anywhere.

example:
See Caspara template.txt.


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■OT_UseAddState, OT_UseDelState, IER_AddState, IER_DelState
By setting {0:100, 2:70, 3:90, …}, it is possible to specify multiple states to be added/released.
The setting method for each custom parameter is common.

example:
OT_UseAddState: {2:70}
ID2 state is granted to the user with a 70% chance

OT_UseDelState: {0:100, 1:70}
The user has a 100% chance of canceling the ID0 state, and a 70% chance of canceling the ID1 state.

IER_AddState: {0:100, 1:50}
The hit target has a 100% chance of being given an ID0 state and a 50% chance of being given an ID1 state.

IER_AddState: {0:100, 1:50}
The hit target has a 100% chance of canceling the ID0 state and a 50% chance of canceling the ID1 state.


Also, only OT_UseDelState and IER_DelState can specify the type of state to be released all at once by specifying the following.

{'AllState':100} // Release all states
{'BadState':100} // cancel the bad state
{'GoodState':100} // cancel the good state

*If you cancel all at once in the above, the cancellation judgment will be entered for each state.


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■OT_UseDamage
Set the recoil damage after use with a numerical value.
If you specify '(number)%' in the character string, it will be the percentage damage of the current HP, and 'M(number)%' will be the percentage damage of the maximum HP.
If - is attached to the beginning, it will be recovered (when not specified: 0)

example:
OT_UseDamage: 10
10 damage to caster upon activation

Example 2:
OT_UseDamage: '25%'
25% of the current HP damage to the caster when activated

Example 3:
OT_UseDamage: 'M50%'
Inflicts damage equal to 50% of maximum HP to the caster when activated.

Example 4:
OT_UseDamage: -10
Restores 10 to the caster upon activation



-----------------------------------------------------------------------------------------
-------Advanced settings--------------------------------------------------------------------
-----------------------------------------------------------------------------------------
ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■OT_DamageMagnification
When set, the final power will be the value multiplied by this value after adding the unit and weapon power.
(Not set: 1.0)

example:
   OT_Unit Reflection: true
, OT_WeaponReflection: true
, OT_DamageMagnification: 0.5
, IER_Value: 5

(5 + unit ability + weapon power) x 0.5 is the final attack power.
{If unit power is 10 and weapon power is 3, (5+10+3) x 0.5}

Example 2:
   OT_WeaponReflection: true
, OT_DamageMagnification: 2.0
, IER_Value: 10
(10 + weapon power) x 2.0 will be the final attack power

ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ OT_Statue Reflection
When OT_UnitReflection is true, you can set which abilities are added to power.
(Not set: Ability based on OT_DamageType setting)

・Parameter names that can be set
LV: LV
HP: Current HP
EP : Current EP
FP : Current FP
MHP: Maximum HP
MEP: Maximum EP
MFP: Maximum FP
POW: power
MAG: magical power
SKI: skill
SPD : speed
LUK: good luck
DEF: Defense power
MDF: Magic Defense
MOV: movement force
WLV: proficiency
BLD: physique

*OT_UnitReflection must be true
* Please set the value of the magnification with a decimal point.
*EP and FP can be specified by installing the "MP (EP) & special gauge addition script".

example:
OT_StatueReflection: {POW:1.0}
The power value is added to power.

OT_StatueReflection: {POW:0.5, MAG:0.5}
Half of the power value and half of the magical power value are added to the power.

OT_StatueReflection: {SPD:2.0}
Twice the speed is added to power.

ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■OT_AIScoreRate
Set the multiplier of the score used when deciding the action of the enemy AI.
The higher the number, the higher the priority for using that item (default: 1.0)


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ OT_UseDamageAnime, OT_UseDelGoodAnime, OT_UseDelBadAnime,
　IER_HitAnime, IER_MissAnime, IER_DelGoodAnime, IER_DelBadAnime

OT_UseDamageAnime : Setting the animation when the user damages.
OT_UseDelGoodAnime: Set the animation when the user's good state is canceled
OT_UseDelBadAnime : Anime setting when user's bad state is canceled
IER_HitAnime : Setting the animation when hitting the target
IER_MissAnime : Animation settings when the target avoids
IER_DelGoodAnime : Setting the animation when the target's good state is canceled
IER_DelBadAnime : Setting the animation when the target bad state is canceled

Behavior when not set:
OT_UseDelGoodAnime, IER_DelGoodAnime: Play 200 of runtime
OT_UseDelBadAnime, IER_DelBadAnime: Play runtime 101
OT_UseDamageAnime, IER_HitAnime : Play runtime effects 303 and play damage sound effects
IER_MissAnime : Only MISS notation is displayed.

The setting method for each custom parameter is common.

example:
  IER_HitAnime:[1, false]

Plays ID1 of the original effect on hit.

Example 2:
  IER_HitAnime:[1, true]
, IER_MissAnime:[2, false]

ID1 of the runtime effect on hit
Play ID2 of the original effect when dodging.

++++++++++++++++++++++++++++
(Old setting)
OT_EffectAnime : Animation setting when the item is activated (animation used in the editor → animation set in this parameter will be played in order)

Behavior when not set:
OT_EffectAnime : No animation playback

Currently, it is basically unnecessary because the "animation when using" is played on the editor side.
If you have set ↓ when setting "animation when using" on the editor side
The animation specified by ↓ is played after the animation on the editor side is played.

ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ IER_SupportAtk, IER_SupportHit, IER_SupportDef, IER_SupportAgi
Sets whether or not to be affected by the support effect when the power and hit rate of ranged attacks depend on the ability of the unit.
(When each item is not set: true)

・IER_SupportAtk: attack correction
If the power reflects the unit ability (OT_UnitReflection is set to true),
The attack correction of the support effect is added to the power.

・IER_SupportHit: hit correction
If the hit has a technique correction (IER_HitReflectionUnit is set to true),
The hit correction of the support effect is added to the hit rate.

・IER_SupportDef: Defense correction
If the attack type is physical or magic (OT_DamageType is set to 1 or 2),
The damage dealt to the opponent is reduced by the defense correction of the opponent's support effect.

・IER_SupportAgi: Evasion correction
If the opponent's avoidance value affects the hit rate (IER_HitAvoid is set to true),
Hit rate becomes [Hit rate - (opponent evasion value + evasion correction of opponent's support effect)].


example:
  IER_SupportAtk: true
, IER_SupportHit: true
, IER_SupportDef: false
, IER_SupportAgi: false

Your own support correction affects power and hit rate,
The damage value and hit rate are not affected by the opponent's support correction.

Example no:
  OT_Unit Reflection: false
, IER_SupportAtk: true

Since the unit ability is not reflected in the power, it is not affected by the attack correction of the support effect.

ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■IER_SoundDuplicate
Permission setting for duplication of animation sound effects when hitting or giving a state. Allowed with true.
(When not set: false) * Default value can be changed with EffectRangeItemDefault.js

example:
IER_SoundDuplicate: true

ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■OT_UseDamageDeath
Sets whether damage to the user with OT_UseDamage or OT_AbsorptionRate dies.
True allows death, false leaves 1 HP (unspecified: true)

example:
OT_UseDamageDeath: true
Die from damage after use

Example 2:
OT_UseDamageDeath: false
Does not die from damage after use


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ IER_MapChipChangeAfter (About terrain change effect)
The change effect of the terrain effect requires setting a custom parameter to the "Terrain effect" of the map as well.
"Tools" → "Data settings" → "Terrain effect" → Select the map chip list to be edited (Template-outdoor: 0 part)
→ "Edit terrain effect" → Select the terrain effect on the left and select "Custom parameters"
Then, write the following in the terrain for which you want to set custom parameters
{
  IER_MapChipChangeGroup : ['(group name 1)', '(group name 2)', …]
}

(group name): Please specify the group name. Multiple can be specified by separating with ,


The IER_MapChipChangeAfter value to be set for the item is set as follows
, IER_MapChipChangeAfter :
[
     ['(Group name)', (Ignore unit), [(Runtime use), (Terrain effect ID), (Use chip: X), (Use chip: Y)] ]
   , …
]

(Group name) : Specify the group name set in the custom parameter of the terrain effect above
(Ignore unit) : If false is specified, the terrain will not be changed if there is a unit in the area of ​​effect.
(use runtime) : true to use runtime maptips, false to use original maptips.
(Terrain effect ID) : Specify the ID of "Data settings" → "Terrain effect" (the number in the tree part of "Template" and "Original")
(Chip used: X) : Please specify the chip (number of horizontal squares) in "Data settings" → "Terrain effect".
(Chip used: Y) : Please specify the chip (number of vertical squares) of "Data setting" → "Terrain effect".

* If you specify 'ALL' for (group name), the map chip within the effect range will be changed regardless of the terrain information.
* If you specify as follows in the fields such as runtime use column
It will be changed to the terrain below the transparent chip (figurine).
Only map chips that are transparent chips or map chips that have been changed by changing the terrain with a ranged attack are valid.
　['(group name)', (unit ignored), []]

example:
See Caspara template.txt.

ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ (Old setting) IER_HitReflection
Set whether to add the unit ability (skill x 3) and weapon hit rate to the hit rate
(Even if set, IER_HitReflectionUnit and IER_HitReflectionWeapon will take precedence when set.)

example:
   IER_HitValue: 50
, IER_HitReflection:[true, false]
Unit skill x 3 is added to the hit rate set in IER_HitValue

Example 2:
   IER_HitValue: 50
, IER_HitReflection:[true, true]
The unit's skill x 3 and weapon hit rate are added to the hit rate set in IER_HitValue


-----------------------------------------------------------------------------------------
