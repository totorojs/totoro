KISSY.add(function(S,node){
    var $ = node.all;
    describe("node", function () {
        it("should append/prepend correctly on node", function () {
            var body = S.one(document.body);

            var n = body.append("<div class='test-div' id='testDiv4'>ok4</div>");

            expect(n).toBe(body);

            expect($("#testDiv4")).not.toBe(null);

            $("#foo").prepend("<div class='test-div' id='testDiv5'>ok5</div>");

            expect($("#testDiv5")).not.toBe(null);
        });

        it('node is not plainObject', function () {
            expect(S.isPlainObject($('body'))).toBe(false);
            expect(S.isPlainObject($('#ee'))).toBe(false);
            expect(S.isPlainObject($(document.body))).toBe(false);
        });

        it("add works", function () {
            var x = $();
            var y = x.add("<div></div><p></p>");

            expect(x).not.toBe(y);
            expect(y.length).toBe(2);
            var z = y.add("<s></s>");
            expect(z.length).toBe(3);
            expect(z.item(2).getDOMNode().nodeName.toLowerCase()).toBe("s");
            var q = z.add("<b></b>", 0);
            expect(q.length).toBe(4);
            expect(q.item(0).getDOMNode().nodeName.toLowerCase()).toBe("b");
        });
    });
},{requires:['node']})