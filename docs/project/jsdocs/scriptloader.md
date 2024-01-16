<a name="loadScript"></a>

## loadScript(script, target, defer)
Method for loading script and adding it to the target head element.
Returns a promise after script has successfully loaded to prevent others
from loading first and causing conflicts.

**Kind**: global function  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| script | <code>string</code> |  | The script to load |
| target | <code>HTMLElement</code> |  | The target element to add the script to |
| defer | <code>boolean</code> | <code>false</code> | Whether to defer the script or not (loading after page load, default = false) |

