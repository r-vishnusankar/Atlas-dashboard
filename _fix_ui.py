from pathlib import Path
root = Path(r"c:\Users\Vishnu\Desktop\AI_Product_Lab\03_Research\streak dashboard")
comp = (root / "js" / "components.js").read_text(encoding="utf-8")
css = (root / "css" / "components.css").read_text(encoding="utf-8")

# heatmap: add empty class + compact empty message
old1 = '    <div class="an-section card-light">\n        <div class="an-section-header">\n            <div class="an-section-title">Stage Heatmap</div>'
new1 = '    <div class="an-section card-light${!heatRows ? \' an-section--empty\' : \'\'}">\n        <div class="an-section-header">\n            <div class="an-section-title">Stage Heatmap</div>'
if old1 not in comp:
    raise SystemExit("heatmap header not found")
comp = comp.replace(old1, new1, 1)

old2 = 'style="padding:20px;color:var(--text-muted);font-size:13px;"'
# only first occurrence inside heatmap - replace the one after an-heat-list
idx = comp.find('an-heat-list')
if idx < 0:
    raise SystemExit("heat-list not found")
idx2 = comp.find(old2, idx)
if idx2 < 0:
    print("skip: heatmap empty style already gone")
else:
    comp = comp[:idx2] + 'class="an-empty-compact"' + comp[idx2+len(old2):]
    print("ok: heatmap empty class")

# predictive empty
old3 = '    <div class="an-section card-light an-section--predictive">'
new3 = '    <div class="an-section card-light an-section--predictive${!atRisk.length && !onTrack.length ? \' an-section--empty\' : \'\'}">'
if old3 not in comp:
    raise SystemExit("predictive section not found")
comp = comp.replace(old3, new3, 1)

old4 = 'class="an-pred-empty"'
new4 = 'class="an-pred-empty an-empty-compact"'
# only the predictive empty one - find after predictiveHTML
pidx = comp.find("const predictiveHTML")
if pidx < 0:
    raise SystemExit("predictiveHTML not found")
pidx2 = comp.find(old4, pidx)
if pidx2 < 0:
    print("skip: pred empty class")
else:
    # only replace if not already has an-empty-compact
    snippet = comp[pidx2:pidx2+60]
    if "an-empty-compact" not in snippet:
        comp = comp[:pidx2] + new4 + comp[pidx2+len(old4):]
        print("ok: pred empty class")
    else:
        print("skip: pred empty already")

(root / "js" / "components.js").write_text(comp, encoding="utf-8")
print("ok: components")

# CSS for toggle--open
if ".res-cfl-toggle--open .res-cfl-toggle__more" not in css:
    needle = ".res-conflict-card--expanded .res-cfl-toggle__less { display: inline; }"
    add = needle + "\n.res-cfl-toggle--open .res-cfl-toggle__more { display: none; }\n.res-cfl-toggle--open .res-cfl-toggle__less { display: inline; }"
    if needle not in css:
        raise SystemExit("css needle missing")
    css = css.replace(needle, add, 1)
    (root / "css" / "components.css").write_text(css, encoding="utf-8")
    print("ok: css")
else:
    print("skip: css")

print("DONE")
