<a name="Resource"></a>

## Resource
**Kind**: global class  

* [Resource](#Resource)
    * [new Resource(image, [horizontalCount], [verticalCount])](#new_Resource_new)
    * [.draw(x, y, width, height, dx, dy, dw, dh)](#Resource+draw)
    * [.drawSection(x, y, width, height, horizontalIndex, verticalIndex)](#Resource+drawSection)
    * [.animate(x, y, width, height, animationIndex)](#Resource+animate)

<a name="new_Resource_new"></a>

### new Resource(image, [horizontalCount], [verticalCount])
Constructor for creating a custom resource.
This constructor asks for a p5.Image as input, which has to be retrieved in the 'preload' function
with 'loadImage(...)'. This can then be converted to a resource after loading was successful.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| image | <code>p5.Image</code> |  | The image object |
| [horizontalCount] | <code>number</code> | <code>1</code> | The amount of sub-images the p5.Image object contains. These are abstract sub images, meaning this object can draw them more easily by dividing the image into multiple subsections. |
| [verticalCount] | <code>number</code> | <code>1</code> | See horizontalCount. This defines how many sub-images this p5.Image has, vertically. |

<a name="Resource+draw"></a>

### resource.draw(x, y, width, height, dx, dy, dw, dh)
Method for drawing the p5 Image onto the screen with some additional parameters.
Allows the user to draw only a section of the provided image, or the full image
if no additional parameters are provided.

**Kind**: instance method of [<code>Resource</code>](#Resource)  

| Param | Default | Description |
| --- | --- | --- |
| x |  | screen x-coordinate to draw the image at |
| y |  | screen y-coordinate to draw the image at |
| width |  | horizontal size of the image |
| height |  | vertical size of the image |
| dx | <code>0</code> | x offset of the image to draw in image-pixels. Default = 0 |
| dy | <code>0</code> | y offset of the image to draw in image-pixels. Default = 0 |
| dw |  | width of the sub-image to draw, in image-pixels. |
| dh |  | height of the sub-image to draw, in image-pixels |

<a name="Resource+drawSection"></a>

### resource.drawSection(x, y, width, height, horizontalIndex, verticalIndex)
Method for drawing a subsection of the image.
This method only works if this resouce has a Horizontal or Vertical sub image count > 1

**Kind**: instance method of [<code>Resource</code>](#Resource)  

| Param | Default | Description |
| --- | --- | --- |
| x |  | Screen x-coordinate to draw at |
| y |  | Screen y-coordinate to draw at |
| width |  | Width of the image to draw |
| height |  | Height of the image to draw |
| horizontalIndex | <code>0</code> | Horizontal index of the sub-image to draw |
| verticalIndex | <code>0</code> | Vertical index of the sub-image to draw |

<a name="Resource+animate"></a>

### resource.animate(x, y, width, height, animationIndex)
Method for allowing users to render an animation onto the screen.
This is done by dividing the image in subsections, and displaying these after one another.
This can be done by calling the constructor with 'horizontalCount' and 'verticalCount' > 1
If one then wants to render the animation, you simply have to call 'animate(x, y, w, h, index)' where
index = the index of the sub-image in the main image. Order of this is left to right, then top to bottom

**Kind**: instance method of [<code>Resource</code>](#Resource)  

| Param | Default | Description |
| --- | --- | --- |
| x |  | screen x-coordinate to draw the image at |
| y |  | screen y-coordinate to draw the image at |
| width |  | width of the image |
| height |  | height of the image |
| animationIndex | <code>0</code> | The index of which sub-image to draw. |

