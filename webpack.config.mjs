import path from 'path'

export default {
  target: 'node',
  entry: {
    index: './src/index.ts',
    cli: './src/cli.ts',
  },
  mode: process.env.NODE_ENV !== 'production' ? 'development' : 'production',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.mjs'],
  },
  output: {
    filename: './[name].js',
    path: path.resolve('dist'),
  },
  devtool: 'source-map',
}
