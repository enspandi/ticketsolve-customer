import { highlightKeyword } from 'ticketsolve-customer/helpers/highlight-keyword';
import { module, test } from 'qunit';

function testHighlight(text, keyword) {
  return highlightKeyword([text, keyword]).toString();
}

module('Unit | Helper | highlight-keyword', function() {
  test('it highlights text', function(assert) {
    assert.equal(
      testHighlight('John Doe', 'John Doe'),
      '<span class="text-highlight">John Doe</span>',
      'Highlights full text'
    );
    assert.equal(
      testHighlight('John Doe', 'oe'),
      'John D<span class="text-highlight">oe</span>',
      'Highlights part of the text'
    );
    assert.equal(
      testHighlight('John Doe', 'doe'),
      'John <span class="text-highlight">Doe</span>',
      'Highlights case insensitive'
    );
    assert.equal(
      testHighlight('John Doe', 'something'),
      'John Doe',
      'Highlights nothing'
    );
    assert.equal(
      testHighlight('John.Doe@Yahoo.com', '@yahoo'),
      'John.Doe<span class="text-highlight">@Yahoo</span>.com',
      'Highlights with special characters'
    );
    assert.equal(
      testHighlight('John <script>xss();</script>Doe', 'Doe'),
      'John &lt;script&gt;xss();&lt;/script&gt;<span class="text-highlight">Doe</span>',
      'Escapes text'
    );
  });
});
