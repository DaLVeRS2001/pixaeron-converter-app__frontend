import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const buildStyleLoader = (isDev: boolean) => {
  return {
    test: /\.s[ac]ss$/i,
    use: [
      isDev ? 'style-loader' : MiniCssExtractPlugin.loader,

      {
        loader: 'css-loader',
        options: {
          sourceMap: isDev,
        },
      },

      {
        loader: 'postcss-loader',
        options: {
          sourceMap: isDev,
        },
      },

      {
        loader: 'sass-loader',
        options: {
          sourceMap: isDev,
        },
      },
    ],
  };
};

export { buildStyleLoader };
