## Functions

<dl>
<dt><a href="#createKeyboard">createKeyboard()</a></dt>
<dd><p>Method for loading all the components of the custom keyboard.
The purpose of this is that the user can select a name even when
they&#39;re using a controller.</p>
</dd>
<dt><a href="#moveKeyboardCursor">moveKeyboardCursor(dx, dy)</a></dt>
<dd><p>Method for moving the keyboard cursor.
This method accepts relative parameters, it moves the cursor relative
to the currently selected key.</p>
</dd>
<dt><a href="#keyTyped">keyTyped()</a></dt>
<dd><p>Method for handling user input.
This is used for navigating through the menu</p>
</dd>
<dt><a href="#broadcast">broadcast(message, duration)</a></dt>
<dd><p>Method for adding a broadcast message.
This allows the user to queue various messages over time. It adds messages to the
&#39;messageQueue&#39; array. Once the previous message has finished displaying, the next one will display.</p>
</dd>
<dt><a href="#showMenu">showMenu(element)</a></dt>
<dd><p>Method for changing the current menu.
This method is called when the user clicks on a menu button.</p>
</dd>
<dt><a href="#loadStatistics">loadStatistics()</a></dt>
<dd><p>Method for loading statistics.
This method is called when the &#39;statistics&#39; menu is opened in-game.
Calling this method will use the previously loaded statistics object in &#39;game-replica.js&#39;
and convert it to a readable page on the &#39;statistics&#39; page.</p>
</dd>
<dt><a href="#retrieveLeaderboards">retrieveLeaderboards()</a></dt>
<dd><p>Method that retrieves the leaderboard information by sending a post request to the
server. The server then returns a body containing all the leaderboard information,
based on the predefined parameters [ maxScores, leaderboardFilter ]
This then changes the content of the leaderboard html to the result of this request.</p>
</dd>
<dt><a href="#parseLeaderboardData">parseLeaderboardData(data)</a> ⇒ <code>string</code></dt>
<dd><p>Method for parsing the leaderboard data and sorting it accordingly.
Method accepts data, as an object containing leaderboard data,
and filter as a string, denoting what to filter</p>
</dd>
<dt><a href="#formatLeaderboardEntry">formatLeaderboardEntry(data)</a> ⇒ <code>string</code></dt>
<dd><p>Method for formatting the leaderboard entry data.</p>
</dd>
</dl>

<a name="createKeyboard"></a>

## createKeyboard()
Method for loading all the components of the custom keyboard.
The purpose of this is that the user can select a name even when
they're using a controller.

**Kind**: global function  
<a name="moveKeyboardCursor"></a>

## moveKeyboardCursor(dx, dy)
Method for moving the keyboard cursor.
This method accepts relative parameters, it moves the cursor relative
to the currently selected key.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| dx | <code>number</code> | By how much to move the cursor in the x direction. x > 0 means right, x < 0 means left |
| dy | <code>number</code> | By how much to move the cursor in the y direction. y > 0 means up, y < 0 means down |

<a name="keyTyped"></a>

## keyTyped()
Method for handling user input.
This is used for navigating through the menu

**Kind**: global function  
<a name="broadcast"></a>

## broadcast(message, duration)
Method for adding a broadcast message.
This allows the user to queue various messages over time. It adds messages to the
'messageQueue' array. Once the previous message has finished displaying, the next one will display.

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| message | <code>string</code> |  | The message to display |
| duration | <code>number</code> | <code>1000</code> | The time in seconds to display the message, optional |

<a name="showMenu"></a>

## showMenu(element)
Method for changing the current menu.
This method is called when the user clicks on a menu button.

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| element | <code>string</code> | <code>null</code> | The element to display. This is the classname of the page to show. |

<a name="loadStatistics"></a>

## loadStatistics()
Method for loading statistics.
This method is called when the 'statistics' menu is opened in-game.
Calling this method will use the previously loaded statistics object in 'game-replica.js'
and convert it to a readable page on the 'statistics' page.

**Kind**: global function  
<a name="retrieveLeaderboards"></a>

## retrieveLeaderboards()
Method that retrieves the leaderboard information by sending a post request to the
server. The server then returns a body containing all the leaderboard information,
based on the predefined parameters [ maxScores, leaderboardFilter ]
This then changes the content of the leaderboard html to the result of this request.

**Kind**: global function  
<a name="parseLeaderboardData"></a>

## parseLeaderboardData(data) ⇒ <code>string</code>
Method for parsing the leaderboard data and sorting it accordingly.
Method accepts data, as an object containing leaderboard data,
and filter as a string, denoting what to filter

**Kind**: global function  
**Returns**: <code>string</code> - String containing the HTML data for the leaderboards  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Array</code> | Object containing all leaderboard data |

<a name="formatLeaderboardEntry"></a>

## formatLeaderboardEntry(data) ⇒ <code>string</code>
Method for formatting the leaderboard entry data.

**Kind**: global function  
**Returns**: <code>string</code> - Leaderboard entry from data object  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | Object containing the player data. |

