-----------------------------------------------------------------------------------------
【Change log】
  2015/09/26: Create battle talk script
  2015/10/05:
  Fixed to generate Attack dialogue when Move is not set
  Implemented so that battle talk appears even in simple battles
  Partial correction of readme description
  2015/10/14:
  Fixed BattleTalk.js with official update
  
  2016/02/13:
  Corresponds to 1.058, fixed an error when activating the skill

  2017/02/05:
  Fixed the place where the declaration of the variable used for the for loop was forgotten
  *If there is another script that forgets to declare in the same way, unintended behavior will occur.
  
  2017/05/29:
  Fixed a bug where characters who say victory lines and death lines are reversed when finishing off with an HP absorption attack.

  2018/03/05:
  Fixed the face image number 0 and hidden the message when setting the damage receiving motion.

-----------------------------------------------------------------------------------------
[How to install] Please overwrite the "plugin" and "material" in the folder to the "plugin" and "material" of the project.

-----------------------------------------------------------------------------------------
[Summary] By introducing it, lines will appear at the bottom of the screen every time the character acts during battle.
 Also, depending on the settings, you can change the facial expression when the dialogue occurs.
 (It feels like the Yggdra Union in terms of image)

-----------------------------------------------------------------------------------------
[How to use] 
■ Setting dialogue (talk data) to be spoken during battle Edit class.ini, unit.ini, custom.ini in "Material\OT_BattleTalk",

[(ID)]
(keyword) = "(serif)"
*(keyword) = "(expression number)"

Please describe.
(ID): Class ID for Class.ini, Unit ID for Unit.ini, and any string for Custom.ini.
(Keyword): Write the following and write the lines to be displayed in (Words).

ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
Keywords that can be set

Wait : When attacked by the opponent
Caution : State that HP is 1/2 when attacked by the opponent.
Danger : The state where HP is 1/4 when attacked by the opponent, if not set, it will be a Caution line

Move: When the unit is moving, it will be the Attack line when not set
Attack : Proximity, shooting type attack
Magic: At the time of magic attack, if not set, it will be the line of Attack
Counter : Only once when counterattacking after being attacked by the opponent, if not set, it will be the line of Attack
Critical: When critical is activated, it will be the line of Attack when not set

ActiveSkill: When skill is activated when attacking
PassiveSkill: When skill is activated while defending

Damage : When damaged
BleedDamage : HP is 1/2 after receiving damage, if not set, it will be a damage line
DyingDamage : HP is 1/4 after taking damage, defaults to BleedDamage

NoDamage : When the damage is 0
Avoid : When avoiding an attack
Dead : when dead

Victory: When the opponent is defeated
BotherVictory : HP is 1/2 when the opponent is defeated, if not set it will be Victory's line
NarrowVictory: HP is 1/4 when the opponent is defeated, if not set, it will be the line of BotherVictory

LevelUpLow : When the ability increased by one or less when leveling up, it will be a LevelUp line when not set
LevelUp: When there are 2 to 3 abilities that increased when leveling up
LevelUpHigh : When there are 4 to 5 abilities that have increased when leveling up, it will be a LevelUp line when not set
LevelUpTopForm : When there are 6 or more abilities raised when leveling up, if not set, it will be a line of LevelUpHigh
LevelUpMax : When there are 6 or more abilities raised to the maximum when the ability increased by 1 or less when leveling up, if not set, it will be the line of LevelUp

*You can comment out the description with ;
*In simple battles, lines related to Move and level up will not be displayed.

In Class.ini, set the class ID from 0 to 27,
Unit.ini has a unit ID of 0,
Custom.ini contains some settings by default.

ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
How to use the settings described in Custom.ini

Describe as follows in Custom.ini.

~Omitted~
[test]
Wait = "You're here..."
Caution = "It's a little tight..."
Danger = "Bad..."

~Omitted~

If you want to speak the described settings
Please specify { OT_BattleTalkID: (ID created in Custom.ini) } in the unit's custom parameters,

Example: { OT_BattleTalkID:'test' }


Also, it is possible to change it at an event during the game, in which case
Check "Execute code" in "Execute script" of the event command, and in the text area
SetBattleTalk( Unit ID, ID created in Custom.ini );
Write like this.

Example: Unit ID: Set Custom.ini test dialogue to 0
SetBattleTalk( 0, 'test' );

To cancel the setting,
SetBattleTalk( Unit ID, null );
and describe.


Do not set the character to speak Custom.ini lines,
If no data is set in Unit.ini, it speaks the lines set in Class.ini.


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
Settings for changing facial expressions along with the lines spoken during battle

If you want to change the expression with the occurrence of the dialogue, please add the following description.
(See [test] in Custom.ini)

*(keyword) = "(expression number)"

Enter a numerical value in (Facial expression number).
(The upper left face of the image used in the face chart is 0, the next one is 1, the next one is 2, etc.)

ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
Change the dialogue window 
Please replace window.png in "material\ot battle talk". 
(The size is 90 x 60 and matches the size of the title image in the editor's "Resources" → "Check ui data")

ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー
If you want to shift the position of the window or change the width

If you want to shift the position of the normal battle window, change the values ​​for frame x, frame y, and talk width in "plugin\ot battle talk\battle talk.js".

If you want to shift the position of the simple battle window, please change the numerical value of talk adjust x, talk adjust y, face adjust x, face adjust y in "plugin\ot battle talk\map battle talk.js".

