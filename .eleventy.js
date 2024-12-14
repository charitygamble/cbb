module.exports = function(eleventyConfig) {
    const {
        DateTime
    } = require('luxon');

    eleventyConfig.addFilter('htmlDateString', (dateObj) => {
        return DateTime.fromJSDate(dateObj, {
            zone: 'utc'
        }).toFormat('yy-MM-dd');
    });

    eleventyConfig.addFilter('readableDate', dateObj => {
        return DateTime.fromJSDate(dateObj, {
            zone: 'utc'
        }).toFormat('yy-MM-dd');
    });

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
    eleventyConfig.addPassthroughCopy('admin')
    return {
        dir: {
            input: 'src',
            output: 'dist',
            data: '_data',
            layouts: '_layouts',
            includes: '_includes'
        }
    }

}