({
    baseUrl: "./",
    mainConfigFile: "main-require.js",
    name: "main-require",
    include: [
        "text!templates/article.tmpl.html",
        "text!templates/aside.tmpl.html",
        "text!templates/content.tmpl.html",
        "text!templates/footer.tmpl.html",
        "text!templates/header.tmpl.html",
        "text!templates/navigation.tmpl.html",
        "modules/aside",
        "modules/navigation",
        "modules/fruits",
        "modules/vegetables",
        "modules/articles/one",
        "modules/articles/two",
        "modules/articles/three"
    ],
    out: "app.optimized.js"
})