var expect = require('./unexpected-with-plugins'),
    AssetGraph = require('../lib');

describe('HtmlApplet', function () {
    it('should handle a simple test case', function (done) {
        new AssetGraph({root: __dirname + '/HtmlApplet/'})
            .loadAssets('index.html')
            .populate()
            .queue(function (assetGraph) {
                expect(assetGraph, 'to contain assets', 2);
                expect(assetGraph, 'to contain asset', 'Html');
                expect(assetGraph, 'to contain relation', 'HtmlApplet');
                expect(assetGraph, 'to contain asset', 'Asset');
            })
            .run(done);
    });
});