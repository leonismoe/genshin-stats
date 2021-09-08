let screenRules: Array<CSSMediaRule> = [];
let printRules: Array<CSSMediaRule> = [];

function isMediaRule(rule: CSSRule): rule is CSSMediaRule {
  return rule.type == CSSRule.MEDIA_RULE;
}

export function enable() {
  for (const el of Array.from(document.querySelectorAll('link[rel=stylesheet], style') as NodeListOf<HTMLLinkElement | HTMLStyleElement>)) {
    if (el.media === 'print') {
      el.title = 'print-disabled';
      el.media = '';

    } else if (el.media === 'screen') {
      (el as HTMLLinkElement).disabled = true;

    } else {
      const sheet = el.sheet;
      if (sheet) {
        for (let i = 0; i < sheet.cssRules.length; ++i) {
          const rule = sheet.cssRules[i];

          if (isMediaRule(rule)) {
            if (rule.conditionText === 'print') {
              rule.media.mediaText = 'screen';
              printRules.push(rule);

            } else if (rule.conditionText === 'screen') {
              rule.media.mediaText = 'disabled';
              screenRules.push(rule);
            }
          }
        }
      }
    }
  }
}

export function disable() {
  for (const el of Array.from(document.querySelectorAll('link[rel=stylesheet], style') as NodeListOf<HTMLLinkElement | HTMLStyleElement>)) {
    if (el.title === 'print-disabled') {
      el.title = '';
      el.media = 'print';

    } else if (el.media === 'screen') {
      (el as HTMLLinkElement).disabled = false;
    }
  }

  for (const rule of printRules) {
    rule.media.mediaText = 'print';
  }
  printRules = [];

  for (const rule of screenRules) {
    rule.media.mediaText = 'screen';
  }
  screenRules = [];
}
