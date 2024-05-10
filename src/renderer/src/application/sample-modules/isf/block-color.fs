/*
{
  "CATEGORIES" : [
    "color"
  ],
  "DESCRIPTION" : "Solid color block",
  "ISFVSN" : "2",
  "INPUTS" : [
    {
      "NAME" : "r",
      "TYPE" : "float",
      "MAX" : 1,
      "DEFAULT" : 0,
      "MIN" : 0,
      "LABEL" : "Red"
    },
    {
      "NAME" : "g",
      "TYPE" : "float",
      "MAX" : 1,
      "DEFAULT" : 0,
      "LABEL" : "Green",
      "MIN" : 0
    },
    {
      "NAME" : "b",
      "TYPE" : "float",
      "MAX" : 1,
      "DEFAULT" : 0,
      "LABEL" : "Blue",
      "MIN" : 0
    },
    {
      "NAME" : "a",
      "TYPE" : "float",
      "MAX" : 1,
      "DEFAULT" : 0,
      "LABEL" : "Alpha",
      "MIN" : 0
    }
  ],
  "VSN" : "1.0",
  "CREDIT" : "2xAA"
}
*/

void main()	{
  gl_FragColor = vec4(r, g, b, a);
}