type ConfigStyle = {
  background: string
  color: string
  fontFamily: string
  fontSize: number
  fontWeight: number
  marginBottom?: number
  marginTop?: number
  xOffset?: number
  xTransform?: number
  align?: string
}

type ColumnStyle = Required<ConfigStyle>

type ContentTypes = 'image'

type ContentImage = {
  type: ContentTypes
  width: number
  height: number
  href: string
  opacity?: string
  marginTop?: number
  marginBottom?: number
}

type ContentItem = string | ContentImage

type Section = {
  marginBottom: number
  marginTop?: number
  columns: Partial<ConfigStyle>[]
  content: ContentItem[][][]
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
  xmlns:xlink="http://www.w3.org/1999/xlink"
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

const wrapTextColumn = (text: string, style: ColumnStyle): string => {
  const htmlStyle = getHtmlStyle(style)

  return `  <text style="${htmlStyle}" ${getTransform(style)}>
    ${text}
  </text>`
}

const wrapText = ({text, yOffset, xOffset}: {text: string; yOffset: number; xOffset: number}): string =>
  `<tspan x="${xOffset}" y="${yOffset}">${text}</tspan>`

const wrapImage = (
  {width, height, href, opacity = '1', marginTop = 0}: ContentImage,
  {xOffset, yOffset: y, style}: {xOffset: number; yOffset: number; style: ColumnStyle}
): string => {
  const x = style.align === 'center' ? xOffset - width / 2 : xOffset

  return `   <image x="${x}" y="${
    y + marginTop
  }" height="${height}" width="${width}" style="opacity: ${opacity};" xlink:href="${href.replaceAll('\n', '')}" />`
}

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

const getTextColumnHeight = (length: number, style: ColumnStyle) =>
  length * (style.fontSize + style.marginBottom + style.marginTop)

const getImageHeight = (image: ContentImage): number =>
  image.height + (image.marginTop ?? 0) + (image.marginBottom ?? 0)

const getColumnHeight = (items: ContentItem[], style: ColumnStyle): number => {
  if (typeof items[0] !== 'string' && items[0].type === 'image') {
    return getImageHeight(items[0])
  }

  return getTextColumnHeight(items.length, style)
}

const getColumnXml = ({style, yStart, column}: {style: ColumnStyle; yStart: number; column: ContentItem[]}) => {
  if (typeof column[0] === 'string') {
    const lines = composeText({lines: column as string[], style, yStart})
    return wrapTextColumn(lines, style)
  }

  if (column[0].type === 'image') {
    return wrapImage(column[0], {yOffset: yStart + getTextColumnHeight(1, style), xOffset: style.xOffset, style})
  }

  return ''
}

const fillDefaultStyle = (config: Config): Required<ConfigStyle> => ({
  ...config.style,
  xTransform: config.style.xTransform ?? 1,
  align: config.style.align ?? 'center',
  marginBottom: config.style.marginBottom ?? 0,
  marginTop: config.style.marginTop ?? 0,
  xOffset: config.style.xOffset ?? config.width / 2,
})

export const createSvg = (config: Config): {content: string; height: number} => {
  const style = fillDefaultStyle(config)

  const firstStyle = {...style, ...config.sections[0].columns[0]}

  let yStart = firstStyle.fontSize + firstStyle.marginTop + config.height

  const output = []

  for (const section of config.sections) {
    const {columns, content, marginTop = 0, marginBottom} = section
    yStart += marginTop

    for (const row of content) {
      const xml = row
        .map((column, index) => {
          return getColumnXml({
            style: {...style, ...columns[index]},
            yStart,
            column,
          })
        })
        .join('\n')

      output.push(xml)

      yStart += Math.max(...row.map((array, index) => getColumnHeight(array, {...style, ...columns[index]})))
    }

    yStart += marginBottom || 0
  }

  return {
    content: composeSvg({
      ...style,
      content: output.join('\n'),
      height: yStart + config.height,
      width: config.width,
    }),
    height: yStart + config.height,
  }
}
