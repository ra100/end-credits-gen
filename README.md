# End Credits Generator

## How to use

```sh
git clone <this repo>
npm install
./index.mjs ./input.yaml ./export.svg
```

## Example

Input

```yaml
---
style:
  background: '#000'
  color: '#fff'
  fontFamily: Ubuntu
  fontSize: 72
  fontWeight: 300
  padding: 16
  width: 3840
sections:
  - padding: 200
    columns:
      - align: right
        fontWeight: 200
        xOffset: 1870
      - align: left
        fontWeight: 400
        xOffset: 1970
    content:
      - - - Awesome Role
        - - Great Actor
      - - - Less Awesome Role
        - - Still Great Actor
      - - - ''
        - - ''
      - - - Some Staff
        - - Nice Person
          - Nice Person Too
  - padding: 200
    columns:
      - fontSize: 64
        padding: 12
        align: center
        xOffset: 1920
    content:
      - - - First line of some long text centered you know how
      - - - second line of that same text
  - padding: 200
    columns:
      - align: right
        xOffset: 1620
      - align: center
        xOffset: 1920
      - align: left
        xOffset: 2220
    content:
      - - - left
        - - center
        - - right
      - - - other left
        - - other center
        - - other right
```

Output

![](./example.svg)
