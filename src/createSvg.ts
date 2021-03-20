import path from 'path'
import fs from 'fs'

type ConfigStyle = {
  background: string
  color: string
  fontFamily: string
  fontSize: number
  fontWeight: number
  marginBottom: number
  marginTop: number
  xOffset?: number
  xTransform?: number
  align?: string
}

type ColumnStyle = ConfigStyle & {
  align: string
  xOffset: number
  marginTop?: number
}

type Section = {
  marginBottom: number
  marginTop?: number
  columns: ColumnStyle[]
  content: string[][][]
}

export type Config = {
  width: number
  height: number
  outputWidth: number
  outputHeight: number
  ppf: number
  style: ConfigStyle
  sections: Section[]
}

type ComposeOptions = {
  content: string
  width: number
  height: number
  background: string
}

const composeSvg = ({content, width, height, background}: ComposeOptions) =>
  `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:cc="http://creativecommons.org/ns#"
  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
  xmlns:svg="http://www.w3.org/2000/svg"
  xmlns="http://www.w3.org/2000/svg" version="1.1"
  viewBox="0 0 ${width} ${height}"
  >
  <style>
  :root {
    background: ${background || 'transparent'};
  }
  </style>
  <g id="background">
    <rect x="0" y="0" width="${width}" height="${height}" style="fill: ${background};"/>
  </g>
  <g id="credits">
    ${content}
  </g>
</svg>\n`

const anchorMap: Record<string, string> = {
  left: 'start',
  center: 'middle',
  right: 'end',
}

type HtmlStyleOptions = Pick<ColumnStyle, 'fontSize' | 'fontWeight' | 'fontFamily' | 'align' | 'color'>

const getHtmlStyle = ({fontSize, fontWeight, fontFamily, align, color}: HtmlStyleOptions) =>
  [
    `fill: ${color}`,
    `font-family: ${fontFamily}`,

    `font-size: ${fontSize}px`,
    `font-weight: ${fontWeight}`,
    `text-align: ${align}`,
    `text-anchor: ${anchorMap[align]}`,
  ].join(';')

const getTransform = ({xTransform, xOffset}: Pick<ColumnStyle, 'xTransform' | 'xOffset'>): string => {
  if (!xTransform) {
    return ''
  }
  const positionCorrection = (1 - xTransform) * xOffset
  return `transform="matrix(${xTransform}, 0, 0, 1, ${positionCorrection}, 0)"`
}

const wrapColumn = (text: string, style: ColumnStyle): string => {
  const htmlStyle = getHtmlStyle(style)

  return `  <text style="${htmlStyle}" ${getTransform(style)}>
    ${text}
  </text>`
}

const wrapText = ({text, yOffset, xOffset}: {text: string; yOffset: number; xOffset: number}): string =>
  `<tspan x="${xOffset}" y="${yOffset}">${text}</tspan>`

const composeText = ({lines, style, yStart}: {lines: string[]; style: ColumnStyle; yStart: number}) =>
  lines
    .map((text, index) =>
      wrapText({
        text,
        yOffset: yStart + index * (style.fontSize + style.marginBottom + style.marginTop),
        xOffset: style.xOffset,
      })
    )
    .join('')

const getColumnHeight = (length: number, style: ColumnStyle) =>
  length * (style.fontSize + style.marginBottom + style.marginTop)

const getColumnXml = ({style, yStart, column}: {style: ColumnStyle; yStart: number; column: string[]}) => {
  const lines = composeText({lines: column, style, yStart})

  return wrapColumn(lines, style)
}

export const createSvg = (data: Config): {content: string; height: number} => {
  const firstStyle = {...data.style, ...data.sections[0].columns[0]}
  let yStart = firstStyle.fontSize + firstStyle.marginTop + data.height

  const output = []

  for (const section of data.sections) {
    const {columns, content, marginTop = 0, marginBottom} = section
    yStart += marginTop

    for (const row of content) {
      const xml = row
        .map((column, index) => {
          return getColumnXml({
            style: {...data.style, ...columns[index]},
            yStart,
            column,
          })
        })
        .join('\n')

      output.push(xml)

      yStart += Math.max(
        ...row.map((array, index) => getColumnHeight(array.length, {...data.style, ...columns[index]}))
      )
    }

    yStart += marginBottom || 0
  }

  return {
    content: composeSvg({
      ...data.style,
      content: output.join('\n'),
      height: yStart + data.height,
      width: data.width,
    }),
    height: yStart + data.height,
  }
}

export const createSvgFile = (config: Config, output?: string): {filename: string; height: number} => {
  const outputFile = output || path.join('.', `tmp-path-svg${Date.now()}.svg`)

  const {content, height} = createSvg(config)

  fs.writeFileSync(outputFile, content)

  return {filename: outputFile, height}
}
