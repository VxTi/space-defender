## Functions

<dl>
<dt><a href="#moveKeyboardCursor">moveKeyboardCursor(x, y)</a></dt>
<dd><p>Method for moving the keyboard cursor.</p>
</dd>
<dt><a href="#showMenu">showMenu(element)</a></dt>
<dd><p>Method for changing the current menu.</p>
</dd>
<dt><a href="#loadStatistics">loadStatistics()</a></dt>
<dd><p>Method for loading statistics.
This method is called when the &#39;statistics&#39; menu is opened in-game.</p>
</dd>
<dt><a href="#retrieveLeaderboards">retrieveLeaderboards()</a></dt>
<dd><p>Method that retrieves the leaderboard information by sending a post request to the
server. The server then returns a body containing all the leaderboard information,
based on the predefined parameters [ maxScores, leaderboardFilter ]
This then changes the content of the leaderboard html to the result of this request.</p>
</dd>
<dt><a href="#parseLeaderboardData">parseLeaderboardData(data, filter)</a> ⇒ <code>string</code></dt>
<dd><p>Method for parsing the leaderboard data and sorting it accordingly.
Method accepts data, as an object containing leaderboard data,
and filter as a string, denoting what to filter</p>
</dd>
<dt><a href="#formatLeaderboardEntry">formatLeaderboardEntry(data)</a> ⇒ <code>string</code></dt>
<dd><p>Method for formatting the leaderboard entry data.</p>
</dd>
</dl>

<a name="moveKeyboardCursor"></a>

## moveKeyboardCursor(x, y)
Method for moving the keyboard cursor.

**Kind**: global function  

| Param |
| --- |
| x | 
| y | 

<a name="showMenu"></a>

## showMenu(element)
Method for changing the current menu.

**Kind**: global function  

| Param | Default |
| --- | --- |
| element | <code></code> | 

<a name="loadStatistics"></a>

## loadStatistics()
Method for loading statistics.
This method is called when the 'statistics' menu is opened in-game.

**Kind**: global function  
<a name="retrieveLeaderboards"></a>

## retrieveLeaderboards()
Method that retrieves the leaderboard information by sending a post request to the
server. The server then returns a body containing all the leaderboard information,
based on the predefined parameters [ maxScores, leaderboardFilter ]
This then changes the content of the leaderboard html to the result of this request.

**Kind**: global function  
<a name="parseLeaderboardData"></a>

## parseLeaderboardData(data, filter) ⇒ <code>string</code>
Method for parsing the leaderboard data and sorting it accordingly.
Method accepts data, as an object containing leaderboard data,
and filter as a string, denoting what to filter

**Kind**: global function  
**Returns**: <code>string</code> - String containing the HTML data for the leaderboards  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Array</code> | Object containing all leaderboard data |
| filter | <code>string</code> | What key to filter the data with |

<a name="formatLeaderboardEntry"></a>

## formatLeaderboardEntry(data) ⇒ <code>string</code>
Method for formatting the leaderboard entry data.

**Kind**: global function  
**Returns**: <code>string</code> - Leaderboard entry from data object  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>object</code> | Object containing the player data. |

