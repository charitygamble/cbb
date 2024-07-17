module.exports = function(eleventyConfig) {
eleventyConfig.addPassthroughCopy('src/assets/css');
eleventyConfig.addPassthroughCopy('src/assets/images');
eleventyConfig.addPassthroughCopy('admin');

    return {
        dir: {
            input: 'src',
            data: '_data',
            includes: '_includes',
            layouts: '_layouts'
        }
    };
}