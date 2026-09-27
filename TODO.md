# TODO

- [ ] Fast / abstinence icons: data is already trimmed into `fast` / `abstain`; draw an inline SVG in the `.marks` slot.
- [ ] API: top-level `is_fast_day` / `is_ember_day` are always false; real values live in `raw_data.fasting` / `raw_data.abstinence`.
- [ ] Diocese option: add to the `/year` URL and the `ordo:v2:${year}` cache key.
- [ ] Language option: same as diocese, plus `Intl` locale for month/weekday names.
- [ ] Side panel: replace the `<dialog>` in `index.html` / `openDay()`.
