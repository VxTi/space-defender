<a name="Vec2"></a>

## Vec2
Vec2 class
Represents a 2D vector with x and y coordinates

**Kind**: global class  

* [Vec2](#Vec2)
    * [new Vec2(x, y)](#new_Vec2_new)
    * [.copy](#Vec2+copy) ⇒ [<code>Vec2</code>](#Vec2)
    * [.x](#Vec2+x)
    * [.y](#Vec2+y)
    * [.x](#Vec2+x) ⇒ <code>number</code>
    * [.y](#Vec2+y) ⇒ <code>number</code>
    * [.magnitude](#Vec2+magnitude)
    * [.magSq](#Vec2+magSq) ⇒ <code>number</code>
    * [.normalized](#Vec2+normalized) ⇒ [<code>Vec2</code>](#Vec2)
    * [.translateX(x)](#Vec2+translateX) ⇒ [<code>Vec2</code>](#Vec2)
    * [.translateY(y)](#Vec2+translateY) ⇒ [<code>Vec2</code>](#Vec2)
    * [.translate(x, y)](#Vec2+translate) ⇒ [<code>Vec2</code>](#Vec2)
    * [.add(x, y)](#Vec2+add) ⇒ [<code>Vec2</code>](#Vec2)
    * [.addX(x)](#Vec2+addX) ⇒ [<code>Vec2</code>](#Vec2)
    * [.addY(y)](#Vec2+addY) ⇒ [<code>Vec2</code>](#Vec2)
    * [.mult(x, y)](#Vec2+mult) ⇒ [<code>Vec2</code>](#Vec2)
    * [.multX(x)](#Vec2+multX) ⇒ [<code>Vec2</code>](#Vec2)
    * [.multY(y)](#Vec2+multY) ⇒ [<code>Vec2</code>](#Vec2)
    * [.distSq(other)](#Vec2+distSq) ⇒ <code>number</code>
    * [.dist(other)](#Vec2+dist) ⇒ <code>number</code>

<a name="new_Vec2_new"></a>

### new Vec2(x, y)
Constructor for initializing this vector.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| x | <code>number</code> | <code>0</code> | The x coordinate. Defaults to 0 if not specified |
| y | <code>number</code> | <code>0</code> | The y coordinate. Defaults to 0 if not specified |

<a name="Vec2+copy"></a>

### vec2.copy ⇒ [<code>Vec2</code>](#Vec2)
Getter for retrieving a copy of this vector.

**Kind**: instance property of [<code>Vec2</code>](#Vec2)  
**Returns**: [<code>Vec2</code>](#Vec2) - A copy of this vector  
<a name="Vec2+x"></a>

### vec2.x
Setter for the x coordinate

**Kind**: instance property of [<code>Vec2</code>](#Vec2)  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | The x coordinate |

<a name="Vec2+y"></a>

### vec2.y
Setter for the y coordinate

**Kind**: instance property of [<code>Vec2</code>](#Vec2)  

| Param | Type | Description |
| --- | --- | --- |
| y | <code>number</code> | The y coordinate |

<a name="Vec2+x"></a>

### vec2.x ⇒ <code>number</code>
Getter for the x coordinate

**Kind**: instance property of [<code>Vec2</code>](#Vec2)  
**Returns**: <code>number</code> - The x coordinate  
<a name="Vec2+y"></a>

### vec2.y ⇒ <code>number</code>
Getter for the y coordinate

**Kind**: instance property of [<code>Vec2</code>](#Vec2)  
**Returns**: <code>number</code> - The y coordinate  
<a name="Vec2+magnitude"></a>

### vec2.magnitude
Getter for retrieving the magnitude of this vector. This is the same
as getting the distance from V[0, 0] to this vector.

**Kind**: instance property of [<code>Vec2</code>](#Vec2)  
<a name="Vec2+magSq"></a>

### vec2.magSq ⇒ <code>number</code>
Getter for retrieving the squared magnitude of the vector.
This is the same as getting the squared distance from V[0, 0] to this vector.

**Kind**: instance property of [<code>Vec2</code>](#Vec2)  
**Returns**: <code>number</code> - The squared magnitude of the vector.  
<a name="Vec2+normalized"></a>

### vec2.normalized ⇒ [<code>Vec2</code>](#Vec2)
Getter for converting this vector to a normalized one.
This converts the coordinate space from range [-infinity to +infinity] to range [-1 to +1]

**Kind**: instance property of [<code>Vec2</code>](#Vec2)  
**Returns**: [<code>Vec2</code>](#Vec2) - The normalized vector  
<a name="Vec2+translateX"></a>

### vec2.translateX(x) ⇒ [<code>Vec2</code>](#Vec2)
Method for translating the x coordinate by another scalar.

**Kind**: instance method of [<code>Vec2</code>](#Vec2)  
**Returns**: [<code>Vec2</code>](#Vec2) - The current vector instance, after translating  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | The value to translate the x coordinate by. |

<a name="Vec2+translateY"></a>

### vec2.translateY(y) ⇒ [<code>Vec2</code>](#Vec2)
Method for translating the y coordinate by another scalar.

**Kind**: instance method of [<code>Vec2</code>](#Vec2)  
**Returns**: [<code>Vec2</code>](#Vec2) - The current vector instance, after translating  

| Param | Type | Description |
| --- | --- | --- |
| y | <code>number</code> | The value to translate the y coordinate by. |

<a name="Vec2+translate"></a>

### vec2.translate(x, y) ⇒ [<code>Vec2</code>](#Vec2)
Method for translating this vector to another position.

**Kind**: instance method of [<code>Vec2</code>](#Vec2)  
**Returns**: [<code>Vec2</code>](#Vec2) - The current vector instance, after translating  

| Param | Type | Description |
| --- | --- | --- |
| x | [<code>Vec2</code>](#Vec2) \| <code>number</code> | If x is a Vec2, this vector is translated to the position of x.                          If x is a number, this vector is translated to [x, y] |
| y | <code>number</code> \| <code>undefined</code> | If x is a Vec2, this parameter is ignored. Otherwise, it is used as the y coordinate |

<a name="Vec2+add"></a>

### vec2.add(x, y) ⇒ [<code>Vec2</code>](#Vec2)
Method for adding a vector or a scalar to the vector

**Kind**: instance method of [<code>Vec2</code>](#Vec2)  
**Returns**: [<code>Vec2</code>](#Vec2) - The current vector instance, after adding  

| Param | Type | Description |
| --- | --- | --- |
| x | [<code>Vec2</code>](#Vec2) \| <code>number</code> | The vector or scalar to add to the vector |
| y | <code>number</code> | If x is a scalar, this parameter is used as the y value |

<a name="Vec2+addX"></a>

### vec2.addX(x) ⇒ [<code>Vec2</code>](#Vec2)
Method for adding to the x coordinate

**Kind**: instance method of [<code>Vec2</code>](#Vec2)  
**Returns**: [<code>Vec2</code>](#Vec2) - The current vector instance, after adding  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | The value to add to the x coordinate |

<a name="Vec2+addY"></a>

### vec2.addY(y) ⇒ [<code>Vec2</code>](#Vec2)
Method for adding to the y coordinate

**Kind**: instance method of [<code>Vec2</code>](#Vec2)  
**Returns**: [<code>Vec2</code>](#Vec2) - The current vector instance, after adding  

| Param | Type | Description |
| --- | --- | --- |
| y | <code>number</code> | The value to add to the y coordinate |

<a name="Vec2+mult"></a>

### vec2.mult(x, y) ⇒ [<code>Vec2</code>](#Vec2)
Method for multiplying the vector by another vector or by a scalar

**Kind**: instance method of [<code>Vec2</code>](#Vec2)  
**Returns**: [<code>Vec2</code>](#Vec2) - The current vector instance, after multiplying  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>number</code> \| [<code>Vec2</code>](#Vec2) | The value to multiply the x coordinate by or a Vec2 to multiply with |
| y | <code>number</code> \| <code>undefined</code> | If x is a Vec2, this parameter is ignored |

<a name="Vec2+multX"></a>

### vec2.multX(x) ⇒ [<code>Vec2</code>](#Vec2)
Method to multiply the vector's x coordinate

**Kind**: instance method of [<code>Vec2</code>](#Vec2)  
**Returns**: [<code>Vec2</code>](#Vec2) - The current vector instance  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | The value to multiply the x coordinate by |

<a name="Vec2+multY"></a>

### vec2.multY(y) ⇒ [<code>Vec2</code>](#Vec2)
Method to multiply the vector's y coordinate

**Kind**: instance method of [<code>Vec2</code>](#Vec2)  
**Returns**: [<code>Vec2</code>](#Vec2) - The current vector instance  

| Param | Type | Description |
| --- | --- | --- |
| y | <code>number</code> | The value to multiply the y coordinate by |

<a name="Vec2+distSq"></a>

### vec2.distSq(other) ⇒ <code>number</code>
Measures the squared distance between two vectors.
This is faster than performing square root operations.

**Kind**: instance method of [<code>Vec2</code>](#Vec2)  
**Returns**: <code>number</code> - The squared distance between the two vectors.  

| Param | Type | Description |
| --- | --- | --- |
| other | [<code>Vec2</code>](#Vec2) | The other vector to measure the distance to |

<a name="Vec2+dist"></a>

### vec2.dist(other) ⇒ <code>number</code>
Measures distance to the other vector

**Kind**: instance method of [<code>Vec2</code>](#Vec2)  
**Returns**: <code>number</code> - The distance between the two vectors.  

| Param | Type | Description |
| --- | --- | --- |
| other | [<code>Vec2</code>](#Vec2) | The vector to measure the distance to |

