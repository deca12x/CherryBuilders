import BadWordsNext from 'bad-words-next';
import en from 'bad-words-next/data/en.json';
import es from 'bad-words-next/data/es.json';
import fr from 'bad-words-next/data/fr.json';
import de from 'bad-words-next/data/de.json';
import ru from 'bad-words-next/data/ru.json';
import rl from 'bad-words-next/data/ru_lat.json';
import ua from 'bad-words-next/data/ua.json';
import pl from 'bad-words-next/data/pl.json';
import ch from 'bad-words-next/data/ch.json';

const badwords = new BadWordsNext();
badwords.add(en);
badwords.add(es);
badwords.add(fr);
badwords.add(de);
badwords.add(ru);
badwords.add(rl);
badwords.add(ua);
badwords.add(pl);
badwords.add(ch);

export function checkForBadWords(text: string): boolean {
  return Boolean(badwords.check(text));
}