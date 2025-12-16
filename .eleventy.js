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
    
    // 1. Filter to include only items tagged 'posts'
    let taggedPosts = allItems.filter(item =>
        item.data.tags && item.data.tags.includes('posts')
    );
    
    // 2. Filter the tagged posts to exclude drafts
    let publishedPosts = taggedPosts.filter(item => 
        !item.data.draft
    );
    
    // 3. Sort the resulting published posts
    publishedPosts.sort((a, b) => {
        return b.date.getTime() - a.date.getTime();
    });
    
    // Return ONLY the published, sorted posts
    return publishedPosts;
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