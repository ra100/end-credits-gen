import {createSvg} from './createSvg'

describe('createSvg', () => {
  it('should generate SVG based on config', () => {
    const config = {
      width: 3860,
      height: 2160,
      outputWidth: 1980,
      outputHeight: 1080,
      ppf: 3,
      style: {
        background: '#000',
        color: '#fff',
        fontFamily: 'Ubuntu',
        fontSize: 72,
        fontWeight: 300,
        marginBottom: 16,
        marginTop: 0,
      },
      sections: [
        {
          marginBottom: 200,
          columns: [{align: 'center', fontWeight: 400, fontSize: 150, xOffset: 1970, xTransform: 0.8}],
          content: [[['Title']]],
        },
      ],
    }

    expect(createSvg(config)).toMatchInlineSnapshot(`
      {
        "content": "<?xml version="1.0" encoding="UTF-8" standalone="no"?>
      <svg xmlns:dc="http://purl.org/dc/elements/1.1/"
        xmlns:cc="http://creativecommons.org/ns#"
        xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
        xmlns:svg="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        xmlns="http://www.w3.org/2000/svg" version="1.1"
        viewBox="0 0 3860 4836"
        >
        <style>
        :root {
          background: #000;
        }
        </style>
        <g id="background">
          <rect x="0" y="0" width="3860" height="4836" style="fill: #000;"/>
        </g>
        <g id="credits">
            <text style="fill: #fff;font-family: Ubuntu;font-size: 150px;font-weight: 400;text-align: center;text-anchor: middle" transform="matrix(0.8, 0, 0, 1, 393.9999999999999, 0)">
          <tspan x="1970" y="2310">Title</tspan>
        </text>
        </g>
      </svg>
      ",
        "height": 4836,
      }
    `)
  })
})
