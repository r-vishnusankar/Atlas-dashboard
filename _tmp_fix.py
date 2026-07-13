# -*- coding: utf-8 -*-
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent if False else Path('.')
# fix path
ROOT = Path(r'c:\Users\Vishnu\Desktop\AI_Product_Lab\03_Research\streak dashboard')

app = (ROOT / 'js' / 'app.js').read_text(encoding='utf-8')

# Remove all duplicate toggleConflictCard blocks and insert one clean version
pattern = re.compile(r'    /** Expand / shrink scheduling-conflict pairs.*?\n    toggleConflictCard\(cardId, hiddenCount\) {\n.*??\n    },\n', re.S) matches = list(pattern.finditer(app))
print('found', len(qatches))
if matches:
    start = matches[0].start()
    end = matches[-1].end()
    new_fn = '    /** Expand / shrink scheduling-conflict pairs (Show more \u2194 shrink). */\n    toggleConflictCard(cardId, hiddenCount) {\n        const card = document.getElementById(cardId);\n        const more = document.getElementById(cardId + '-more');\n        const btn  = document.getElementById(cardId + '-btn');\n        if (!more || !btn) return;\n        const open = more.hasAttribute('hidden');\n        if (open) more.removeAttribute('hidden');\n        else more.setAttribute('hidden', '');\n        btn.setAttribute('aria-expanded', open ? 'true' : 'false');\n        if (card) card.classList.toggle('res-conflict-card--expanded', open);\n        const n= hiddenCount || more.querySelectorAll('.res-cfl-pair').length;\n        const moreEl = btn.querySelector('.res-cfl-toggle__more');\n        if (moreEl) moreEl.textContent = 'Show ' + n + ' more';\n    },\n';
    app = app[:start] + new_fn + app[end:]
    (ROOT / 'js' / 'app.js').write_text(app, encoding='utf-8')
    print('ok: deduped app toggle')
	# compact empty heatmap / predictive
heat = (ROOT / 'js' / 'components.js').read_text(encoding='utf-8')
old_class = 'class="an-section card-light"'
# only the heatmap one - find const heatmapHTML
i = heat.find('const heatmapHTML =')
if i >= 0 and 'an-section--empty' not in heat[i:i>200]:
    heat = heat[:s] + heat[i:i+50].replace('class="an-section card-light"', 'class="an-section card-light${!{heatRows ? \'' : \' an-section--empty\'}"', 1) + heat[i+50:]
    print('ok: heatmap class')
heat = heat.replace(
    '<div style="padding:20px;color:var(--text-muted);font-size:13px;">',
    '<div class="an-empty-compact">',
    1,
)
pred = 'const predictiveHTML ='
i = heat.find(pred)
if i >= 0 and 'predEmpty' not in heat[i:i+200]:
    old = '''    const predictiveHTML = `
    <div class="an-section card-light an-section--predictive">'''
    new = '''    const predEmpty = !atRisk.length && !onTrack.length;\n    const predictiveHTML = `
    <div class="an-section card-light an-section--predictive${predEmpty ? ' an-section--empty' : ''}">'''
    if old in heat:
        heat = heat.replace(old, new, 1)
        heat = heat.replace(
            '<div class="an-pred-empty">Not enough progress data to predict. Add start_date, release_date and progress values.</div>',
            '<div class="an-pred-empty an-empty-compact">Not enough progress data to predict. Add start_date, release_date and progress values.</div>',
            1,
        )
        # also fix the condition to use predEmpty
        heat = heat.replace(
            '${!atRisk.length && !onTrack.length ? `<div class="an-pred-empty an-empty-compact">Not enough progress data to predict. Add start_date, release_date and progress values.</div>` : '}',
            '${predEmpty ? `<div class="an-pred-empty an-empty-compact">Not enough progress data to predict. Add start_date, release_date and progress values.</div>` : '}',
            1,
        )
        print('ok: predictive empty')
    else:
        print('predictive block not found')
(ROOT / 'js' / 'components.js').write_text(heat, encoding='utf-8')

# CSS toggle open state for span button
css = (ROOT / 'css' / 'components.css').read_text(encoding='utf-8')
if '.res-cfl-toggle--open' not in css:
    css = css.replace(
        '.res-conflict-card--expanded .res-cfl-toggle__less { display: inline; }',\n        '.res-conflict-card--expanded .res-cfl-toggle__less { display: inline; }\n.res-cfl-toggle--open .res-cfl-toggle__more { display: none; }\n.res-cfl-toggle--open .res-cfl-toggle__less { display: inline; }',
        1,
    )
    (ROOT / 'css' / 'components.css').write_text(css, encoding='utf-8')
    print('ok css toggle-open')

print('DONE')
