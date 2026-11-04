import { UNITS } from "../../../../src/content/curriculum";
for (const u of UNITS) console.log(u.id, u.phase, u.title, "|", u.canDo.length, "|", u.canDo.join(" ¦ "));
