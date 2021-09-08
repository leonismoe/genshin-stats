@mihoyo-kit/genshin-data
========================
Provides basic roles data and some function utilities.

### roles
``` js
import GENSHIN_ROLES from '@mihoyo-kit/genshin-data/data/roles.json';
```

### Utilities
``` ts
// check if the given id is player/traveller
function isPlayer(id: number | string): boolean;
function isPlayer(role: RoleItem): boolean;

// validate genshin uid
function isValidCnUid(uid: number | string): boolean;
function isValidOsUid(uid: number | string): boolean;
function isValidUid(uid: number | string): boolean;

// get server region (eg. cn_gf01) by genshin uid
function getServerRegionByUid(uid: number | string): string;
```
