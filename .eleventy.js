const pluginDate = require('eleventy-plugin-date');

module.exports = function(eleventyConfig) {

    eleventyConfig.addPlugin(pluginDate);

    eleventyConfig.addFilter('head', (array, n) => {
        if(!Array.isArray(array) || array.length === 0) {
            return [];
        }
        if( n < 0) {
            return array.slice(n);
        }
        return array.slice(0, n);
    });

    eleventyConfig.addPassthroughCopy('src/assets')
    eleventyConfig.addPassthroughCopy('src/admin')
    
    eleventyConfig.addCollection('posts', function(collectionsApi) {
        let allItems = collectionsApi.getAll();
        let posts = allItems.filter(item =>
            item.data.tags && item.data.tags.includes('posts')
        );
        posts.sort((a, b) => {
            return b.date.getTime() - a.date.getTime();
        });
        return posts;
    });


    return {
        dir: {
            input: 'src',
            output: 'dist',
            data: '_data',
            layouts: '_layouts',
            includes: '_includes'
        }
    }
};