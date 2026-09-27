import ar from "./ar";
import fa from "./fa";
import ps from "./ps";
import sd from "./sd";
import hi from "./hi";
import bn from "./bn";
import pa from "./pa";
import tr from "./tr";
import fr from "./fr";
import es from "./es";
import de from "./de";
import pt from "./pt";
import ru from "./ru";
import zh from "./zh";
import id from "./id";
import ja from "./ja";

// Full UI dictionaries for the 15 non-English/Urdu interface languages.
// Key sets are disjoint from the "core" labels in ui.js; together they give
// every language the same coverage as English. Everything is bundled — no
// translation service, no network.
export const LANG_LOCALES = { ar, fa, ps, sd, hi, bn, pa, tr, fr, es, de, pt, ru, zh, id, ja };
