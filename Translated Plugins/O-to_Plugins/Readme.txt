--------------------------------------------------------------------------

Author:
  o-to
  
  Notification blog: http://o-to-no-hokanko.blogspot.jp/
  Email address: otogamemailrece@gmail.com
  
  Change log:
  2015/6/6:
  α version released
  
  2015/6/17:
  Beta version released
  
  2015/6/20:
  Addition of assault-like skills,
  Skill activation conditions Separate scripts for additional skills and scripts for additional skills
  
  2015/9/6:
  Assault skill fix due to removal of official function
  Scripting for prohibition of sortie

  2015/9/13:
  "Ranbu" corresponds to 1-239's integrated CalA nore attack
  
  2015/9/26:
  Battle talk scripting
  
  2015/10/5:
  Fixed to generate Attack lines when Move is not set.
  Implemented so that battle talk will appear even in simple battles
  Partial correction of readme description
  
  2015/10/11:
  Creating a new range attack item (prototype)
  
  2015/10/13:
  Added various elements such as range specification and additional status
  
  2015/10/14:
  Fixed BattleTalk.js with official update
  
  2015/10/31:
  Corresponds to invalidation of skill status abnormalities and improves enemy AI
  Added display of damage value, modified to play damage effect and unit disappearance at the same time
  Fixed the animation when granting a state to depend on the map animation of the state
  Added map terrain change effect
  Changed to do damage when used together with enemy damage
  Fixed due to name change of official function in some skills
  
  2015/11/09:
  Fixed the part where the display was undefined due to the deletion of the official definition of "Skill activation condition addition"
  
  2015/12/04: 2015/12/04:
  Fixed because the latest version of "Range Attack Item" ends with an error.
  Supports animation playback on the tool side
  
  2015/12/06:
  "Add skill activation conditions" command Create conditions such as skill addition and skill activation count limit
  Added the setting example of "range attack item" readme, and corrected some description.
  
  2016/01/06:
  Prototype creation of MP & deadly gauge
  
  2016/01/11:
  ■ Skill activation conditions added
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

  ■ MP & Special Gauge added
  Fixed a bug that caused an error when exchanging items with a unit that is not full of possessed items.
  Fixed a bug that the motion goes wrong when EP / FP is interrupted in the middle of an attack during real-time battle.
  Fixed EP and FP drawing so that it doesn't conflict with CB's class description script.
  In the simple window that appears when you move the cursor to the unit on the map
  Fixed so that the current EP / FP is displayed.

  2016/02/13:
  ■ Battle Talk
  1.058 compatible, fixed because an error occurs when activating the skill
  
  2016/02/28:
  Supports sortie prohibition and range attack 1.060
  ■ No sortie
  Fixed because it was an error due to the deletion of the official function
  
  ■ Range attack
  Fixed a bug that caused an error when an enemy was surrounded by allies and terrain.
Corrected because an error occurred due to the 1.060 enemy AI correction
  
  2016/03/23:
  ■ Range attack
  1.067 error first aid
  
  2016/04/26:
  ■ MP addition
  Corrected EP and FP constants
  
  ■ Range attack
  Fixed a bug where enemies wouldn't use auxiliary-only range items
  
  ■ Skill activation conditions
  Fixed a bug that an error occurs when setting the remaining HP reduction rate in the activation rate on the editor side
  Fixed a bug that the description is incurred when setting a valid partner on the editor side.
  Moved most of the work from ExtraConfigSkill.js to ExtraConfigBase.js
  Fusion, weapon type, and state status can now be set as skill activation conditions.
  Fixed a bug that you can not proceed from the weapon selection screen if you can not equip a weapon in the case of standby type with command skill

2016/05/03:
  ■ Range attack
  Fixed so that the damage display and HP recovery amount display are omitted when auxiliary only (fixed damage or fixed recovery amount is 0).
  Magnification can be set for the score used to determine the action of enemy AI
  Fixed to recover HP when using negative designation for damage
  It is now possible to set the HP absorption rate of the damage done
  
  ■ Skill activation conditions
  Fixed a bug that did not work properly even if the distance between the number of attacks (invoker, opponent) and the opponent was set.
  Corrected the display in skill information when setting the number of attacks (invoker, opponent) and the distance to the opponent
  Fixed a problem with the display of skill information when setting activation depending on whether the opponent is physical or magic.

  2016/06/13:
  ■ MP addition
  Fixed a bug that EP and FP were not consumed due to the infinite number of weapons for user expansion of tools.
  
  ■ Additional skills
  Recreate the cancellation that was posted to a certain thread and left unattended

  2016/07/31:
  ■ Range attack item
  1.086 compatible, fixed to end with an error when using

  ■ MP & Special Gauge added
  1.086 compatible, fixed because the initial EP and FP were in the 0 state
  Implemented EP auto-recovery value for unit, class, and item settings
  Corrected because there was a mistake in the EP natural recovery value
  Add processing when you want to implement only EP or FP
  (UnitFP.js for EP only, UnitEP.js for FP only can be excluded to implement only one)
  
  2016/08/22:
  ■ MP & Special Gauge added
  Fixed a bug that EP and FP of the unit that became a friend in information gathering was 0.
  Fixed so that EP and FP can be set to give a state or die when it becomes a specific area in the class setting

  2016/08/29:
  ■ Skill activation conditions
  If you set the activation rate and the opponent's closeout skill invalidation
  Fixed a bug that the setting of the valid partner of the editor is ignored.

  2016/09/18:
  ■ MP & Special Gauge added
  EP consumption and FP consumption can be set according to the movement cost (movement power required to move to that point)
  The image is not cached when drawing the window or gauge,
  Fixed a problem that memory was accumulated more and more while the application was running.

  2016/10/03:
  ■ MP & Special Gauge added
  Fixed a problem if EP and FP are less than the EP usage and FP usage of the weapon used after pursuit.

  ■ Skill activation conditions
  Fixed a bug that an error occurs when setting the amount of FP on the skill side when "MP & Special Gauge Addition" is introduced.

  2016/10/17:
  ■ MP & Special Gauge added
  Fixed an error in the availability of items due to a variable error

  ■ Range attack item
  Fixed to be able to set the value of each status to affect the power correction
  Added a setting to multiply the final attack power by the correction value
  Corrected some typographical errors and corrected the readme

  2017/01/16:
  ■ Range attack item
  Error handling when assigning state in Ver 1.109

  2017/01/29:
  ■ Range attack item
  Corrected OT_setCustomItemAddState, which was unused in response to the error when assigning the state, just in case.

  2017/02/05:
  ■ Each script
  Fixed the forgotten part of the variable declaration used for the for loop
  * In the same way, if there is another script that you forgot to declare, unintended behavior will occur.

  2017/04/23:
  ■ Additional skills
  skill-Fixed when using BreakAttack.js, the defensive ignorance of the required skill option did not work.

  2017/05/17:
  ■ Skill activation conditions added
  Fixed to display the command skill attached to the unequipped weapon when selecting the command skill.
  Fixed the weapon selection screen after selecting the command skill attached to the weapon so that only the weapon with the corresponding skill is displayed.
  Fixed a bug that the command skill usage count was not counted properly when re-acting.

  ■ MP (EP) & Special Gauge (FP) added
  Fixed the problem that EP and FP were not displayed in the simple window in Ver1.127 or later.
  Corrected the display when the consumption EP and FP are specified as minus.
  Fixed because FP was not consumed when EP fell below used EP at the time of attack

  2017/05/18:
  ■ MP (EP) & Special Gauge (FP) added
  The display of FP consumption and FP recovery was EP ~, so it was corrected.

  2017/05/29:
  ■ Battle Talk
  Fixed a bug that characters who say victory line and death line are reversed when stabbing Todome with HP absorption attack

  2017/06/25:
  ■ MP (EP) & Special Gauge (FP) added
  Implementation of EP / FP recovery items (corrected the one sent for reference in the inquiry on 2016/12/05)

  2017/07/03:
  ■ Damage correction / error setting
  Create New

  2017/12/16:
  ■ Range attack item
  Fixed an issue that caused an error when hovering over a unit when selecting the activation position of a range attack item.

  2018/03/05:
  ■ Battle Talk
  When the damage receiving motion was set, the face image was fixed at 0 and the message was hidden, so it was corrected.

  2018/03/18:
  ■ MP (EP) & Special Gauge (FP) added
  Added a function to recover EP / FP by actions in battle (attack hit, attack mistake, shot, avoidance)
  Fixed a bug that FP movement cost is not working properly

  2018/05/01:
  ■ Range attack item
  Fixed a bug that an error occurs when defeating an enemy with a range attack

  ■ Skill activation conditions
  EC_NowHP, EC_OpponentNowHP, EC_isDirectAttack abolished
  If you want to use it, uncomment the EC_EnableManager.SkillCheckActivity function of ExtraConfigBase.js.

  With stealing, action recovery, and unlocking skills
  EC_TriggerCountMap: [(number of uses),'COMMAND']
  Added a setting so that the upper limit of the number of times of use in 1MAP can be specified by specifying
  Script detail modification

  2018/05/30:
  ■ Skill activation conditions
  When a weapon with a command skill cannot be selected
  Fixed the phenomenon that the command skill set for the weapon can be selected.
  Fixed so that you can not select an opponent whose skill does not activate when selecting a target after selecting a weapon with an attack type command skill (only some conditions)

  2019/05/25:
  ■ Additional skills
  ・ Skill-Assault.js (continue battle)
  When the opponent is invincible, the attack does not hit, HP absorbs each other and fights endlessly
  Unless you set the skill count limit together with the skill activation condition addition script
  Fixed a freeze issue, so the standard script for this skill now limits the number of activations.
  
  Fixed so that it can be set in  Custom Parameter so that it can not be activated in situations where it can attack unilaterally.
  
  If the character is immortal in the event settings, the invoker will be at a disadvantage.
  Added  Custom Parameter to alleviate it.
  
  When the skill activation display is re-combated by the skill after both battles are over
  Fixed to be displayed in the first offense and defense.

  2019/06/16:
  ■ MP (EP) & Special Gauge (FP) added
  (Updated UnitEP.js and UnitFP.js. Added EPFPEventCommand.js)
  In the event command "Execute script"
  Change the maximum value of EP and FP, change the current value, change the amount of EP / FP recovery every turn,
  Added a method to get the maximum and current values ​​of EP and FP.

  2019/07/07:
  ■ Range attack item
  With the state data deleted on the editor side and the ID is in a toothless state
  Specified'BadState'or'GoodState' for IER_DelState or OT_UseDelState in  Custom Parameter
  Fixed an issue that caused an error when hovering over an item.
  For items that do not support OT_UseAddState and IER_AddState and specify'BadState',' GoodState', or'AllState'
  Fixed to end with a warning that you do not want to specify the error message when hovering the cursor

  2019/10/06:
  ■ Range attack item
  When OT_UnitReflection is set to true to reflect the unit ability in power
  Fixed to refer to the correction value of the attack by "support effect".
  Fixed so that the correction value of defense by "support effect" is referred to when the damage type by setting OT_DamageType is physical or magic.
  Fixed it so that it can be set in  Custom Parameter whether it is affected by the attack / defense / hit / evasion of the support effect (each default is true).

  ■ Skill activation conditions
  If "mouse operation" in the environment settings is turned off in the attack type command skill,
  Fixed an issue where cursor movement did not work properly when selecting an attack target after selecting a weapon.
  Fixed an issue where canceling after selecting a weapon with an attack-type command skill caused a double sound.

  2019/11/19:
  ■ Skill activation conditions
  Fixed official skill re-action, support, parameter bonus, and weapon usage not reduced so that it can be activated with command skill.
  Added duration and cool time settings in command skills.
  If the skill activation condition specifies the weapon type as physical or magic,
  Fixed to display only the corresponding weapon in the list on the weapon selection screen
  
  With "transformation and" fusion "skills
  EC_TriggerCountMap: [(number of uses),'COMMAND']
  Added a setting so that the upper limit of the number of times of use in 1MAP can be specified by specifying.
  With some skills
  Fixed to be able to activate from command skill Some activation conditions can be set with modification
  
  Modify EC_SkillCheck.isCheckTriggerCount function in ExtraConfigSkill.js
  Added EC_SkillCheck.isCheckTriggerCountCommand function
  Fixed the number check process when the skill activation number limit on 1 map is command type

  2019/12/09:
  ■ Skill activation conditions
  Corrected because the part corrected on 2019/10/06 reoccurred.
  If you give the initial members the skill of parameter bonus after the update of 2019/11/19, when you select the difficulty level at the start of the game
  Fixed an issue that caused an error when checking the details of characters with parameter bonus skills at the base.
  Fixed the attack type command skill so that weapons whose activation condition distance and weapon range do not match are not displayed in the weapon selection list.
  Deleted because it was described in the readme even though the  Custom Parameter called EC_CheckType was not implemented.

2020/01/01:
  ■ Skill activation conditions
  If you have multiple skills of the same type in some official scripts, only the one with the highest activation rate will be activated and checked.
  Corrected to prioritize the one specified in  Custom Parameter and check the activation in order of priority
  
  ◆ Skills that activate the activation check in order of priority when you have multiple skills of the same type
  First strike, continuous attack, damage absorption, attack always hits, critical at counterattack, damage guard (originally checked by ID order), immortal
  Custom skill with SkillControl.checkAndPushCustomSkill to check activation
  
  Suppose you have two types of continuous attacks (2 attacks, 3 attacks) that are activated by command skills.
  In order to prevent it from happening that even if one skill is selected by the command skill, it will never be activated.
  
  Added  Custom Parameter that adds the parameter specified for the activation rate to the activation rate.

  ■ Additional skills
  The attack power of the skill owner and the defense power of the attack target are specified by custom parameters.
  Added skills that are stat dependent.

  2020/01/07:
  ■ Skill activation conditions
  Fixed an issue where skills could not be activated during forced battles at events.
  When checking whether it can be activated by the number of turns (isEnableTurn function),
  Corrected the process so that if the number of turns cannot be obtained, it will be treated as the first turn.

  2020/02/23:
  ■ Range attack item
  If the user was included in the target at the time of range recovery with OT_Recovery set to true,
  Fixed an issue where the recovery process for the user was performed twice.
  Added because there was no description in the readme about the acquired experience value when there were multiple targets within the effect range.

  2020/03/29
  ■ Skill activation conditions
  Fixed to be able to set cool time even if it is not a command skill.
  
  During the cool time after using a skill for which a cool time is set
  The skill icon on the unit's status screen will be dimmed and
  Fixed so that the number of turns until reuse is displayed at the bottom of the skill icon and in the skill window.
  
  When using a command skill with a set number of continuous turns
  Fixed the skill icon on the unit status screen blinking and displaying the number of continuous turns at the top of the icon.

  2020/04/28:
  ■ Range attack item (major correction)
  Added a custom parameter called IER_HitMark as a necessary setting.
  
  Corrected so that the effect range becomes "whole area" when IER_EffectRangeType is set to 99.
  If the effect range is the entire area, the range type specification will be invalid and it can be activated anywhere.
  Also, a square type has been added to the range effect type.
  
  Added a custom parameter called IER_SoundDuplicate to prevent duplicate hit sounds.
  
  Fixed the problem that extreme processing drop occurs when the cursor is moved diagonally to the user when the effect range type is breath type.
  Fixed the variable name that seemed to be the cause of the problem (IndexArray → indexArray)
  Also, when the effect range type is set to breath type, the range type is now forced to be cross-shaped.
  
  Added box type to the effect range type.
  
  The item description is split, and the display can be switched with the key specified by SYSTEM in [keyboard] of game.ini (default: left shift).
  
  Fixed the window to show damage and hit rate to characters within the effect range.
  The display can be switched with the key specified by SYSTEM in [keyboard] of game.ini (default: left shift).
  
  Significantly fixed AI processing when enemies use ranged attack items. The processing speed is greatly improved.
  (Although there is still room for review, it is released because it is much better than before)
  
  Revised the default value so that it works universally with the minimum custom parameters (power [IER_Value]).
  Create a file that defines the default value, EffectRangeItemDefault.js.
  
  About IER_HitReflection (adding unit skill to hit rate, adding weapon hit value to hit rate)
  Divide the parameter into IER_HitReflectionUnit and IER_HitReflectionWeapon.
  (You can specify either the old model or the new method)

  Move example custom parameters to  Custom Parameter template.txt
  
  2020/05/04:
  ■ Range attack item
  Fixed AI processing when enemies use ranged attack items.
  When using range recovery or indiscriminate system, if the total number of enemies is large, the score check will be heavy, so
  Reduced processing so that the score of the unit that confirms the predicted range and is sure to be out of range is not checked.
  Because when you are indiscriminate, you may not use range attack items if there are enemies and allies in the surroundings.
  Fixed range attack check process.
  Corrected because the log for debugging confirmation was output.
  
  2020/05/05:
  ■ Range attack item
  Fixed an issue that caused an error when an enemy tried to use a range attack of a certain range type.

  2020/05/06:
  ■ Range attack item
  It seems that there was an error in the report due to a script conflict, so
  Corrected the variable name of the reported part.
  Because it affects when BaseCombinationCollector._getTargetListArray is modified
  Modified to do the same processing as BaseCombinationCollector._getTargetListArray which is not modified by the dedicated function.
  CheckTime for debugging is not output to the console by the original, but comment out just in case

  2020/05/18:
  ■ Skill activation conditions
  Due to the addition of processing when canceling after changing weapons at the time of attack in version 1.210 of studio
  Fixed an error when canceling on the weapon selection screen of an attack type command skill.

  2020/08/24:
  ■ MP (EP) & Special Gauge (FP) added
  When using only FP without using EP,
  Fixed an issue that caused an error when deleting UnitEP.js
  (Fixed OT_GetUseFP function in UnitFP.js)

  2020/09/06:
  ■ Range attack item
  By playing the effect animation specified by  Custom Parameter (OT_EffectAnime)
  I was using animationPlay of DynamicEvent
  Even if the effect finishes playing, it will not proceed to the next process unless you press the skip key to skip it.
  Fixed the process to play with Dynamic Anime because there was a possibility that a problem occurred

  2022/10/22:
  ■ Addition of MP (EP) & Special Gauge (FP)
  When a weapon has a recovery bonus when receiving damage and when evading
  Fixed an issue where combat using that weapon would give the opponent a recovery bonus when damaged or evaded. 
  FP can be set to recover after the turn has passed from the 2nd turn
  (Possible by setting FirstTurnRecovery of UnitFP.js to false)
  Fixed to be able to set FP initial value at map start for each unit in FP
  (The initial FP value at the start of the map will be the initial value set for the unit + the initial value set for the class)

  ■ Enemy behavior randomization
  Create New

-----------------------------------------------------------------------------------------
[Last updated date of each material]
■ Skill Expansion
2020/05/18

■ Skill Pack
2020/01/01

■ Sortie Restriction
2017/02/05

■ Battle Talk
2018/03/05

■ Range attack item
2020/09/06

■ MP (EP) & Special Gauge (FP) added
2020/08/24

■ Extra Damage
2017/07/03

■ Enemy AI Randomization
2022/10/23

-----------------------------------------------------------------------------------------
[Introduction method]
* If you installed this script before June 20, 2015, please delete the "OT_skill" folder once.

■ To add skill activation condition settings, put "OT_ExtraConfigSkill" in the "Skill activation condition addition" folder in the Plugin folder.

* Depending on the custom script used, the activation order check (Duplicate Skill.js) of the same type of skill may be used.
Because it may cause conflict, in some cases the description may be moved to another script
Please remove the corresponding plugin (DuplicateSkill.js).

■ If you want to add a skill, put "OT_skill" in the "Additional skill" folder in the Plugin folder.

Recommended for use with additional skill activation conditions.
(Especially for status-dependent attacks, it is assumed that the same type of skill activation order check (Duplicate Skill.js) is included)

* Armor break (skill-BreakAttack.js) and status-dependent attack (skill-StatusAttack.js) can easily conflict with another custom script (general Cal etc.),
when using another custom script together so is recommended to change the folder name of "OT_skill" to "0OT_skill" and so it is read first
Merge the code into another script, or if you do not use it, please remove the corresponding script.

■ If you want to add a sortie prohibition setting, put "OT_NGSortie" in the "sortie prohibition setting" folder in the Plugin folder.

■ When adding a range attack, put "OT_ExtraItem" in the "Range attack item" folder in the Plugin folder.

■ When adding a battle talk, overwrite the contents of the "Battle Talk" folder with the "Plugin" and "Material" of the project.

■ When adding MP & Special Gauge Addition, overwrite the contents of the "MP & Special Gauge Addition" folder to the "Plugin" and "Material" of the project.

■ To add damage compensation / error settings, put "OT_ExtraConfigDamage" in the "damage compensation / error settings" folder in the Plugin folder. 

-----------------------------------------------------------------------------------------
【Overview】
■ Skill Expansion
Use Custom Parameters to add different trigger conditions to skills.
The activation probability can be set to 50+ (force x 0.5), etc.
You will be able to set activation conditions such as HP being 50% or less.
Also, you can activate it by selecting the skill from the command.

■ Skill Pack
By introducing it, you will be able to use the following skills.

・ Always make a critical attack when activated
・ Defense-ignoring attack (Can customize amount of Defense ignored)
・ Random multiple attacks (Aether)
・ Damage Blocking & Absorption 
・ Continue the battle (Accost/Charge)
・ Reduce the number of rounds of the opponent when hitting an attack
・ Modify parameters used to calculated Atk and Def

■ Sortie Restriction
By passing custom parameters in the map settings, you will be able to set the units to be prohibited from sortie.
In addition, you can set the sortie prohibition setting for each unit from the "script execution" of the event.

■ Battle Talk
It is a script that a line appears at the bottom of the screen every time the character acts during the battle.
In addition, you can change the facial expression when dialogue occurs by setting.
(Image like Yggdra Union)

■ AoE Pack
Allows the creation of items that can perform Area of Effect attacks, healing and terrain manipulation.
-You can add the unit stats and/or weapon power to the item effect.
-Effects can be played when using items. You can also specify the effect when hitting, the effect when avoiding, and the effect when using damage.
-You can set Hp Cost or Regen, add and/or eliminate States them when using the items.
・ The hit rate can be set and the ability of the unit can be added in the hit rate, It can be set to always hit or ignore targets avoid.
-You can add or remove states from the hit unit. Multiple grant / disappearance states can be specified, and the grant probability can also be set.
-The shape of the Range and Area of Effect can be altered in a number of ways, straight lines, cross shapes, X shapes, cone shapes among others.
- Can be used to change the terrain where the AoE is used.

■ MP (EP) & Special Gauge (FP) added
By introducing it, EP (MP) and FP (Special Gauge) will be added to the parameters of the unit.
In addition, it is possible to set the remaining amount of EP and FP to be added to the condition for determining the use of weapons and items.
EP is supposed to be used like MP in a normal game,
FP is supposed to be used on the assumption that it will be charged every turn.

■ Extra Damage
By introducing it, level difference correction and error will occur in the damage, in other words, adds deviations between damage preview and damage dealt.

-----------------------------------------------------------------------------------------
【how to use】
See "readme.txt" in the various folders. 
