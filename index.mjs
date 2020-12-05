#!/usr/bin/env node

import fs from 'fs'
import assert from 'assert'
import yaml from 'js-yaml'

const composeSvg = ({content, width, height, background}) =>
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
  <g id="layer1">
    ${content}
  </g>
</svg>\n`

const anchorMap = {
  left: 'start',
  center: 'middle',
  right: 'end',
}

const getHtmlStyle = ({fontSize, fontWeight, fontFamily, align, color}) =>
  [
    `fill: ${color}`,
    `font-family: ${fontFamily}`,
    `font-size: ${fontSize}px`,
    `font-weight: ${fontWeight}`,
    `text-align: ${align}`,
    `text-anchor: ${anchorMap[align]}`,
  ].join(';')

const getTransform = ({xTransform, xOffset}) => {
  if (!xTransform) {
    return ''
  }
  const positionCorrection = (1 - xTransform) * xOffset
  return `transform="matrix(${xTransform}, 0, 0, 1, ${positionCorrection}, 0)"`
}

const wrapColumn = (text, style, yOffset) => {
  const htmlStyle = getHtmlStyle(style)

  return `  <text style="${htmlStyle}" ${getTransform(style)}>
    ${text}
  </text>`
}

const wrapText = ({text, yOffset, xOffset}) =>
  `<tspan x="${xOffset}" y="${yOffset}">${text}</tspan>`

const composeText = ({lines, style, yStart}) =>
  lines
    .map((text, index) =>
      wrapText({
        text,
        yOffset:
          yStart +
          index * (style.fontSize + style.marginBottom + style.marginTop),
        xOffset: style.xOffset,
      })
    )
    .join('')

const getColumnHeight = (length, style) =>
  length * (style.fontSize + style.marginBottom + style.marginTop)

const getColumnXml = ({style, yStart, column}) => {
  const lines = composeText({lines: column, style, yStart})

  return wrapColumn(lines, style, yStart)
}

const createSvg = data => {
  const firstStyle = {...data.style, ...data.sections[0].columns[0]}
  let yStart = firstStyle.fontSize + firstStyle.marginTop
  const output = []

  for (const section of data.sections) {
    const {columns, content} = section
    if (section.marginTop) {
      yStart += section.marginTop
    }

    for (const row of content) {
      const xml = row
        .map((column, i) => {
          return getColumnXml({
            style: {...data.style, ...columns[i]},
            yStart,
            column,
          })
        })
        .join('\n')

      output.push(xml)

      yStart += Math.max(
        ...row.map((array, i) =>
          getColumnHeight(array.length, {...data.style, ...columns[i]})
        )
      )
    }

    yStart += section.marginBottom || 0
  }

  return composeSvg({
    ...data.style,
    content: output.join('\n'),
    height: yStart,
  })
}

const importFile = path => fs.readFileSync(path, 'utf-8')

const exportFile = (path, content) => {
  fs.writeFileSync(path, content)
}

const main = () => {
  const [_node, _script, input, out] = process.argv

  assert(!!input, 'input file path needs to be specified')
  assert(!!out, 'output file path needs to be specified')

  console.info('Import file', input)
  const yamlFile = importFile(input)
  const json = yaml.safeLoad(yamlFile)
  console.info('Assembling svg')
  const svg = createSvg(json)
  console.info('Saving file', out)
  exportFile(out, svg)
  console.info('Done')
}

main()
