exports.onCreateWebpackConfig = ({
    stage,
    rules,
    loaders,
    plugins,
    actions,
  }) => {
    actions.setWebpackConfig({
        module: {
            rules: [{
                test: /\.(glsl|vs|fs|vert|frag)$/,
                exclude: /node_modules/,
                use: [
                'raw-loader',
                'glslify-loader'
                ]
            }]
        }
    });
    if(stage === "build-html") {
        actions.setWebpackConfig({
            module: {
                rules: [
                  {
                    test: /p5/,
                    use: loaders.null(),
                  },
                ],
              },
        });
    }
}