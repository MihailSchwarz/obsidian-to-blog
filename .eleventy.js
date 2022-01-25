const { DateTime } = require("luxon");
const fs = require("fs");
const slugify = require("slugify");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginNavigation = require("@11ty/eleventy-navigation");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const Image = require('@11ty/eleventy-img');



module.exports = function(eleventyConfig) {

  const files = [
   // 'src/fonts',
    'src/css',
    'src/favicon.ico'
    //'src/apple-touch-1.png'
  ];
  files.forEach((file) => eleventyConfig.addPassthroughCopy(file));



  // Add plugins
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSyntaxHighlight);
  eleventyConfig.addPlugin(pluginNavigation);


  function lazyImages (eleventyConfig, userOptions = {}) {
    const {parse} = require('node-html-parser')

    const options = {
      name: 'lazy-images',
      ...userOptions
    }

    eleventyConfig.addTransform(options.extensions, (content, outputPath) => {
      if (outputPath.endsWith('.html')) {
        const root = parse(content);
        const images = root.querySelectorAll('img');
        images.forEach((img) => {
          img.setAttribute('loading', 'lazy')
          var url = img.getAttribute('src').replaceAll('%20',' ')
          if (url[0] == 'i') {

            function imageShortcode(src, alt, widths) {
              var src = src.replaceAll('%20',' ')
              console.log('img- ',src)
              let options = {
                widths: widths,
                formats: ["webp", "jpeg"],
                outputDir: "./_site/img/",
                filenameFormat: function (id, src, width, format, options) {
                  const filename = ('filename ', `${src.replace('src/posts/img/','').replace('.jpeg','').replace('.jpg','').toLocaleLowerCase().replaceAll(' ','-')}-${width}.${format}`)
                  return filename;
                }
              };

              // generate images, while this is async we don’t wait
              Image(src, options);

              let imageAttributes = {
                class: "image",
                alt: alt,
                sizes: "(min-width: 832px) 800px, 100vw",
                loading: "lazy",
                decoding: "async",
              };
              // get metadata even the images are not fully generated
              let metadata = Image.statsSync(src, options);
              return Image.generateHTML(metadata, imageAttributes);
            }

            img.replaceWith(imageShortcode('src/posts/'+img.getAttribute('src'),  img.getAttribute('alt'), [716, 800, 1600]))
          }
        })
        return root.toString()
      }
      return content;
    })
  }

  eleventyConfig.addPlugin(lazyImages, {})


  // Alias `layout: post` to `layout: layouts/post.njk`
  eleventyConfig.addLayoutAlias("post", "layouts/post.njk");

  eleventyConfig.addFilter("readableDate", dateObj => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat("dd LLL yyyy");
  });



  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter('htmlDateString', (dateObj) => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
  });

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter("head", (array, n) => {
    if(!Array.isArray(array) || array.length === 0) {
      return [];
    }
    if( n < 0 ) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  // Return the smallest number argument
  eleventyConfig.addFilter("min", (...numbers) => {
    return Math.min.apply(null, numbers);
  });

  function filterTagList(tags) {
    return (tags || []).filter(tag => ["all", "nav", "post", "posts"].indexOf(tag) === -1);
  }

  eleventyConfig.addFilter("filterTagList", filterTagList)

  // Create an array of all tags
  eleventyConfig.addCollection("tagList", function(collection) {
    let tagSet = new Set();
    collection.getAll().forEach(item => {
      (item.data.tags || []).forEach(tag => tagSet.add(tag));
    });

    return filterTagList([...tagSet]);
  });

  // Customize Markdown library and settings:
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true
  })


  markdownLibrary.use(require('markdown-it-footnote'))
  markdownLibrary.use(require('markdown-it-attrs'))
  markdownLibrary.use(function(md) {
    // Recognize Mediawiki links ([[text]])
    md.linkify.add("[[", {
        validate: /^\s?([^\[\]\|\n\r]+)(\|[^\[\]\|\n\r]+)?\s?\]\]/,
        normalize: match => {
            const parts = match.raw.slice(2,-2).split("|");
            parts[0] = parts[0].replace(/.(md|markdown)\s?$/i, "");
            match.text = (parts[1] || parts[0]).trim();
            match.url = `/${parts[0].trim().toLocaleLowerCase().replaceAll(' ','-')}/`;
        }
    })
  })
  markdownLibrary.use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.ariaHidden({
      placement: "after",
      class: "direct-link",
      symbol: "#",
      level: [1,2,3,4],

    }),
    slugify: eleventyConfig.getFilter("slug")

  });

  eleventyConfig.setLibrary("md", markdownLibrary);


  // Override Browsersync defaults (used only with --serve)
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function(err, browserSync) {
        const content_404 = fs.readFileSync('_site/404.html');

        browserSync.addMiddleware("*", (req, res) => {
          // Provides the 404 content without redirect.
          res.writeHead(404, {"Content-Type": "text/html; charset=UTF-8"});
          res.write(content_404);
          res.end();
        });
      },
    },
    ui: false,
    ghostMode: false
  });

  return {
    // Control which files Eleventy will process
    // e.g.: *.md, *.njk, *.html, *.liquid
    templateFormats: [
      "md",
      "njk",
      "html",
      "liquid"
    ],

    // Pre-process *.md files with: (default: `liquid`)
    markdownTemplateEngine: "njk",

    // Pre-process *.html files with: (default: `liquid`)
    htmlTemplateEngine: "njk",

    // Optional (default is shown)
    pathPrefix: "/",
    // -----------------------------------------------------------------

    // These are all optional (defaults are shown):
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site"
    }
  };
};
