<a name="HealthElement"></a>

## HealthElement
Class representing a health element.
This element can be picked up by the player to increase their health.

**Kind**: global class  

* [HealthElement](#HealthElement)
    * [new HealthElement()](#new_HealthElement_new)
    * [.update(dT)](#HealthElement+update)

<a name="new_HealthElement_new"></a>

### new HealthElement()
Constructor for Health Element

<a name="HealthElement+update"></a>

### healthElement.update(dT)
Method for updating the health element's properties and drawing it on the screen.
This checks whether the player is close enough, if this is the case, it will be picked up.
Picking it up increases the player's health by the amount specified in the constructor.

**Kind**: instance method of [<code>HealthElement</code>](#HealthElement)  

| Param | Type | Description |
| --- | --- | --- |
| dT | <code>number</code> | The time passed since the last update, in seconds. |

