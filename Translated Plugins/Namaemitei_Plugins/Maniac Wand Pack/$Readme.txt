
Maniac Wand Plugin Pack
by Namaemitei
----------------------------------------------------------------------------------------------------------------------------------
00_Increase Wand Types.js
With this plugin is possible to add more item types the function as Staves, and make different classes use different Staff Types.

Custom Parameters:
{isWand:X} Added to Item types, where X is a number greater than 0.
{extraWandId:[X,Y]} Added to Classes, where [X,Y] is the list of values for usable wands based on the isWand value.
-------------------------------------------------------------------------------------------------------------------------------
01_Item Master-Skill.js
With this plugin you can create a skill that allows the use of items to not end the unit turns.

Keyword: item_master

Custom Parameters:
{useMax:XX} Added to the skill, where XX is a number greater than 1. Allows to use items more than once per turn.
-----------------------------------------------------------------------------------------------------------------

01_Wand Master-Skill.s
With this plugin you can create a skill that allows the use of the Staff command to not end the unit turns.

Keyword: wand_master

Custom Parameters:
{useMax:XX} Added to the skill, where XX is a number greater than 1. Allows to use staves more than once per turn.