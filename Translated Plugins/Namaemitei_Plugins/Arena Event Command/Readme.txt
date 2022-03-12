This project is compatible with 1.217.
It may not work properly with earlier versions.

  * The "Arena-like.js" and "Location event do not wait to enter the arena without a weapon.js" in the Plugin folder of the demo project
    are the same as "Arena-like.js" and "Location event do not wait to enter the arena without a weapon.js" in the same folder as this text.

  * Set the maximum value to 999999 for all variables used in the arena.
    Since the enemy ID takes a value of 65535, 131171, or 9999 or more (internally), if the maximum value of the variable is 9999, the value will not be set correctly.

This project contains the following three types of configuration examples.
In addition, "Arena-like.js" and "Location event do not wait to enter the arena without a weapon.js" are added in the Plugin folder.
This will prevent you from waiting "when you choose to quit in the arena" and "when the unit you are trying to join the arena has no weapons".
It is possible to cancel and choose a different action.

1. A basic example setting up the variables, event command and the display of the results


2. The second is an example of an Arena with a randomly generated enemy.
The bet is fixed at 500G and the prize is fixed at 1000G.


3. The third one is an event where you fight 5 predetermined enemies in a round, and get 200 gold per round.

*You can heal at the small temple and get gold from the chest.


Changelog
16/08/28 Updated .js that looks like a arena Added a process to cancel all enemy states before recovering enemy HP at the end of the arena
16/09/04 Supports attackwindow_plus.js and attackwindow special attack display.js special attack display
* It is not possible to display in a special attack with .js alone, which looks like a arena. Combine with any of the above plugins.
17/03/05 Fixed a bug that an error occurs when the variable setting error of the arena participation unit ID and the variable setting error of the arena enemy unit ID are made.
17/06/05 1.130 compatible
17/06/11 1.131 compatible
17/06/18 [Place event_Do not wait even if you enter the arena without a weapon.js] Fixed a bug that an error is dropped in a place event that is completed immediately.
17/10/08 1.157 correspondence
17/11/03 Changed to acquire the battle background based on the position of the attacking side
18/02/25 1.176 compatible
19/06/13 Compatible with plug-ins that display advantageous and disadvantageous states
20/03/11 1.209 compatible
20/09/11 Addressed a bug that an error may occur when entering a battle in the arena due to insufficient setting parameters when used in combination with other plug-ins.