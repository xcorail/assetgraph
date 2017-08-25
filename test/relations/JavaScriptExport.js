const expect = require('../unexpected-with-plugins');
const AssetGraph = require('../../lib/AssetGraph');

describe('JavaScriptExport', function () {
    it('should detect an ExportNamedDeclaration node', function () {
        const javaScript = new AssetGraph().addAsset({
            type: 'JavaScript',
            url: 'https://example.com/',
            text: `
                export { foo } from 'bar/quux.js';
            `
        });

        expect(javaScript.outgoingRelations, 'to satisfy', [
            { type: 'JavaScriptExport', href: 'bar/quux.js', to: { url: 'https://example.com/bar/quux.js' } }
        ]);
    });

    it('should detect an ExportAllDeclaration node', function () {
        const javaScript = new AssetGraph().addAsset({
            type: 'JavaScript',
            url: 'https://example.com/',
            text: `
                export * from 'bar/quux.js';
            `
        });

        expect(javaScript.outgoingRelations, 'to satisfy', [
            { type: 'JavaScriptExport', href: 'bar/quux.js', to: { url: 'https://example.com/bar/quux.js' } }
        ]);
    });

    it('should ignore an ExportNamedDeclaration node without a source', function () {
        const javaScript = new AssetGraph().addAsset({
            type: 'JavaScript',
            url: 'https://example.com/',
            text: `
                export function foo () {};
            `
        });

        expect(javaScript.outgoingRelations, 'to equal', []);
    });

    it('should ignore an ExportDefaultDeclaration node without a source', function () {
        const javaScript = new AssetGraph().addAsset({
            type: 'JavaScript',
            url: 'https://example.com/',
            text: `
                export default 123;
            `
        });

        expect(javaScript.outgoingRelations, 'to equal', []);
    });

    it('should update the href of a relation', function () {
        const javaScript = new AssetGraph().addAsset({
            type: 'JavaScript',
            url: 'https://example.com/',
            text: `
                export { foo } from 'bar/quux.js';
            `
        });

        javaScript.outgoingRelations[0].href = 'blabla.js';
        javaScript.markDirty();
        expect(javaScript.text, 'to contain', 'export {\n    foo\n} from \'blabla.js\';');
    });

    describe('#attach', function () {
        describe('with a position of first', function () {
            it('should attach before the first existing export', function () {
                const javaScript = new AssetGraph().addAsset({
                    type: 'JavaScript',
                    url: 'https://example.com/',
                    text: `
                        export { foo } from 'bar/quux.js';
                    `
                });

                const newRelation = javaScript.addRelation({
                    type: 'JavaScriptExport',
                    to: 'http://blabla.com/lib.js'
                }, 'first');
                expect(javaScript.outgoingRelations, 'to satisfy', { 0: newRelation });
                expect(javaScript.text, 'to begin with', 'export * from \'http://blabla.com/lib.js\';');
            });
        });

        describe('with a position of last', function () {
            it('should attach after the last existing export', function () {
                const javaScript = new AssetGraph().addAsset({
                    type: 'JavaScript',
                    url: 'https://example.com/',
                    text: `
                        export { foo } from 'bar/quux.js';
                    `
                });

                const newRelation = javaScript.addRelation({
                    type: 'JavaScriptExport',
                    to: 'http://blabla.com/lib.js'
                }, 'last');
                expect(javaScript.outgoingRelations, 'to satisfy', { 1: newRelation });
                expect(javaScript.text, 'to end with', 'export * from \'http://blabla.com/lib.js\';');
            });
        });

        describe('with a position of after', function () {
            it('should attach after the given existing export', function () {
                const javaScript = new AssetGraph().addAsset({
                    type: 'JavaScript',
                    url: 'https://example.com/',
                    text: `
                        export { foo } from 'bar/quux.js';
                        export { baz } from 'blah.js';
                    `
                });

                const newRelation = javaScript.addRelation({
                    type: 'JavaScriptExport',
                    to: 'http://blabla.com/lib.js'
                }, 'after', javaScript.outgoingRelations[0]);
                expect(javaScript.outgoingRelations, 'to satisfy', { 1: newRelation });
                expect(javaScript.text, 'to equal', `
                    export {
                        foo
                    } from 'bar/quux.js';
                    export * from 'http://blabla.com/lib.js';
                    export {
                        baz
                    } from 'blah.js';`.replace(/^\n/, '').replace(/^ {20}/mg, ''));
            });
        });

        describe('with a position of before', function () {
            it('should attach before the given existing export', function () {
                const javaScript = new AssetGraph().addAsset({
                    type: 'JavaScript',
                    url: 'https://example.com/',
                    text: `
                        export { foo } from 'bar/quux.js';
                        export { baz } from 'blah.js';
                    `
                });

                const newRelation = javaScript.addRelation({
                    type: 'JavaScriptExport',
                    to: 'http://blabla.com/lib.js'
                }, 'before', javaScript.outgoingRelations[1]);
                expect(javaScript.outgoingRelations, 'to satisfy', { 1: newRelation });
                expect(javaScript.text, 'to equal', `
                    export {
                        foo
                    } from 'bar/quux.js';
                    export * from 'http://blabla.com/lib.js';
                    export {
                        baz
                    } from 'blah.js';`.replace(/^\n/, '').replace(/^ {20}/mg, ''));
            });
        });
    });

    describe('#detach', function () {
        it('should remove the relation from the source code and the outgoingRelations array', function () {
            const javaScript = new AssetGraph().addAsset({
                type: 'JavaScript',
                url: 'https://example.com/',
                text: 'export { foo } from \'bar/quux.js\';'
            });
            javaScript.outgoingRelations[0].detach();
            expect(javaScript.outgoingRelations, 'to equal', []);
            expect(javaScript.text, 'to equal', '');
        });
    });
});
