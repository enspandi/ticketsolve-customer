import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/template';
import Ember from 'ember';

function splitCaseInsensitive(string, keyword) {
  let regex = new RegExp(`(${keyword})`, 'gi');
  return string.split(regex);
}
function joinCaseSensitive(stringArr, keyword) {
  return stringArr.map((string) => {
    if (string.toLowerCase() === keyword) {
      return `<span class="text-highlight">${string}</span>`;
    }
    return string;
  }).join('');
}

export function highlightKeyword([text, keyword]) {
  if (!text) {
    return '';
  }
  text = Ember.Handlebars.Utils.escapeExpression(text);
  if (!keyword) {
    return text;
  }
  keyword = keyword.toLowerCase();
  keyword = Ember.Handlebars.Utils.escapeExpression(keyword);

  return htmlSafe(
    joinCaseSensitive(
      splitCaseInsensitive(text, keyword),
      keyword
    )
  );
}

export default helper(highlightKeyword);
