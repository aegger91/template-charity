/*
 * Geometry for the Slavic eight-pointed cross used everywhere in the template
 * (header, logos, favicon, ornaments, generated brand files).
 *
 * Bars from top to bottom: short title bar, main bar, slanted footrest.
 * The footrest's end on the viewer's LEFT is HIGHER than the right end.
 * In SVG, smaller y is higher, so the left points use smaller y values.
 * Never mirror this shape for RTL.
 */
export const CROSS_VIEWBOX = { width: 40, height: 56 } as const;

export const CROSS_PATH = [
  // vertical beam
  "M18 0H22V56H18Z",
  // short top bar (title board)
  "M13 6.5H27V10H13Z",
  // main bar
  "M5.5 15.5H34.5V20H5.5Z",
  // slanted footrest: left end higher (y 36 to 39.6), right end lower (y 41.6 to 45.2)
  "M10.5 36L29.5 41.6V45.2L10.5 39.6Z",
].join("");
