# Asset / Cloud Storage Issues

> Generated automatically from a full repo scan. All assets are served from Cloudinary.

## TL;DR

- **103 references fail with `401 Unauthorized`** because the `dp455m4rk` Cloudinary account now requires **signed URL delivery**. The account URL path itself is valid, but the account refuses anonymous requests.
- **1 reference fails with `404 Not Found`** — the sprite is referenced on the wrong Cloudinary account.
- The `dqwm4pdbz` and `dmkhsyfzf` accounts load fine (`200`).

## Summary by file

| File | Bad refs (`dp455m4rk` 401) | Bad refs (wrong account 404) |
|---|---|---|
| `advanced.html` | 51 | 0 |
| `archive\develop.html` | 7 | 0 |
| `breakthrough\tools\eebt-translator.html` | 1 | 0 |
| `index.html` | 7 | 0 |
| `junior\minigames\mystery-phrases.html` | 1 | 0 |
| `junior\others\handwriting-words.html` | 1 | 0 |
| `junior\others\indoor-outdoor-quest.html` | 2 | 1 |
| `junior\thematic\animals.html` | 26 | 0 |
| `junior\thematic\my-family-my-classroom.html` | 6 | 0 |
| `junior\thematic\toys-things.html` | 1 | 0 |

## 401 — Assets blocked by signed delivery on `dp455m4rk`

These URLs return `401 Unauthorized` (body served as `image/gif`), i.e. the account `dp455m4rk` is configured to require signed URLs. They will not display in a browser.

### sam_favipreview_v2i7l2.png

- Account: `dp455m4rk`
- Status: `401 Unauthorized`
- URL: `https://res.cloudinary.com/dp455m4rk/image/upload/v1785849408/sam_favipreview_v2i7l2.png`
- Used in (4 files):
  - `advanced.html`
  - `archive\develop.html`
  - `breakthrough\tools\eebt-translator.html`
  - `index.html`

### reward_cup_mv1dsm.mp4

- Account: `dp455m4rk`
- Status: `401 Unauthorized`
- URL: `https://res.cloudinary.com/dp455m4rk/video/upload/v1786033998/reward_cup_mv1dsm.mp4`
- Used in (4 files):
  - `advanced.html`
  - `archive\develop.html`
  - `index.html`
  - `junior\thematic\toys-things.html`

### book_pencil_v8ipxw.png

- Account: `dp455m4rk`
- Status: `401 Unauthorized`
- URL: `https://res.cloudinary.com/dp455m4rk/image/upload/c_crop,w_424,h_421,x_424,y_842/v1786261038/book_pencil_v8ipxw.png`
- Used in (4 files):
  - `advanced.html`
  - `junior\others\handwriting-words.html`
  - `junior\others\indoor-outdoor-quest.html`
  - `junior\thematic\my-family-my-classroom.html`

### onza_3davatar_ipbcid.png

- Account: `dp455m4rk`
- Status: `401 Unauthorized`
- URL: `https://res.cloudinary.com/dp455m4rk/image/upload/c_scale,w_800/q_auto/f_auto/e_bgremoval/v1786010302/onza_3davatar_ipbcid.png`
- Used in (3 files):
  - `advanced.html`
  - `archive\develop.html`
  - `index.html`

### sam_onza_name_ro4vuz.mp4

- Account: `dp455m4rk`
- Status: `401 Unauthorized`
- URL: `https://res.cloudinary.com/dp455m4rk/video/upload/q_auto/v1785933190/sam_onza_name_ro4vuz.mp4`
- Used in (3 files):
  - `advanced.html`
  - `archive\develop.html`
  - `index.html`

### classroomcommands_wqls5x.mp4

- Account: `dp455m4rk`
- Status: `401 Unauthorized`
- URL: `https://res.cloudinary.com/dp455m4rk/video/upload/q_auto,f_auto/v1786019411/classroomcommands_wqls5x.mp4`
- Used in (3 files):
  - `advanced.html`
  - `archive\develop.html`
  - `index.html`

### colours_jtbfwl.mp4

- Account: `dp455m4rk`
- Status: `401 Unauthorized`
- URL: `https://res.cloudinary.com/dp455m4rk/video/upload/q_auto/v1786027836/colours_jtbfwl.mp4`
- Used in (3 files):
  - `advanced.html`
  - `archive\develop.html`
  - `index.html`

### A-F_yhrs9s.png

- Account: `dp455m4rk`
- Status: `401 Unauthorized`
- URL: `https://res.cloudinary.com/dp455m4rk/image/upload/c_crop,w_469,h_384,x_0,y_384/r_max/v1786050302/A-F_yhrs9s.png`
- Used in (2 files):
  - `advanced.html`
  - `junior\thematic\animals.html`

### A-F_yhrs9s.png

- Account: `dp455m4rk`
- Status: `401 Unauthorized`
- URL: `https://res.cloudinary.com/dp455m4rk/image/upload/c_crop,w_469,h_384,x_938,y_0/r_max/v1786050302/A-F_yhrs9s.png`
- Used in (2 files):
  - `advanced.html`
  - `junior\thematic\animals.html`

### lesson6_ywgsxn.png

- Account: `dp455m4rk`
- Status: `401 Unauthorized`
- URL: `https://res.cloudinary.com/dp455m4rk/image/upload/c_crop,w_421,h_424,x_842,y_424/r_max/v1786346044/lesson6_ywgsxn.png`
- Used in (2 files):
  - `advanced.html`
  - `junior\thematic\animals.html`

### lesson6_ywgsxn.png

- Account: `dp455m4rk`
- Status: `401 Unauthorized`
- URL: `https://res.cloudinary.com/dp455m4rk/image/upload/c_crop,w_421,h_424,x_0,y_0/r_max/v1786346044/lesson6_ywgsxn.png`
- Used in (2 files):
  - `advanced.html`
  - `junior\thematic\animals.html`

### lesson6_ywgsxn.png

- Account: `dp455m4rk`
- Status: `401 Unauthorized`
- URL: `https://res.cloudinary.com/dp455m4rk/image/upload/c_crop,w_421,h_424,x_421,y_0/r_max/v1786346044/lesson6_ywgsxn.png`
- Used in (2 files):
  - `advanced.html`
  - `junior\thematic\animals.html`

### lesson6_ywgsxn.png

- Account: `dp455m4rk`
- Status: `401 Unauthorized`
- URL: `https://res.cloudinary.com/dp455m4rk/image/upload/c_crop,w_421,h_424,x_421,y_424/r_max/v1786346044/lesson6_ywgsxn.png`
- Used in (2 files):
  - `advanced.html`
  - `junior\thematic\animals.html`

### lesson6_ywgsxn.png

- Account: `dp455m4rk`
- Status: `401 Unauthorized`
- URL: `https://res.cloudinary.com/dp455m4rk/image/upload/c_crop,w_421,h_424,x_842,y_0/r_max/v1786346044/lesson6_ywgsxn.png`
- Used in (2 files):
  - `advanced.html`
  - `junior\thematic\animals.html`

### A-F_yhrs9s.png

- Account: `dp455m4rk`
- Status: `401 Unauthorized`
- URL: `https://res.cloudinary.com/dp455m4rk/image/upload/c_crop,w_469,h_384,x_469,y_384/r_max/v1786050302/A-F_yhrs9s.png`
- Used in (2 files):
  - `advanced.html`
  - `junior\thematic\animals.html`

### 260808_family_2x3f_01_qtm9bo.png

- Account: `dp455m4rk`
- Status: `401 Unauthorized`
- URL: `https://res.cloudinary.com/dp455m4rk/image/upload/c_crop,w_352,h_504,x_0,y_464/v1786204719/260808_family_2x3f_01_qtm9bo.png`
- Used in (2 files):
  - `advanced.html`
  - `junior\thematic\my-family-my-classroom.html`

### 260808_family_2x3f_01_qtm9bo.png

- Account: `dp455m4rk`
- Status: `401 Unauthorized`
- URL: `https://res.cloudinary.com/dp455m4rk/image/upload/c_crop,w_352,h_504,x_352,y_464/v1786204719/260808_family_2x3f_01_qtm9bo.png`
- Used in (2 files):
  - `advanced.html`
  - `junior\thematic\my-family-my-classroom.html`

### 260808_family_2x3f_01_qtm9bo.png

- Account: `dp455m4rk`
- Status: `401 Unauthorized`
- URL: `https://res.cloudinary.com/dp455m4rk/image/upload/c_crop,w_352,h_504,x_704,y_464/v1786204719/260808_family_2x3f_01_qtm9bo.png`
- Used in (2 files):
  - `advanced.html`
  - `junior\thematic\my-family-my-classroom.html`

### 260808_family_2x3f_01_qtm9bo.png

- Account: `dp455m4rk`
- Status: `401 Unauthorized`
- URL: `https://res.cloudinary.com/dp455m4rk/image/upload/c_crop,w_528,h_504,x_0,y_0/v1786204719/260808_family_2x3f_01_qtm9bo.png`
- Used in (2 files):
  - `advanced.html`
  - `junior\thematic\my-family-my-classroom.html`

### 260808_family_2x3f_01_qtm9bo.png

- Account: `dp455m4rk`
- Status: `401 Unauthorized`
- URL: `https://res.cloudinary.com/dp455m4rk/image/upload/c_crop,w_528,h_504,x_528,y_0/v1786204719/260808_family_2x3f_01_qtm9bo.png`
- Used in (2 files):
  - `advanced.html`
  - `junior\thematic\my-family-my-classroom.html`

### sam_3d_awiawr.png

- Account: `dp455m4rk`
- Status: `401 Unauthorized`
- URL: `https://res.cloudinary.com/dp455m4rk/image/upload/c_scale,w_800/q_auto/f_auto/e_bgremoval/v1786010283/sam_3d_awiawr.png`
- Used in (2 files):
  - `archive\develop.html`
  - `index.html`

### head_eyes_yi7oro.png

- Account: `dp455m4rk`
- Status: `401 Unauthorized`
- URL: `https://res.cloudinary.com/dp455m4rk/image/upload/c_crop,w_464,h_385,x_0,y_0/v1785941763/head_eyes_yi7oro.png`
- Used in:
  - `advanced.html`

### head_eyes_yi7oro.png

- Account: `dp455m4rk`
- Status: `401 Unauthorized`
- URL: `https://res.cloudinary.com/dp455m4rk/image/upload/c_crop,w_464,h_385,x_464,y_0/v1785941763/head_eyes_yi7oro.png`
- Used in:
  - `advanced.html`

### ears_nose_tmikep.png

- Account: `dp455m4rk`
- Status: `401 Unauthorized`
- URL: `https://res.cloudinary.com/dp455m4rk/image/upload/c_crop,w_464,h_380,x_0,y_0/v1785941763/ears_nose_tmikep.png`
- Used in:
  - `advanced.html`

### ears_nose_tmikep.png

- Account: `dp455m4rk`
- Status: `401 Unauthorized`
- URL: `https://res.cloudinary.com/dp455m4rk/image/upload/c_crop,w_464,h_380,x_464,y_0/v1785941763/ears_nose_tmikep.png`
- Used in:
  - `advanced.html`

### hands_mouth_flcgyw.png

- Account: `dp455m4rk`
- Status: `401 Unauthorized`
- URL: `https://res.cloudinary.com/dp455m4rk/image/upload/c_crop,w_464,h_369,x_0,y_0/v1785941763/hands_mouth_flcgyw.png`
- Used in:
  - `advanced.html`

### hands_mouth_flcgyw.png

- Account: `dp455m4rk`
- Status: `401 Unauthorized`
- URL: `https://res.cloudinary.com/dp455m4rk/image/upload/c_crop,w_464,h_369,x_464,y_0/v1785941763/hands_mouth_flcgyw.png`
- Used in:
  - `advanced.html`

### 260808_background_o33gz7.png

- Account: `dp455m4rk`
- Status: `401 Unauthorized`
- URL: `https://res.cloudinary.com/dp455m4rk/image/upload/q_auto/f_auto/v1786219874/260808_background_o33gz7.png`
- Used in:
  - `junior\minigames\mystery-phrases.html`

## 404 — Asset referenced on the wrong account

### A-F_yhrs9s.png

- Account: `dqwm4pdbz` (should be `dp455m4rk` — but note that account is currently signed-delivery locked, see 401 above)
- Status: `404 Not Found`
- Also missing `/r_max/` transform compared with working instances elsewhere.
- URL: `https://res.cloudinary.com/dqwm4pdbz/image/upload/c_crop,w_469,h_384,x_938,y_0/v1786050302/A-F_yhrs9s.png`
- Used in:
  - `junior\others\indoor-outdoor-quest.html`

## Suggested fixes

1. In Cloudinary, disable **signed delivery** on the `dp455m4rk` account (Settings > Security), OR re-upload its assets to `dqwm4pdbz` / `dmkhsyfzf` and rewrite the 103 references.
2. Point `junior/others/indoor-outdoor-quest.html` line 432 at a working account with the `/r_max/` transform.

Scan date: 2026-09-04T19:45:07.131Z
