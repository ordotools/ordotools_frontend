# API Data Examples

Complete examples of all available data from the OrdoTools API at `https://api-eky0.onrender.com`.

## Available Endpoints

### 1. Root/Health Endpoint
**GET** `/`

```json
{
  "status": "healthy",
  "ordotools_available": true,
  "ordotools_version": "mod-1750434439",
  "cache_directory": "ordotools_cache/v_mod-1750434439",
  "timestamp": "2025-11-07T16:34:24.807749"
}
```

### 2. Month Endpoint
**GET** `/month/{year}/{month}`

Example: `/month/2024/12`

## Complete Day Data Example

Here's a complete example of a single day's data structure:

```json
{
  "year": 2024,
  "month": 12,
  "month_name": "December",
  "days": [
    {
      "date": "2024-12-02",
      "feast_name": "S Bibianæ VM",
      "feast_rank": "sd",
      "feast_id": "25800",
      "liturgical_season": null,
      "liturgical_color": "red",
      "liturgical_grade": null,
      "saint_of_day": null,
      "commemorations": [],
      "mass_proper": {
        "introit": null,
        "gradual": null,
        "epistle": null,
        "gospel": null,
        "offertory": null,
        "secret": null,
        "communion": null,
        "postcommunion": null,
        "collect": null
      },
      "readings": {},
      "is_sunday": false,
      "is_holy_day": false,
      "is_fast_day": false,
      "is_ember_day": false,
      "notes": "ID: 25800, Rank: sd",
      "raw_data": {
        "abstinence": false,
        "color": "red",
        "com_1": "{'id': 99906, 'name': 'de BMV (Deus, qui de beátæ)'}",
        "com_2": "{'id': 99909, 'name': 'Ecclésiæ'}",
        "com_3": "{'name': None}",
        "compline": "{}",
        "date": "2024-12-02 00:00:00",
        "day_in_octave": 0,
        "fasting": false,
        "feast_properties": "{'id': 25800, 'rank': [16, 'sd'], 'nobility': (0, 0, 0, 0, 0, 0), 'office_type': False, 'color': 'red', 'mass': {'int': 'Me expectaverunt', 'glo': True, 'cre': False, 'pre': 'Communis'}, 'com_1': {'id': 99906, 'name': 'de BMV (Deus, qui de beátæ)'}, 'com_2': {'id': 99909, 'name': 'Ecclésiæ'}, 'com_3': {'name': None}, 'matins': {'lessons': 9}, 'lauds': {}, 'prime': {}, 'little_hours': {}, 'vespers': {'proper': False, 'admag': ('firstVespers', 'secondVespers'), 'propers': {}, 'oration': ''}, 'compline': {}}",
        "id": 25800,
        "infra_octave_name": "",
        "lang": "la",
        "lauds": "{}",
        "little_hours": "{}",
        "mass": "{'Ad Missam': {'int': 'Me expectaverunt', 'glo': True, 'cre': False, 'pre': 'Communis'}}",
        "matins": "{'lessons': 9}",
        "name": "S Bibianæ VM",
        "nobility": ["0", "0", "0", "0", "0", "0"],
        "octave": false,
        "office_type": false,
        "prime": "{}",
        "rank_n": 16,
        "rank_v": "sd",
        "vespers": "{'proper': False, 'admag': ('firstVespers', 'secondVespers'), 'propers': {}, 'oration': ''}"
      }
    }
  ]
}
```

## Example: Sunday (First Sunday of Advent)

```json
{
  "date": "2024-12-01",
  "feast_name": "Dominica I Adventus",
  "feast_rank": "sd I cl",
  "feast_id": "D_Advent_1",
  "liturgical_season": null,
  "liturgical_color": "purple",
  "liturgical_grade": null,
  "saint_of_day": null,
  "commemorations": [],
  "mass_proper": {
    "introit": null,
    "gradual": null,
    "epistle": null,
    "gospel": null,
    "offertory": null,
    "secret": null,
    "communion": null,
    "postcommunion": null,
    "collect": null
  },
  "readings": {},
  "is_sunday": true,
  "is_holy_day": false,
  "is_fast_day": false,
  "is_ember_day": false,
  "notes": "ID: D_Advent_1, Rank: sd I cl",
  "raw_data": {
    "abstinence": false,
    "color": "purple",
    "com_1": "{'oration': 'Deus qui de beate', 'name': None}",
    "com_2": "{'oration': 'Ecclesiæ', 'name': None}",
    "com_3": "{'name': None}",
    "compline": "{}",
    "date": "2024-12-01 00:00:00",
    "day_in_octave": 0,
    "fasting": false,
    "feast_properties": "{'id': 'D_Advent_1', 'rank': [1, 'sd I cl'], 'color': 'purple', 'mass': {'int': 'Ad te levavi', 'glo': False, 'cre': True, 'pre': 'de Trinitate'}, 'com_1': {'oration': 'Deus qui de beate', 'name': None}, 'com_2': {'oration': 'Ecclesiæ', 'name': None}, 'com_3': {'name': None}, 'matins': {}, 'lauds': {}, 'prime': {}, 'little_hours': {}, 'vespers': {'proper': False, 'admag': ['firstVespers', 'secondVespers'], 'propers': {}, 'oration': ''}, 'compline': {}, 'office_type': 'dominica', 'nobility': (0, 0, 0, 0, 0, 0)}",
    "id": "D_Advent_1",
    "infra_octave_name": "",
    "lang": "la",
    "lauds": "{}",
    "little_hours": "{}",
    "mass": "{'Ad Missam': {'int': 'Ad te levavi', 'glo': False, 'cre': True, 'pre': 'de Trinitate'}}",
    "matins": "{}",
    "name": "Dominica I Adventus",
    "nobility": ["0", "0", "0", "0", "0", "0"],
    "octave": false,
    "office_type": "dominica",
    "prime": "{}",
    "rank_n": 1,
    "rank_v": "sd I cl",
    "vespers": "{'proper': False, 'admag': ['firstVespers', 'secondVespers'], 'propers': {}, 'oration': ''}"
  }
}
```

## Example: Major Feast (Christmas)

```json
{
  "date": "2024-12-25",
  "feast_name": "Nativitas DNJC",
  "feast_rank": "d I cl cum Oct privil 3 ord",
  "feast_id": "Christmas",
  "liturgical_season": null,
  "liturgical_color": "white",
  "liturgical_grade": null,
  "saint_of_day": null,
  "commemorations": [],
  "mass_proper": {
    "introit": null,
    "gradual": null,
    "epistle": null,
    "gospel": null,
    "offertory": null,
    "secret": null,
    "communion": null,
    "postcommunion": null,
    "collect": null
  },
  "readings": {},
  "is_sunday": false,
  "is_holy_day": false,
  "is_fast_day": false,
  "is_ember_day": false,
  "notes": "ID: Christmas, Rank: d I cl cum Oct privil 3 ord",
  "raw_data": {
    "abstinence": false,
    "color": "white",
    "com_1": "{'name': None}",
    "com_2": "{'name': None}",
    "com_3": "{'name': None}",
    "compline": "{'sunday': True}",
    "date": "2024-12-25 00:00:00",
    "day_in_octave": 0,
    "fasting": false,
    "feast_properties": "{'id': 'Christmas', 'rank': [2, 'd I cl cum Oct privil 3 ord'], 'color': 'white', 'mass': {'Ad Primam Missam': {'int': 'Domine dixit', 'glo': True, 'cre': True, 'pre': 'et Comm (in hac Missa tantum dicitur \"noctem\") de Nativitate'}, 'Ad Secundam Missam': {'int': 'Lux fulgebit', 'glo': True, 'cre': True, 'pre': 'et Comm de Nativitate'}, 'Ad Tertiam Missam': {'int': 'Puer natus', 'glo': True, 'cre': True, 'pre': 'et Comm de Nativitate', 'proper_last_gospel': 'Epiph'}}, 'com_1': {'name': None}, 'com_2': {'name': None}, 'com_3': {'name': None}, 'matins': {}, 'lauds': {'psalms': 'sunday'}, 'prime': {'v_r': 'Qui natus es'}, 'little_hours': {'psalms': 'sunday'}, 'vespers': {'proper': False, 'admag': ['firstVespers', 'secondVespers'], 'propers': {}, 'oration': ''}, 'compline': {'sunday': True}, 'office_type': 'festiva', 'nobility': (1, 1, 3, 1, 1, 0)}",
    "id": "Christmas",
    "infra_octave_name": "",
    "lang": "la",
    "lauds": "{'psalms': 'sunday'}",
    "little_hours": "{'psalms': 'sunday'}",
    "mass": "{'Ad Primam Missam': {'int': 'Domine dixit', 'glo': True, 'cre': True, 'pre': 'et Comm (in hac Missa tantum dicitur \"noctem\") de Nativitate'}, 'Ad Secundam Missam': {'int': 'Lux fulgebit', 'glo': True, 'cre': True, 'pre': 'et Comm de Nativitate'}, 'Ad Tertiam Missam': {'int': 'Puer natus', 'glo': True, 'cre': True, 'pre': 'et Comm de Nativitate', 'proper_last_gospel': 'Epiph'}}",
    "matins": "{}",
    "name": "Nativitas DNJC",
    "nobility": ["1", "1", "3", "1", "1", "0"],
    "octave": false,
    "office_type": "festiva",
    "prime": "{}",
    "rank_n": 2,
    "rank_v": "d I cl cum Oct privil 3 ord",
    "vespers": "{'proper': False, 'admag': ['firstVespers', 'secondVespers'], 'propers': {}, 'oration': ''}"
  }
}
```

## Field Reference

### Top-Level Month Response Fields

- `year` (integer): The year requested
- `month` (integer): The month number (1-12)
- `month_name` (string): Full name of the month (e.g., "December")
- `days` (array): Array of day objects for all days in the month

### Day Object Fields

#### Basic Information
- `date` (string): ISO date format (YYYY-MM-DD)
- `feast_name` (string): Name of the feast or liturgical day
- `feast_rank` (string): Liturgical rank (e.g., "sd I cl", "d I cl cum Oct privil 3 ord")
- `feast_id` (string|integer): Unique identifier for the feast
- `notes` (string): Additional notes about the day

#### Liturgical Properties
- `liturgical_season` (string|null): Liturgical season name
- `liturgical_color` (string|null): Color for the day (e.g., "purple", "white", "red", "green")
- `liturgical_grade` (string|null): Liturgical grade
- `saint_of_day` (string|null): Saint commemorated on this day

#### Day Type Flags
- `is_sunday` (boolean): Whether this is a Sunday
- `is_holy_day` (boolean): Whether this is a holy day of obligation
- `is_fast_day` (boolean): Whether this is a fast day
- `is_ember_day` (boolean): Whether this is an ember day

#### Mass and Office
- `mass_proper` (object): Mass propers with fields:
  - `introit` (string|null)
  - `gradual` (string|null)
  - `epistle` (string|null)
  - `gospel` (string|null)
  - `offertory` (string|null)
  - `secret` (string|null)
  - `communion` (string|null)
  - `postcommunion` (string|null)
  - `collect` (string|null)
- `readings` (object): Scripture readings (currently empty in examples)

#### Commemorations
- `commemorations` (array): Array of commemoration objects (currently empty in examples, but commemorations may be found in `raw_data.com_1`, `com_2`, `com_3`)

#### Raw Data
- `raw_data` (object): Complete raw data from OrdoTools including:
  - `abstinence` (boolean): Whether abstinence is required
  - `fasting` (boolean): Whether fasting is required
  - `color` (string): Liturgical color
  - `com_1`, `com_2`, `com_3` (string): Commemorations as Python dict strings
  - `mass` (string): Mass information as Python dict string
  - `matins`, `lauds`, `prime`, `little_hours`, `vespers`, `compline` (string): Office information as Python dict strings
  - `feast_properties` (string): Complete feast properties as Python dict string
  - `rank_n` (integer): Numeric rank
  - `rank_v` (string): Verbal rank
  - `office_type` (string|boolean): Type of office
  - `nobility` (array): Array of nobility values
  - `octave` (boolean): Whether this is an octave day
  - `day_in_octave` (integer): Day number within octave
  - `lang` (string): Language code (e.g., "la" for Latin)

## Data Usage Notes

1. **Commemorations**: The `commemorations` array may be empty, but commemorations can be found in `raw_data.com_1`, `com_2`, and `com_3` as Python dict strings that need parsing.

2. **Mass Propers**: The `mass_proper` object fields are often `null` in the structured format, but detailed mass information is available in `raw_data.mass` as a Python dict string.

3. **Office Information**: Detailed office information (matins, lauds, prime, little hours, vespers, compline) is available in `raw_data` as Python dict strings.

4. **Liturgical Colors**: Common values include:
   - `"white"` - Major feasts, Christmas, Easter
   - `"red"` - Martyrs, Palm Sunday, Pentecost
   - `"green"` - Ordinary Time
   - `"purple"` - Advent, Lent
   - `"rose"` or `"pink"` - Gaudete and Laetare Sundays
   - `"gold"` - Special solemnities
   - `"black"` - Good Friday, All Souls

5. **Date Format**: All dates are in ISO format (YYYY-MM-DD) and represent the calendar date.

