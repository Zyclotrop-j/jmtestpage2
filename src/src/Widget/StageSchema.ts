{
	"title": "componentstage",
  "description": "A stage, a kind of slide-show, a good entry to any site or topic. Allows to place images and text (headline, text, button / advanced richtext via markdown) and transition between them + animate them.",
	"type": "object",
	"properties": {
		"slides": {
			"type": "array",
			"items": {
				"type": "object",
				"properties": {
					"height": {
						"description": "Height of the stage in percent of the viewport. Defaults to 80%. (slide-show doesn't update when invisible, so no jumping of page, unless in view)",
						"type": "number"
					},
					"left": {
						"description": "Box (aka label / content) distance to the left. Leave empty for auto-sizing. Any valid css distance",
						"type": "string"
					},
					"bottom": {
						"description": "Box distance (aka label / content) to the bottom. Leave empty for auto-sizing. Any valid css distance",
						"type": "string"
					},
					"right": {
						"description": "Box distance (aka label / content) to the right. Leave empty for auto-sizing. Any valid css distance",
						"type": "string"
					},
					"top": {
						"description": "Box distance (aka label / content) to the top. Leave empty for auto-sizing. Any valid css distance",
						"type": "string"
					},
					"boxbackground": {
						"description": "Background-color of the box (aka label / content). Use a css-color, e.g. rgba(0,0,0,0.8). Use 'transparent' to omit",
						"type": "string"
					},
					"borderColor": {
						"type": "string",
						"description": "The color of the border around the box"
					},
					"borderSize": {
						"type": "string",
						"description": "The size of the border around the box. Defaults to medium"
					},
					"borderStyle": {
						"type": "string",
						"description": "The border style around the box. Use 'none' for no border. Use css borde styles"
					},
					"borderSide": {
						"type": "string",
						"description": "Where to put a border. Choose one of: all, top, left, bottom, right, horizontal, vertical"
					},
					"pad": {
						"type": "string",
						"pattern": "The content-padding of the box. Defaults to small"
					},
					"timing": {
						"pattern": "Time to spend on this slide in ms. E.g. use 3000 to leave the slide up for 3 seconds.",
						"type": "integer"
					},
					"a11yTitle": {
						"description": "Put the message your image conveys in words. For when the picture is not visible to the user, e.g. screenreader, bots",
						"type": "string"
					},
					"image": {
						"description": "The image of the slide. Will be applied as background-image.",
						"type": "object",
						"properties": {
							"color": {
								"description": "Predominant color of the image.",
								"type": "string",
								"ui:widget": "grommet-color"
							},
							"src": {
								"description": "The url of the image",
								"type": "string"
							},
							"entry": {
								"description": "Entry-animation of the slide. fade-in, slide-in-left, slide-in-right",
								"type": "string"
							},
							"exit": {
								"description": "Exit-animation of the slide. fade-out, slide-out-left, slide-out-right",
								"type": "string"
							},
							"tags": {
								"description": "Tags of the background image",
								"type": "array",
								"items": {
									"type": "string"
								}
							},
							"location": {
								"description": "Where the background image was taken",
								"type": "object",
								"properties": {
									"city": {
										"type": "string"
									},
									"country": {
										"type": "string"
									}
								}
							},
							"author": {
								"description": "Author of the image. Displays an attribution to the author if present",
								"type": "object",
								"properties": {
									"name": {
										"description": "Full name of the author. Will be displayed in attribution",
										"type": "string"
									},
									"portfolio_url": {
										"type": "string"
									},
									"profileurl": {
										"type": "string"
									},
									"username": {
										"type": "string"
									},
									"plattform": {
										"type": "string"
									},
									"plattformname": {
										"type": "string"
									}
								}
							},
							"alt": {
								"description": "Alternative for image aka state what the image displays",
								"type": "string"
							},
							"width": {
								"description": "Original width of the image",
								"type": "integer"
							},
							"height": {
								"description": "Original height of the image",
								"type": "integer"
							}
						}
					},
					"headline": {
						"description": "Headline on the image in the box",
						"type": "object",
						"properties": {
							"content": {
								"description": "The text of the headline",
								"type": "string"
							},
							"animation": {
								"description": "If present an animation will play when the ",
								"enum": ["none","bouceOut","bounce","bounceIn","bounceInDown","bounceInLeft","bounceInRight","bounceInUp","bounceOutDown","bounceOutLeft","bounceOutRight","bounceOutUp","fadeIn","fadeInDown","fadeInDownBig","fadeInLeft","fadeInLeftBig","fadeInRight","fadeInRightBig","fadeInUp","fadeInUpBig","fadeOut","fadeOutDown","fadeOutDownBig","fadeOutLeft","fadeOutLeftBig","fadeOutRight","fadeOutRightBig","fadeOutUp","fadeOutUpBig","flash","flip","flipInX","flipInY","flipOutX","flipOutY","headShake","hinge","jello","lightSpeedIn","lightSpeedOut","pulse","rollIn","rollOut","rotateIn","rotateInDownLeft","rotateInDownRight","rotateInUpLeft","rotateInUpRight","rotateOut","rotateOutDownLeft","rotateOutDownRight","rotateOutUpLeft","rotateOutUpRight","rubberBand","shake","slideInDown","slideInLeft","slideInRight","slideInUp","slideOutDown","slideOutLeft","slideOutRight","slideOutUp","swing","tada","wobble","zoomIn","zoomInDown","zoomInLeft","zoomInRight","zoomInUp","zoomOut","zoomOutDown","zoomOutLeft","zoomOutRight","zoomOutUp","merge"]
              },
							"delay": {
								"description": "Delay the animation. Delay is in seconds. Defaults to 0",
								"type": "number"
							},
							"color": {
								"description": "Color of the headline",
								"type": "string",
								"ui:widget": "grommet-color"
							},
							"margin": {
								"description": "Marin of the headline. xsmall, small, medium, large, xlarge",
								"type": "string"
							},
							"level": {
								"description": "Headline outline, akak h1, h2, h3, ... This propety uses the actual number!",
								"type": "string",
								"pattern": "^[1-6]$"
							},
							"size": {
								"description": "Size of the headline. small, medium, large, xlarge, <css-size>",
								"type": "string"
							},
							"textAlign": {
								"description": "Text-align: start, center, end",
								"type": "string"
							}
						}
					},
					"richtext": {
						"description": "Advanced content handeling. Use markdown here. Additional elements (available in markdown): Textflipper (rotates through lines), Animation (use animation and delay attr to animate content), AbsBox (use top, left, right, bottom to place content within the box. You can also use standard-box attr like backgorund and pad)",
						"type": "object",
						"properties": {
							"content": {
								"description": "Markdown. Do advanced stuff with this",
								"type": "string",
								"ui:widget": "markdown"
							},
							"animation": {
								"description": "animate this",
								"enum": ["none","bouceOut","bounce","bounceIn","bounceInDown","bounceInLeft","bounceInRight","bounceInUp","bounceOutDown","bounceOutLeft","bounceOutRight","bounceOutUp","fadeIn","fadeInDown","fadeInDownBig","fadeInLeft","fadeInLeftBig","fadeInRight","fadeInRightBig","fadeInUp","fadeInUpBig","fadeOut","fadeOutDown","fadeOutDownBig","fadeOutLeft","fadeOutLeftBig","fadeOutRight","fadeOutRightBig","fadeOutUp","fadeOutUpBig","flash","flip","flipInX","flipInY","flipOutX","flipOutY","headShake","hinge","jello","lightSpeedIn","lightSpeedOut","pulse","rollIn","rollOut","rotateIn","rotateInDownLeft","rotateInDownRight","rotateInUpLeft","rotateInUpRight","rotateOut","rotateOutDownLeft","rotateOutDownRight","rotateOutUpLeft","rotateOutUpRight","rubberBand","shake","slideInDown","slideInLeft","slideInRight","slideInUp","slideOutDown","slideOutLeft","slideOutRight","slideOutUp","swing","tada","wobble","zoomIn","zoomInDown","zoomInLeft","zoomInRight","zoomInUp","zoomOut","zoomOutDown","zoomOutLeft","zoomOutRight","zoomOutUp","merge"]
              },
							"delay": {
								"description": "Delay the animation. In seconds",
								"type": "number"
							},
							"content2": {
								"description": "Markdown. If there's more than one content (aka content2), the texts will be displayed one after the other (blending over)",
								"type": "string",
								"ui:widget": "markdown"
							},
							"content3": {
								"type": "string",
								"ui:widget": "markdown"
							},
							"content4": {
								"type": "string",
								"ui:widget": "markdown"
							},
							"content5": {
								"type": "string",
								"ui:widget": "markdown"
							},
							"content6": {
								"type": "string",
								"ui:widget": "markdown"
							},
							"content7": {
								"type": "string",
								"ui:widget": "markdown"
							},
							"content8": {
								"type": "string",
								"ui:widget": "markdown"
							}
						}
					},
					"action": {
						"description": "Call-to-action.",
						"type": "object",
						"properties": {
							"color": {
								"description": "Fill color for primary, label color for plain, border color otherwise.",
								"type": "string",
								"ui:widget": "grommet-color"
							},
							"href": {
								"description": "This button acts as a link. Puts its destination here. Can be internal ('/contact') or extranal ('https://en.wikipedia.org/wiki/Website')",
								"type": "string"
							},
							"margin": {
								"description": "Margin of the button. xsmall, small, medium, large, xlarge",
								"type": "string"
							},
							"onClick": {
								"description": "Triggers a page-action",
								"type": "string",
								"ui:widget": "action"
							},
							"primary": {
								"description": "Is this the websites primary button?",
								"type": "boolean"
							},
							"content": {
								"description": "The actual button-text",
								"type": "string"
							},
							"fill": {
								"description": "Fill the available space",
								"type": "boolean"
							},
							"animation": {
								"description": "Animate the button",
								"enum": ["none","bouceOut","bounce","bounceIn","bounceInDown","bounceInLeft","bounceInRight","bounceInUp","bounceOutDown","bounceOutLeft","bounceOutRight","bounceOutUp","fadeIn","fadeInDown","fadeInDownBig","fadeInLeft","fadeInLeftBig","fadeInRight","fadeInRightBig","fadeInUp","fadeInUpBig","fadeOut","fadeOutDown","fadeOutDownBig","fadeOutLeft","fadeOutLeftBig","fadeOutRight","fadeOutRightBig","fadeOutUp","fadeOutUpBig","flash","flip","flipInX","flipInY","flipOutX","flipOutY","headShake","hinge","jello","lightSpeedIn","lightSpeedOut","pulse","rollIn","rollOut","rotateIn","rotateInDownLeft","rotateInDownRight","rotateInUpLeft","rotateInUpRight","rotateOut","rotateOutDownLeft","rotateOutDownRight","rotateOutUpLeft","rotateOutUpRight","rubberBand","shake","slideInDown","slideInLeft","slideInRight","slideInUp","slideOutDown","slideOutLeft","slideOutRight","slideOutUp","swing","tada","wobble","zoomIn","zoomInDown","zoomInLeft","zoomInRight","zoomInUp","zoomOut","zoomOutDown","zoomOutLeft","zoomOutRight","zoomOutUp","merge"]
              },
							"delay": {
								"description": "Delay the animation (in seconds)",
								"type": "integer"
							},
							"alignSelf": {
								"description": "Self-alignment of the button (as in css-flex-box). start, center, end",
								"type": "string"
							}
						}
					},
					"text": {
						"description": "Some simple text to accompany your Headline",
						"type": "object",
						"properties": {
							"content": {
								"description": "The actual text",
								"type": "string"
							},
							"size": {
								"description": "Size of the text. xsmall, small, medium, large, xlarge",
								"type": "string"
							},
							"textAlign": {
								"description": "Text-alignment. start, center, end",
								"type": "string"
							},
							"alignSelf": {
								"description": "Self-alignment. start, center, end",
								"type": "string"
							},
							"animation": {
								"description": "Animate the text",
								"enum": ["none","bouceOut","bounce","bounceIn","bounceInDown","bounceInLeft","bounceInRight","bounceInUp","bounceOutDown","bounceOutLeft","bounceOutRight","bounceOutUp","fadeIn","fadeInDown","fadeInDownBig","fadeInLeft","fadeInLeftBig","fadeInRight","fadeInRightBig","fadeInUp","fadeInUpBig","fadeOut","fadeOutDown","fadeOutDownBig","fadeOutLeft","fadeOutLeftBig","fadeOutRight","fadeOutRightBig","fadeOutUp","fadeOutUpBig","flash","flip","flipInX","flipInY","flipOutX","flipOutY","headShake","hinge","jello","lightSpeedIn","lightSpeedOut","pulse","rollIn","rollOut","rotateIn","rotateInDownLeft","rotateInDownRight","rotateInUpLeft","rotateInUpRight","rotateOut","rotateOutDownLeft","rotateOutDownRight","rotateOutUpLeft","rotateOutUpRight","rubberBand","shake","slideInDown","slideInLeft","slideInRight","slideInUp","slideOutDown","slideOutLeft","slideOutRight","slideOutUp","swing","tada","wobble","zoomIn","zoomInDown","zoomInLeft","zoomInRight","zoomInUp","zoomOut","zoomOutDown","zoomOutLeft","zoomOutRight","zoomOutUp","merge"]
							},
							"delay": {
								"description": "Delay the animation. In seconds",
								"type": "integer"
							}
						}
					}
				}
			}
		}
	}
}
