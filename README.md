# End Credits Generator

## How to use

```sh
git clone https://github.com/ra100/end-credits-gen.git
npm install
./index.mjs ./input.yaml ./export.svg
```

Export to png file using inkscape

```sh
inkscape ./export.svg --export-text-to-path --export-filename=/tmp/credits.svg
inkscape /tmp/credits.svg --export-filename="credits.png"
```

## Example

Get this:
![](./example.svg)

From this: [example.yaml](./example.yaml)
