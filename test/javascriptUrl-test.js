var vows = require('vows'),
    assert = require('assert'),
    AssetGraph = require('../lib/AssetGraph');

vows.describe('javascript: url test').addBatch({
    'After loading test case': {
        topic: function () {
            new AssetGraph({root: __dirname + '/javascriptUrl/'})
                .loadAssets('index.html')
                .populate()
                .run(this.callback);
        },
        'the graph should contain 2 assets': function (assetGraph) {
            assert.equal(assetGraph.findAssets().length, 2);
        },
        'the graph should contain 1 Html asset': function (assetGraph) {
            assert.equal(assetGraph.findAssets({type: 'Html'}).length, 1);
        },
        'the graph should contain 1 HtmlAnchor relation': function (assetGraph) {
            assert.equal(assetGraph.findRelations({type: 'HtmlAnchor'}).length, 1);
        },
        'the graph should contain 1 JavaScript asset': function (assetGraph) {
            assert.equal(assetGraph.findAssets({type: 'JavaScript'}).length, 1);
        },
        'then manipulating the inline JavaScript': {
            topic: function (assetGraph) {
                var javaScript = assetGraph.findAssets({type: 'JavaScript', isInline: true})[0];
                javaScript.parseTree[1].push(['call', ['name', 'alert'], [['string', 'bar' ]]]);
                javaScript.markDirty();
                return assetGraph;
            },
            'the text of the Html asset should contain the updated javascript: url': function (assetGraph) {
                assert.matches(assetGraph.findAssets({type: 'Html'})[0].text, /bar/);
            }
        }
    }
})['export'](module);
