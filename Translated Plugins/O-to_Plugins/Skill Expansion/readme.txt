-----------------------------------------------------------------------------------------
【Change log】
  2015/6/6: α version released
  2015/6/17: Beta version released
  2015/6/20: Skill activation condition Additional script and additional skill script are separated
  2015/11/09: Fixed the part where the display was undefined due to the deletion of the official definition
  2015/12/06: Create conditions such as adding command skills and limiting the number of times skills can be activated
  2016/01/11:
  Supports "MP & Special Gauge Addition" script
  If the return value of EC_SkillCheck.isCheckTriggerCount is not caught in the activation count limit, true,
  Fixed to be false if caught.
  Added so that the current value judgment of EP and FP and the consumption EP and consumption FP can be set.
  Fixed so that it will not be displayed if the conditions of EP, FP, and the number of turns are not met in the command skill.

  Corresponding because there is a part that does not work with official 1.048.
  Added EC_NowStatus and EC_OpponentNowStatus, settings for setting range conditions for parameters other than HP.
  EC_NowHP will be abolished eventually, so please set it to EC_NowStatus in the future.

  Changed the algorithm of EC_OverStatus and EC_UnderStatus because the skill level and physique were officially incorporated.
  In the future, even if parameters are added, unless the maximum value and the current value exist separately, such as HP and MP
  Unless there are exceptions such as different naming conventions
  EC_NowStatus, EC_OpponentNowStatus, without having to mess with this script
  Changed the algorithm so that additional parameters can be specified in EC_OverStatus and EC_UnderStatus.

  2016/04/26:
  Fixed a bug that an error occurs when setting the remaining HP reduction rate in the activation rate on the editor side
  Fixed a bug that the description is incurred when setting a valid partner on the editor side.
  Move most of the work to ExtraConfigBase.js
  Fusion, weapon type, and state status can now be set as skill activation conditions.
  Fixed a bug that you can not proceed from the weapon selection screen if you can not equip a weapon in the case of standby type with command skill

  2016/05/03:
  Fixed a bug that did not work properly even if the distance between the number of attacks (invoker, opponent) and the opponent was set.
  Corrected the display in skill information when setting the number of attacks (invoker, opponent) and the distance to the opponent
  Fixed a problem with the display of skill information when setting activation depending on whether the opponent is physical or magic.

  2016/08/29:
  If you set the activation rate and the opponent's closeout skill invalidation
  Fixed a bug that the setting of the valid partner of the editor is ignored.

  2016/10/03:
  Fixed a bug that an error occurs when setting the amount of FP on the skill side when "MP & Special Gauge Addition" is introduced.

  2017/02/05:
  Fixed the forgotten part of the variable declaration used for the for loop
  * In the same way, if there is another script that you forgot to declare, unintended behavior will occur.

  2017/05/15:
  Fixed to display the command skill attached to the unequipped weapon when selecting the command skill.
  Fixed the weapon selection screen after selecting the command skill attached to the weapon so that only the weapon with the corresponding skill is displayed.
  Fixed a bug that the command skill usage count was not counted properly when re-acting.

  2018/05/01:
  EC_NowHP, EC_OpponentNowHP, EC_isDirectAttack abolished
  If you want to use it, uncomment the EC_EnableManager.SkillCheckActivity function of ExtraConfigBase.js.

  With stealing, action recovery, and unlocking skills
  EC_TriggerCountMap: [(number of uses),'COMMAND']
  Added a setting so that the upper limit of the number of times of use in 1MAP can be specified by specifying
  Script detail modification

  2018/05/30:
  When a weapon with a command skill cannot be selected
  Fixed the phenomenon that the command skill set for the weapon can be selected.
  Fixed so that you can not select an opponent whose skill does not activate when selecting a target after selecting a weapon with an attack type command skill (only some conditions)
  
  2019/10/06:
  If "mouse operation" in the environment settings is turned off in the attack type command skill,
  Fixed an issue where cursor movement did not work properly when selecting an attack target after selecting a weapon.
  Fixed an issue where canceling after selecting a weapon with an attack-type command skill caused a double sound.

  2019/11/19:
  Fixed official skill re-action, support, parameter bonus, and weapon usage not reduced so that it can be activated with command skill.
  Added duration and cool time settings in command skills.
  If the skill activation condition specifies the weapon type as physical or magic,
  Fixed to display only the corresponding weapon in the list on the weapon selection screen
  
  With "transformation and" fusion "skills
  EC_TriggerCountMap: [(number of uses),'COMMAND']
  Added a setting so that the upper limit of the number of times of use in 1MAP can be specified by specifying.
  Some skills can be activated from command skills, and some activation conditions can be set.
  
  Fixed EC_SkillCheck.isCheckTriggerCount function in ExtraConfigSkill.js.
  Added EC_SkillCheck.isCheckTriggerCountCommand function
  Fixed the number check process when the skill activation count limit on 1 map is set to command type.

  2019/12/09:
  Corrected because the part corrected on 2019/10/06 reoccurred.
  If you give the initial members the skill of parameter bonus after the update of 2019/11/19, when you select the difficulty level at the start of the game
  Fixed an issue that caused an error when checking the details of characters with parameter bonus skills at the base.
  Fixed the attack type command skill so that weapons whose activation condition distance and weapon range do not match are not displayed in the weapon selection list.
  Deleted because it was described in the readme even though the Custom Parameter called EC_CheckType was not implemented.

  2020/01/01
  If you have multiple skills of the same type in some official scripts, only the one with the highest activation rate will be activated and checked.
  Corrected to prioritize the one specified in Custom Parameter and check the activation in order of priority
  
  ◆ Skills that activate the activation check in order of priority when you have multiple skills of the same type
  First strike, continuous attack, damage absorption, attack always hits, critical at counterattack, damage guard (originally checked by ID order), immortal
  Custom skill with SkillControl.checkAndPushCustomSkill to check activation
  
  Suppose you have two types of continuous attacks (2 attacks, 3 attacks) that are activated by command skills.
  In order to prevent it from happening that even if one skill is selected by the command skill, it will never be activated.
  
  Added Custom Parameter that adds the parameter specified for the activation rate to the activation rate.

  2020/01/07:
  Fixed an issue where skills could not be activated during forced battles at events.
  When checking whether it can be activated by the number of turns (isEnableTurn function),
  Corrected the process so that if the number of turns cannot be obtained, it will be treated as the first turn.

  2020/03/29
  Fixed to be able to set cool time even if it is not a command skill.
  
  During the cool time after using a skill for which a cool time is set
  The skill icon on the unit's status screen will be dimmed and
  Fixed so that the number of turns until reuse is displayed at the bottom of the skill icon and in the skill window.
  
  When using a command skill with a set number of continuous turns
  Fixed the skill icon on the unit status screen blinking and displaying the number of continuous turns at the top of the icon.
  
  2020/05/18:
  Due to the addition of processing when canceling after changing weapons at the time of attack in version 1.210 of studio
  Fixed an error when canceling on the weapon selection screen of an attack type command skill. 
  
-----------------------------------------------------------------------------------------
[How to Install]
Copy the "OT_ExtraConfigSkill" folder in the Plugin folder.
  See also "Setting example.txt" and "Conditions that can be set for unlocking, re-action and others.txt" for setting examples.

* Depending on the custom script used, the activation order check (Duplicate Skill.js) of the same type of skill may be used.
Because it may cause conflict, in some cases the description may be moved to another script
Please remove the corresponding plugin (DuplicateSkill.js). 
 
-----------------------------------------------------------------------------------------
【Overview】
■ ExtraConfigSkill.js
By passing a custom parameter to the skill that can set the activation rate
The activation probability can be set to 50+ (force x 0.5), etc.
It is a script that can set the activation condition such as HP is 50% or less.
(It has no effect on skills that cannot set the activation rate (re-attack, critical hit, etc.))

* Please be sure to use it as a set with TemporaryDataVirtualAttack.js.

■ ExtraConfigBase.js
Scripts that define functions and constants used in various scripts.

■ TemporaryDataVirtualAttack.js
At the time of battle, create an object called tmpNowVirtualAttack in custom of Unit,
It is a script to temporarily hold virtualAttackUnit in tmpNowVirtualAttack.

■ window-skillinfoExtra.js
By ExtraConfigSkill.js in the skill description column of the unit details
It is a script that displays the set activation conditions.
Also, skills during cool time or skills that have a sustained effect
The skill icon is blinking and the number of turns is displayed.

■ CommandSkill.js
It is a script to activate the skill from the command.
Create an element in the skill list window from "Command Skills".

■ windowmanager-skillselectmenu.js
It is a script to activate the skill from the command.
Generates a skill list window from "Command Skills".

■ window-skilllist.js
It is a script to activate the skill from the command.
Create an element in the skill list window from "Command Skills".

■ CommandSkillRuntime.js
It is a script to set the conditions of the skill to be activated on the map such as unlocking with the official skill.
For the items that can be set, refer to "Conditions that can be set for unlocking, re-action and others.txt".

■ Duplicate Skill.js
If you have multiple skills of the same type in some official scripts, only the one with the highest activation rate will be activated and checked.
Modified to give priority to the one specified in priority in Custom Parameter and check the activation in order of priority 

-----------------------------------------------------------------------------------------
【how to use】
In "Tools"-> "Data Settings"-> "Skills"-> "Custom Parameters"
Open the custom parameter setting screen and open
Select a skill that can set the activation rate and set as follows.
(See setting example 1-1.jpg, setting example 1-2.jpg)

* For EP and FP, it is necessary to introduce "MP & Special Gauge Addition". 

----------------------------------------------------
EC_Putlog: Set whether the activation condition and activation probability are output to the console before the skill is activated.
EC_DefaultPercent: Set when you want to add an absolute value to the activation rate
EC_Correction: When set, the activation rate becomes (Stats x percentage on the editor side x set value). Set when you want to do something like 0.5 x status.
EC_ScopePercent: Set the lower and upper limits of the activation rate
EC_AddTriggerRate: Add (another Stats x percentage) to the activation rate
EC_isAbandonIgnore: Ignore or set opponent's skill invalidation
EC_TriggerCountBattle: 1 Set the skill activation count limit in battle (disabled if EC_CommandCoolTime is specified without EC_Command set)
EC_TriggerCountTurn: Set the skill activation count limit in one turn (disabled if EC_CommandCoolTime is specified without EC_Command set)
EC_TriggerCountMap: 1 Set the skill activation count limit on the map
EC_UseEP: Set consumption EP
EC_UseFP: Set consumption FP
EC_NowStatus: Set the Stats range required for activation
EC_isPhysics: Set whether the equipped weapon is physical or magical
EC_StartTurn: Set the activation start turn
EC_EndTurn: Set the activation end turn
EC_TimesTurn: Set whether to activate in a specific multiple turn
EC_isSrc: Set activation first or second
EC_OverStatus: Set whether the Stat is higher than the other party for each stat
EC_UnderStatus: Set whether the Stat is lower than the other party for each stat
EC_Command: Set whether it is a command skill
EC_CommandDuration: The number of continuous turns after executing the command skill (when not set, the same operation as the old script, the effect is exhibited until it becomes possible to act again)
EC_CommandCoolTime: The number of turns required from executing a command skill to being reusable
                         (If EC_Command is not set, that is, if it is not a command skill, it will be the number of turns until it can be reactivated after the skill is activated)
EC_AttackCount: Set the number of attacks before activation
EC_Range: Set the distance to the other party (adjacent with 1-1)
EC_FusionID: Set fusion ID
EC_StateID: Set the state ID required for activation
EC_WeaponType: Set the weapon type required for activation
EC_isOpponentPhysics: Set whether the opponent's weapon is physical or magical
EC_OpponentNowStatus: Set the Stats range of the opponent required for activation
EC_OpponentAttackCount: Set the number of attacks of the opponent before activation
EC_OpponentFusionID: Set the fusion ID of the opponent required for activation
EC_OpponentStateID: Set the state ID of the other party required for activation
EC_OpponentWeaponType: Set the opponent's weapon type required for activation
EC_Priority: Set the activation priority when you have skills in the same category (two consecutive attacks, etc.)


----------------------------------------------------
・Setting Example
{
    EC_Putlog              : 1
  , EC_DefaultPercent      : 50
  , EC_Correction          : 0.01
  , EC_ScopePercent        : '1-50%'
  , EC_AddTriggerRate      : { LV:0.0, HP:0.0, EP:0.0, FP:0.0, POW:0.5, MAG:0.5, SKI:0.0, SPD:0.0, LUK:0.0, DEF:0.0, MDF:0.0, MOV:0.0, WLV:0.0, BLD:0.0 }
  , EC_isAbandonIgnore     : true
  , EC_TriggerCountBattle  : 1
  , EC_TriggerCountTurn    : 3
  , EC_TriggerCountMap     : [3, 'MAP']
  , EC_UseEP               : 50
  , EC_UseFP               : '50%'
  , EC_NowStatus           : { LV:'0-9', HP:'0-50%', EP:'0-50%', FP:'0-50%', POW:'0-10', MAG:'0-9', SKI:'0-9', SPD:'0-10', LUK:'0-10', DEF:'0-10', MDF:'0-10', MOV:'0-10', WLV:'0-10', BLD:'0-10' }
  , EC_OpponentNowStatus   : { LV:'0-9', HP:'0-50%', EP:'0-50%', FP:'0-50%', POW:'0-10', MAG:'0-9', SKI:'0-9', SPD:'0-10', LUK:'0-10', DEF:'0-10', MDF:'0-10', MOV:'0-10', WLV:'0-10', BLD:'0-10' }
  , EC_isPhysics           : true
  , EC_isOpponentPhysics   : true
  , EC_StartTurn           : 5
  , EC_EndTurn             : 5
  , EC_TimesTurn           : 3
  , EC_isSrc               : true
  , EC_OverStatus          : { LV: 9, HP: 0, EP:1, FP:1, POW: 1, MAG: 2, SKI: 3, SPD: 4, LUK: 5, DEF: 6, MDF: 7, MOV: 8, WLV:9, BLD:10 }
  , EC_UnderStatus         : { LV: 9, HP: 0, EP:1, FP:1, POW: 1, MAG: 2, SKI: 3, SPD: 4, LUK: 5, DEF: 6, MDF: 7, MOV: 8, WLV:9, BLD:10 }
  , EC_Command             : 'ATTACK'
  , EC_CommandDuration     : 3
  , EC_CommandCoolTime     : 1
  , EC_AttackCount         : '0-1'
  , EC_OpponentAttackCount : '0-1'
  , EC_Range               : '1-2'
  , EC_FusionID            : [0, 1]
  , EC_OpponentFusionID    : [0, 1]
  , EC_StateID             : 'GOOD'
  , EC_OpponentStateID     : [1, 2]
  , EC_WeaponType          : {PHYSICS:'ALL', SHOOT:[0], MAGIC:[0]}
  , EC_OpponentWeaponType  : {PHYSICS:[0], SHOOT:[0], NON:true}
  , EC_Priority            : 100


}


----------------------------------------------------

If each parameter is omitted, it will not be set.
The set parameters are reflected in the skill window as the skill activation conditions.
(See setting example 2-1.jpg, setting example 2-2.jpg)

* Please refer to the setting example.txt for the setting example. 

ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ EC_Putlog
Set whether to output the activation condition and activation probability to the console before activating the skill.
(For debugging)

example:
EC_Putlog: true Appears in the console.
EC_Putlog: false Does not appear in the console.
(See screen 2.jpg) 

ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ EC_DefaultPercent
Set when you want to add an absolute value to the activation rate.

example:
"Activation rate" speed%,
If you set EC_DefaultPercent: 20, the activation rate will be "20 + speed%". 


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ EC_Correction
Set this when you want to set a decimal point for the activation rate.
* The final activation rate will be rounded off to the nearest whole number.

example:
"Activation rate" is power%,
If you set EC_Correction: 0.5, the activation rate will be "(force x 0.5)%".
Furthermore, if EC_DefaultPercent: 50 is also set, the activation rate will be "50 + (power x 0.5)%".
(See screen 1.jpg) 


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ EC_ScopePercent
You can set the lower and upper limits of the skill activation rate.
No matter how high the status is, what percentage should the maximum activation rate be?
On the contrary, it is used when you want to increase the activation rate when the status exceeds a certain value.

example:
EC_ScopePercent: '1-50%' The lower limit is 1% and the upper limit is 50%.
EC_ScopePercent: '10-100%' The lower limit is 10% and the upper limit is 100%. 

ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ EC_AddTriggerRate
Add (another status x percentage) to the activation rate.
For when you want to add more than one parameter to the trigger rate.

-Parameter name
LV: LV
HP: Current HP
EP: Current EP
FP: Current FP
MHP: Maximum HP
MEP: Maximum EP
MFP: Maximum FP
POW: Power
MAG: Magical power
SKI: Technique
SPD: Speed
LUK: Good luck
DEF: Defensive power
MDF: Magic defense
MOV: Mobility
WLV: Skill level
BLD: Physical constitution

example:
EC_AddTriggerRate: {POW: '0.5'}
The activation rate will be the sum of power x 0.5%.

EC_AddTriggerRate: {POW: '0.5', MAG: '0.5'}
The activation rate will be the sum of (power x 0.5 + magic power x 0.5)%. 

ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ EC_isAbandonIgnore
It is a setting whether to activate the skill by ignoring the opponent's skill invalidation.
If you set EC_isAbandonIgnore: true, you can activate the skill by ignoring the opponent's skill invalidation. 



ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ EC_NowStatus
Set the status range to activate.
Parameter specification is {(parameter name) :( numerical value), (parameter name) :( numerical value)}
Enclose it in {} and specify it for each parameter.
If you do not add% at the end, it will be in the specified value range, and if you add% at the end, it will be in the specified percentage range.

* Be sure to enclose the value in single quotes (').
* If parameters other than HP, EP, and FP are specified as percentages, the upper limit of growth will be treated as the maximum value.
  For example, if you specify MAG: '50 -100%', if the upper limit of magical growth is 50, it will be activated if the current magical power is 25-50.

-Parameter name
LV: LV
HP: Current HP
EP: Current EP
FP: Current FP
MHP: Maximum HP
MEP: Maximum EP
MFP: Maximum FP
POW: Power
MAG: Magical power
SKI: Technique
SPD: Speed
LUK: Good luck
DEF: Defensive power
MDF: Magic defense
MOV: Mobility
WLV: Skill level
BLD: Physical constitution

example:
EC_NowStatus: {HP: '0-30%', EP: '0-100'}
Can be activated if HP is 0 to 30% and EP is 0 to 100.

EC_NowStatus: {POW: '0-100', MAG: '50-100%'}
It can be activated if the power is 0 to 100 and the magic power is 50 to 100% of the upper limit of growth. 

ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ EC_OpponentNowStatus
Set the status area of the opponent to activate.
Parameter specification is {(parameter name) :( numerical value), (parameter name) :( numerical value)}
Enclose it in {} and specify it for each parameter.
If you do not add% at the end, it will be in the specified value range, and if you add% at the end, it will be in the specified percentage range.

* Be sure to enclose the value in single quotes (').
* If parameters other than HP, EP, and FP are specified as percentages, the upper limit of growth will be treated as the maximum value.

-Parameter name
* Same as EC_NowStatus

example:
EC_OpponentNowStatus: {HP: '0-30%', EP: '0-100'}
Can be activated if the opponent's HP is 0 to 30% and EP is 0 to 100.

EC_OpponentNowStatus: {LV: '0-10', BLD: '0-10'}
Can be activated if the opponent's LV is 0 to 10 and the physique is 0 to 10. 

ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ EC_isPhysics
Set the activation condition whether the weapon you are equipped with is physical or magical.
If true, you can activate the skill if you are equipped with a physical weapon, if false, you can activate the skill.

example:
EC_isPhysics: true Your own weapon can be activated physically.
EC_isPhysics: false You can magically activate your own weapon. 


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ EC_isOpponentPhysics
Set the activation condition whether the weapon equipped by the opponent is physical or magic.
If true, you can activate the skill if you are equipped with a physical weapon, if false, you can activate the skill.

example:
EC_isOpponentPhysics: true The opponent's equipped weapon can be activated physically.
EC_isOpponentPhysics: false The opponent's equipped weapon can be activated by magic. 


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ EC_StartTurn
Set whether the current number of turns is above a certain level as the activation condition.

example:
EC_StartTurn: 3 Can be activated if the current number of turns is 3 or more. 


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ EC_EndTurn
Set the activation condition whether the current number of turns is below a certain level.

example:
EC_EndTurn: 5 Can be activated if the current number of turns is 5 or less. 


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ EC_TimesTurn
Set the activation condition whether the current number of turns is a specific multiple.

example:
EC_TimesTurn: 2 Can be activated if the current number of turns is a multiple of 2. 


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ EC_isSrc
Set the activation condition depending on whether or not you launched an attack from here.

example:
EC_isSrc: true Can only be activated when attacking from here
EC_isSrc: false Can only be activated when attacked by the opponent 


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ EC_OverStatus
Set whether the status is higher than the opponent as the activation condition.
Parameter specification is {(parameter name) :( numerical value), (parameter name) :( numerical value)}
Specify by enclosing it in {}.

-Parameter name
LV: LV
HP: Current HP
EP: Current EP
FP: Current FP
MHP: Maximum HP
MEP: Maximum EP
MFP: Maximum FP
POW: Power
MAG: Magical power
SKI: Technique
SPD: Speed
LUK: Good luck
DEF: Defensive power
MDF: Magic defense
MOV: Mobility
WLV: Skill level
BLD: Physical constitution

* The status used to determine the activation condition is
The status includes "parameter correction by class and item".
* To specify EP and FP, it is necessary to install the "MP & Special Gauge Addition" script.

example:
EC_OverStatus: {POW: 3} Can be activated if the power is 3 or more than the opponent
EC_OverStatus: {DEF: 2, MDF: 1} Can be activated if the defense power is 2 or more than the opponent and the magic defense power is 1 or more than the opponent. 


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ EC_UnderStatus
Set whether the status is lower than the opponent as the activation condition.
Parameter specification is {(parameter name) :( numerical value), (parameter name) :( numerical value)}
Specify by enclosing it in {}.

-Parameter name
* Same as EC_OverStatus

* The status used to determine the activation condition is
The status includes "parameter correction by class and item".
* To specify EP and FP, it is necessary to install the "MP & Special Gauge Addition" script.

example:
EC_UnderStatus: {SPD: 3} Can be activated if the speed is 3 or less than the opponent
EC_UnderStatus: {DEF: 2, MDF: 1} Can be activated if the defense power is 2 or less than the opponent and the magic defense power is 1 or less than the opponent. 


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ EC_Command
By setting this parameter,
An item called "command skill" has been added to the unit command.
By selecting it, you will be able to activate the skill.
(If there is no skill that can be used, it will not be displayed in the unit command.)

Depending on the value passed to Custom Parameter
You can specify two types, an attack type that attacks after selecting a skill and a standby type that waits after selecting a skill.
The flow of "command skill" is as follows.

Attack type: "Command skill"-> "Select weapon to use"-> "Select opponent to attack"-> End action after battle
Standby type: "Command skill"-> "Select equipment weapon"-> End of action (If EC_CommandDuration is not set in the specifications, the skill of re-action will not be activated)

* For both types, after selecting a skill, until the next own turn, or until the unit can re-act by action recovery
The skill can be activated during battle.
If you want to "activate only when attacking from here", set EC_isSrc to ture or set EC_CommandDuration to 0.
If you want to activate it only once until your turn, please use the EC_TriggerCountTurn setting together.

example:
EC_Command:'ATTACK' Specifies the attack type
EC_Command:'WAIT' Specifies the wait type 


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ EC_CommandDuration
If you set it when setting EC_Command
The skill will be activated for the specified number of turns from the selection in "Command Skill".
If it is not set, it will be canceled when it becomes possible to act again in the next turn or action recovery.
Also, if you use a standby type command skill and wait using a skill for which EC_CommandDuration has not been set, re-action will not be activated due to the above specifications.
(Same behavior as the script until 2019/10/06)

If the command skill is attack type, set EC_CommandDuration to 0
The skill will be activated only when attacking from the command skill.

In addition, the skill icon on the status screen of the unit blinks while the skill is sustained,
The number of continuous turns is displayed at the top of the skill icon.

example:
EC_CommandDuration: 3 The skill will be activated for 3 turns after selecting from the command skills.

EC_CommandDuration: 0 Effective only at the moment of attack after selecting a command skill. 

ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ EC_CommandCoolTime
If you set it when setting EC_Command
You will not be able to reselect the specified skill from the command skill for the specified number of turns from the selection in "Command skill".
For example, if you set EC_CommandDuration to 3 and EC_CommandCoolTime to 5.
The skill will be activated for 3 turns from the selection in "Command skill".
You will be able to reselect with "Command Skill" after 5 turns.

If EC_Command is set when it is not set,
It will be the number of turns until it can be reactivated after the skill is activated.
* In that case, even if you set EC_TriggerCountBattle or EC_TriggerCountTurn, it will be invalid.

During the cool time, the skill icon on the unit status screen will be dim.
The number of turns until it can be reused is displayed at the bottom of the icon and in the skill window.
(If the skill is sustained by EC_CommandDuration, the skill icon will not be dimmed.)

example:
// Skills cannot be selected from command skills for 3 turns after selection from command skills.
EC_Command:'ATTACK'
, EC_CommandCoolTime: 3

// Skills cannot be selected from command skills from the time they are selected from command skills until the next turn. Set when you do not want to use it many times due to re-action.
EC_Command:'ATTACK'
, EC_CommandCoolTime: 1

// After activating the skill, it will not be activated for 3 turns
EC_CommandCoolTime: 3 

ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ EC_TriggerCountBattle
Set the limit on the number of skill activations in one battle.

example:
EC_TriggerCountBattle: 1 Can be activated once in a battle
EC_TriggerCountBattle: 3 Can be activated 3 times in 1 battle 


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ EC_TriggerCountTurn
Set the limit on the number of times the skill can be activated in one turn.

example:
EC_TriggerCountTurn: 1 Can be activated once per turn
EC_TriggerCountTurn: 3 Can be activated 3 times in 1 turn 


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ EC_TriggerCountMap
1 Set the limit on the number of skill activations on the map.
If you set the second value to be passed to'MAP', you can set it to'COMMAND'for each skill activation.
Each time you select a skill from a unit command, the number of remaining uses will decrease.
* When setting to'COMMAND', set EC_Command.

example:
EC_TriggerCountMap: [1,'MAP'] Can be activated once per map
EC_TriggerCountMap: [3,'COMMAND'] Can be used 3 times with command skill 


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ EC_AttackCount
Set the number of attacks before activating the skill as the activation condition.

example:
EC_AttackCount: '0-0' Can be activated if you have never attacked
EC_AttackCount: '1-100' Can be activated after attacking once 

ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ EC_OpponentAttackCount
Set the number of attacks of the opponent before activating the skill as the activation condition.

example:
EC_OpponentAttackCount: '0-0' Can be activated if the opponent has never attacked
EC_OpponentAttackCount: '1-100' Can be activated after the opponent attacks once 


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ EC_Range
Set the distance from your own square to the opponent's square as the activation condition.

example:
EC_OpponentAttackCount: '1-1' Can be activated if the opponent is adjacent
EC_OpponentAttackCount: '2-3' Can be activated if it is 2-3 from your own square to the opponent's square 


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ EC_UseEP
Set the required EP at the time of activation. If you do not add% at the end, the specified value,
If you add% at the end, it will be the specified percentage value.
When the skill is activated, the set amount of EP will be consumed.
* When specifying a percentage, be sure to enclose the value in single quotes (').

example:
EC_UseEP: 10 Can be activated if EP is 10 or more. Consume 10 EP after activation
EC_UseEP: '30%' Can be activated if EP is 30% or more. Consume 30% EP after activation.

* It is necessary to install the "MP & Special Gauge Addition" script. 


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ EC_UseFP
Set the required FP at the time of activation. If you do not add% at the end, the specified value,
If you add% at the end, it will be the specified percentage value.
When the skill is activated, the set amount of FP will be consumed.
* When specifying a percentage, be sure to enclose the value in single quotes (').

example:
EC_UseFP: 10 Can be activated if FP is 10 or more. Consume 10 FP after activation
EC_UseFP: '30%' Can be activated if FP is 30% or more. Consume 30% FP after activation

* It is necessary to install the "MP & Special Gauge Addition" script. 

ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ EC_FusionID
Set the fusion state required to activate the skill.
The parameters are specified as [(Fusion ID), (Fusion ID),…]
Alternatively, set'ALL'or'NON'.

example:
EC_FusionID: [1] Can be activated if the ID is 1 in the fusion state.
EC_FusionID: [0, 2] Can be activated if ID is 0 and 2 fusion state
EC_FusionID:'ALL' Can be activated in fusion state
EC_FusionID:'NON' Can be activated if not fused 


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■ EC_OpponentFusionID
Set the fusion state of the opponent required to activate the skill.
The parameters are specified as [(Fusion ID), (Fusion ID),…]
Alternatively, set'ALL'or'NON'.

example:
EC_OpponentFusionID: [1] Can be activated if the other party is in a fusion state with ID 1.
EC_OpponentFusionID: [0, 2] Can be activated if the opponent is in a fusion state with IDs 0 and 2.
EC_OpponentFusionID:'ALL' Can be activated if the opponent is in a fusion state
EC_OpponentFusionID:'NON' Can be activated if the opponent is not fused 

ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■EC_StateID
This parameter sets the state ID required to activate the skill.
Parameters can be specified as [ (State ID), (State ID), ... ].
Or set 'ALL', 'GOOD', 'BAD', 'NON', 'NONGOOD', 'NONBAD'.

If the parameter is specified as [ 'NON', (state ID), (state ID), ... ], then the specified value is used.
then it is possible to trigger if the state ID is not specified.

For example
EC_StateID : [1] If the state with ID 1 is given, it can be activated.
EC_StateID : [0, 2] If the state with ID 0 and 2 is given, it can be activated.
EC_StateID : ['NON', 0, 1] Can be triggered if the state with ID 0 and 1 is not given
EC_StateID : 'ALL' Can be triggered if any state is given
EC_StateID : 'GOOD' Can be triggered if a GOOD state is attached
EC_StateID : 'BAD' Can be triggered if a BAD state is attached
EC_StateID : 'NON' Can be triggered if no state is given
EC_StateID : 'NONGOOD' Can be triggered if no GOOD state is given
EC_StateID : 'NONBAD' Can be triggered if no BAD state is given


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■EC_OpponentStateID
This sets the state ID of the opponent required to activate the skill.
Parameters can be specified as [ (State ID), (State ID), ... ].
Or set 'ALL', 'GOOD', 'BAD', 'NON', 'NONGOOD', 'NONBAD'.

If the parameter is specified as [ 'NON', (state ID), (state ID), ... ], then the specified value is used.
then it is possible to trigger if the state ID is not specified.

For example
EC_StateID : [1] If the state with ID 1 is given, it can be activated.
EC_StateID : [0, 2] If the state with ID 0 and 2 is given, it can be activated.
EC_StateID : ['NON', 0, 1] Can be triggered if the state with ID 0 and 1 is not given
EC_StateID : 'ALL' Can be triggered if any state is given
EC_StateID : 'GOOD' Can be triggered if a GOOD state is attached
EC_StateID : 'BAD' Can be triggered if a BAD state is attached
EC_StateID : 'NON' Can be triggered if no state is given
EC_StateID : 'NONGOOD' Can be triggered if no GOOD state is given
EC_StateID : 'NONBAD' Can be triggered if no BAD state is given


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■EC_WeaponType
Sets the weapon type required to activate the skill.
The parameter is { (WeaponType):[(ID), (ID), ...], ... }.
enclosed in {}.
The weapon types that can be specified are as follows

PHYSICS : Warrior type (melee type)
SHOOT : Shooting type
MAGIC : Magic type

You can also specify a weapon type as (weapon type):'ALL'.
If you set (Weapon Type):'ALL', you can activate it when you equip a weapon that belongs to that weapon type.

If you specify the parameter [ NON:true, (weapon type):[(ID), (ID), ...], ... ], it will be activated when you equip a weapon belonging to that weapon type.
then it will only work if you do not have the specified weapon type equipped.

For example
EC_WeaponType : {PHYSICS:[0, 1]} Activated when equipped with a weapon of warrior type whose weapon type ID is 0 or 1.
EC_WeaponType : {SHOOT:'ALL', MAGIC:'ALL'} Activated when a ranged or magic weapon is equipped.
EC_WeaponType : {PHYSICS:'ALL', MAGIC:[0]} Activates when equipped with a warrior weapon or a magic weapon with a weapon type ID of 0.
EC_WeaponType : {NON:true, PHYSICS:'ALL'} Activated if no warrior weapon is equipped.

In the initial state of the editor, the ID assigned to each weapon type is as follows.

Warrior type
0...Sword, 1...Spear, 2...Axe
Shooting
0...Bow
Magic
0...magic


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■EC_OpponentWeaponType
Sets the weapon type of the opponent required to activate the skill.
The parameter is specified as { (WeaponType):[(ID), (ID), ...], ... }
enclosed in {}.
The weapon types that can be specified are as follows

PHYSICS : Warrior type (melee type)
SHOOT : Shooting type
MAGIC : Magic type

You can also specify a weapon type as (weapon type):'ALL'.
If you set (Weapon Type):'ALL', you can activate it when you equip a weapon that belongs to that weapon type.

If you specify the parameter [ NON:true, (weapon type):[(ID), (ID), ...], ... ], it will be activated when you equip a weapon belonging to that weapon type.
then it will only work if you do not have the specified weapon type equipped.

Example.
EC_OpponentWeaponType : {PHYSICS:[0, 1]} Activated when equipped with a warrior type weapon with an ID of 0 or 1.
EC_OpponentWeaponType : {SHOOT:'ALL', MAGIC:'ALL'} Activated when equipped with a ranged or magic weapon.
EC_OpponentWeaponType : {PHYSICS:'ALL', MAGIC:[0]} Activated when equipped with a warrior weapon or a magic weapon with a weapon type ID of 0.
EC_OpponentWeaponType : {NON:true, PHYSICS:'ALL'} Activated if no warrior weapon is equipped.



ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
■EC_Priority
This parameter determines the priority of skills in the same category.
If you have multiple skills of the same category, the skill with the higher value will be activated first.
If a skill is successfully activated, that skill will be activated.
If you fail, the next higher skill will be activated.
This setting is only valid for some of the triggered skills.

◎If you have more than one of the same type of skill, the activation checks will take effect in order of priority.
First Strike, Continuous Strike, Damage Absorption, Attacks Always Hit, Critical on Counterattack, Damage Guard (formerly Activation Check in ID order), Invulnerability.
Custom Skills that have activation checks in SkillControl.checkAndPushCustomSkill

If the skills are the same, but one is a command skill and the other is a non-command skill
Set the EC_Priority of the command skill to a higher value.

For example
If you have a Continuous Skill A (2 consecutive attacks) and a Continuous Skill B (5 consecutive attacks)

Skill B (5 attacks) has an EC_Priority of 100
Skill A (2 attacks) has EC_Priority:50

then
If you set EC_Priority:50 to Continuous Skill B (5 consecutive attacks), then Continuous Skill A (2 consecutive attacks) will be checked in that order.
The skill that succeeds the first time will be used.
