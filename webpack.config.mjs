import path from 'path'

export default {
  entry: './src/index.ts',
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
    filename: './index.js',
    path: path.resolve('dist'),
  },
  devtool: 'source-map',
}
