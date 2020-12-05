# End Credits Generator

## How to use

1. Install

```sh
git clone https://github.com/ra100/end-credits-gen.git
npm install
```

2. Run

```bash
./index.mjs ./input.yaml ./export.svg
```

To export **png** file directly, you need to have [inkscape](https://inkscape.org)
installed, and run:

```bash
./index.mjs ./input.yaml ./export.png
```

To export rendered frames with crawl speed configured by `ppf` setting in yaml,
you need [inkscape](https://inkscape.org) and
[ImageMagick](https://imagemagick.org/script/download.php) installed

```bash
./index.mjs ./input.yaml ./export/folder/
```

This will produce folder with files `./export/folder/credits_<frame number>.png`

## Example

Get this:
![](./example.svg)

From this: [example.yaml](./example.yaml)

## License

[GNU LGPLv3](./LICENSE)
