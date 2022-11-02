-------------------------------------------------- ---------------------------------------
【Change log】
  2022/10/23: New
  
-------------------------------------------------- ---------------------------------------
[Introduction method]
Put the "OT_EnemyAI" folder inside the Plugin folder.

-------------------------------------------------- ---------------------------------------
【Overview】
Regarding the enemy's behavior, it is usually selected from the highest score obtained by simulation,
Pick up multiple actions with high scores in the simulation and select randomly from among them.

SRPG Studio's enemy algorithm aims only at opponents with high damage (or can be defeated) when there are two or more attack targets,
As long as the attacked target does not move to a place where it cannot be targeted, it will never attack there even if there are many other targets that can be attacked.
Also, the abnormal condition grant weapon must be very powerful like a sealed system.
Basically, you will prioritize the use of weapons that deal more damage when attacking.
For example, if the enemy has both a weapon with a power of 4 and a weapon with a power of 1 that inflicts poison,
Don't use poisoned weapons unless the poison effect is too strong.

By introducing this plugin, if there are two or more attack targets, you will not always aim at the opponent with a large amount of damage,
It is possible to occasionally attack with a weapon that grants status ailments while using a weapon with high power.

If you want to have two or more types of attack methods for one unit (low power but troublesome anomaly grant, no anomaly grant but high power),
It is effective when you want to create a sense of tension by making the enemy move unexpectedly in the latter half of the game.

*Please be careful about conflicts with plugins that change AI.

-------------------------------------------------- ---------------------------------------
【how to use】
If you want to adjust the overall AI, iRandomActionType and iRandomMoveType of OT_RandomAI.js,
Adjust the iActionPickUp and iMovePickUp values.
Set custom parameters if you want to randomize the behavior of a specific unit or class.

-------------------------------------------------- ---------------------------------------
[How to set the Custom Parameter]

·unit
{
    OT_RandomAI : { ActionType:1, MoveType:1, ActionPickUp:10, MovePickUp:999 }
}
ActionType : Action selection pattern (specify an integer: 0 to 3)
MoveType : Destination pattern at the time of action (specify an integer: 0 to 6)
ActionPickUp : Number of actions to pick up when acting randomly (specify an integer: 0-)
MovePickUp : Number of destinations to pick up by randomization at the time of action (specify an integer: 0 ~)

·class
{
    OT_RandomAI : { ActionType:1, MoveType:1, ActionPickUp:10, MovePickUp:999 }
}
ActionType : Action selection pattern (0-3)
MoveType : Destination pattern for action (0-6)
ActionPickUp : Number of actions to pick up when doing random action (0-)
MovePickUp : Number of destinations to be picked up by randomization at the time of action (0-)

■ Behavior patterns based on ActionType settings
When set to 1 or more, the action with the highest score for whether the action is optimal will be picked up by the number of ActionPickUps.
It will act randomly from among them

0: No behavior randomization (same behavior as plug-in not installed)
1: The higher the score, the higher the probability of being selected.
2: Actions with lower scores are more likely to be selected
3: No change in probability due to high or low score

■ Behavior patterns based on MoveType settings
When set to 1 or more, actions with the highest score for the best destination are picked up by the number of MovePickUps.
It will act randomly from among them

0: No destination random (same behavior as plug-in not installed)
1: Randomly select a destination only when there are multiple optimal locations
2: Mostly move to the optimal location, but also move randomly to non-optimal locations (may move to locations where terrain effects cannot be obtained when attacking, or attack in positions where counterattacks are received)
3: Randomly determine the destination without considering terrain effects or counterattacks
4: High probability of moving to non-optimal locations (perfect for idiot AI, bandits, etc.)
5: Move to the least optimal place with top priority (Licking AI)
6: Move to the least optimal location with highest priority. Randomly choose a destination if there are multiple least optimal locations

If Custom Parameter is set for both the unit and class, the unit setting will take precedence.
The value of OT_RandomAI.js is used for Custom Parameter items that are not set.
For example, set ActionType and MoveType in the class,
If you set ActionType and ActionPickUp in the unit, ActionType takes precedence over the unit settings,
MovePickUp is not set for both unit and class, so the OT_RandomAI.js setting is used.

-------------------------------------------------- ---------------------------------------
[Change the AI settings of the unit during the game]

From "Run Code" in "Run Script"
You can change the custom parameters in the AI settings of your units during the game.

◆ Set AI

After selecting the unit whose AI you want to change in "Unit" on the "Original Data" tab,
Check "Execute code" in "Execute script" of the event command and in the text area

OT_RandomAI_SetUnitAI(
  { ActionType:1, MoveType:1, ActionPickUp:10, MovePickUp:999 }
);

Write like this:

Specify the item you want to set in the description inside {}.
For example, if you want to change only the ActionType and MoveType of the unit

OT_RandomAI_SetUnitAI(
  { ActionType:1, MoveType:2 }
);

Write like this:

◆Clear AI settings

If you want to delete the AI setting of the unit, set [item name]:-1.
For example, if you want to delete the unit's ActionType and ActionPickUp settings

OT_RandomAI_SetUnitAI(
  { ActionType:-1, ActionPickUp:-1 }
);

Write like this:
If the AI after deleting the setting has a setting value in the class, it will act according to the setting value of the class,
If there is no set value in the class, it will act according to the value set in OT_RandomAI.js.
