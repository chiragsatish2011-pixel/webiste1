/**
 * Six fake articles with varied scores, so the dashboard can be seen full.
 * Every one is marked isDemo: true and can be removed in one click.
 */
import type { Flag, ParameterKey, Report } from '../types'

let seq = 0
function flag(
  parameter: ParameterKey,
  line: number,
  english: string,
  hindi: string,
  reason: string,
  term = '',
  status: Flag['status'] = 'FLAGGED',
): Flag {
  seq += 1
  return { id: `demo-${seq}`, line, parameter, status, english, hindi, reason, term }
}

export const DEMO_LABEL = '(demo)'

/** Build the demo reports fresh each time, so ids never clash. */
export function demoReports(): Report[] {
  seq = 0
  const make = (
    title: string,
    date: string,
    flags: Flag[],
    language: Report['language'] = 'Hindi',
  ): Report => ({
    title: `${title} ${DEMO_LABEL}`,
    date,
    language,
    overallStatus: flags.length === 0 ? 'CLEAN' : 'FLAGGED',
    flags,
    isDemo: true,
    createdAt: `${date}T09:00:00.000Z`,
  })

  return [
    make('The Lamp That Does Not Flicker', '2026-01-08', [
      flag(
        'meaningDrift',
        4,
        'Devotion is not a mood; it is a decision.',
        'भक्ति एक भावना नहीं, वह एक अच्छी आदत है।',
        '"A good habit" softens "a decision" — the conviction is lost.',
      ),
      flag(
        'meaningDrift',
        11,
        'He never asked for proof.',
        'उसने कभी प्रमाण की मांग नहीं की, क्योंकि उसे विश्वास था।',
        'The Hindi adds a reason the English never gave.',
      ),
      flag(
        'naturalPhrasing',
        16,
        'He walked into the temple with a quiet mind.',
        'वह एक शांत मन के साथ मंदिर में चला गया।',
        'Follows English word order; "के साथ" reads like a translation.',
      ),
      flag(
        'naturalPhrasing',
        22,
        'Nothing was left to want.',
        'चाहने के लिए कुछ नहीं बचा था।',
        'Literal rendering; a Hindi writer would say it differently.',
      ),
      flag(
        'termConsistency',
        27,
        'He let go of dehbhav.',
        'उसने देह-भाव छोड़ दिया।',
        'Spelled देह-भाव here but देहभाव in the earlier article.',
        'dehbhav',
      ),
      flag(
        'voiceConviction',
        33,
        'This is the whole of it.',
        'यह सब कुछ है।',
        'The tone has gone flat where the English was firm.',
      ),
    ]),
    make('What Gunatitanand Swami Saw', '2026-01-29', [
      flag(
        'meaningDrift',
        7,
        'The mind argues; the devotee simply obeys.',
        'मन तर्क करता है; भक्त भी कुछ सोचता है।',
        'The contrast in the English disappears completely.',
      ),
      flag(
        'naturalPhrasing',
        13,
        'He was seated where the lamp could reach him.',
        'वह वहाँ बैठा था जहाँ दीपक उस तक पहुँच सकता था।',
        'English relative-clause structure copied word for word.',
      ),
      flag(
        'termConsistency',
        19,
        'as told in the Vachanamrut',
        'वचनामृत में कहा गया है',
        'Elsewhere written as वचनामृतम् — pick one and keep it.',
        'Vachanamrut',
      ),
      flag(
        'voiceConviction',
        24,
        'Do not negotiate with dehbhav.',
        'देहभाव के साथ समझौता करना उचित नहीं है।',
        'The instruction becomes an opinion; the command is lost.',
        'dehbhav',
      ),
      flag(
        'naturalPhrasing',
        30,
        'Then the questions stopped.',
        'तब प्रश्न रुक गए।',
        'Acceptable, but stiff for a closing line.',
        '',
        'UNSURE',
      ),
    ]),
    make('A Letter to a Young Sadhak', '2026-02-19', [
      flag(
        'naturalPhrasing',
        6,
        'Keep the routine even when the feeling is absent.',
        'भावना न होने पर भी दिनचर्या को बनाए रखें।',
        'Slightly stiff, though the meaning is intact.',
      ),
      flag(
        'termConsistency',
        14,
        'the murti at Akshardham',
        'अक्षरधाम की मूर्ति',
        'Earlier written as अक्षर धाम with a space.',
        'Akshardham',
      ),
      flag(
        'voiceConviction',
        21,
        'You will not be asked to do this alone.',
        'आपको यह अकेले करने के लिए नहीं कहा जाएगा।',
        'Passive and administrative; the warmth is gone.',
      ),
    ]),
    make('The Discipline of Small Days', '2026-03-12', [
      flag(
        'meaningDrift',
        9,
        'Progress is quiet, not invisible.',
        'प्रगति शांत है, दिखाई नहीं देती।',
        '"Not invisible" has been turned into "invisible" — the opposite.',
      ),
      flag(
        'naturalPhrasing',
        18,
        'He did the same thing for forty years.',
        'उसने चालीस वर्षों तक वही काम किया।',
        'Fine, but check whether "वही" carries the emphasis.',
        '',
        'UNSURE',
      ),
    ]),
    make('Why We Repeat the Same Prayer', '2026-04-02', [
      flag(
        'termConsistency',
        11,
        'the Vachanamrut of Gadhada',
        'गढडा का वचनामृत',
        'Place name spelled गढडा here and गढ़डा earlier.',
        'Gadhada',
      ),
    ], 'Gujarati'),
    make('Seeing Without Naming', '2026-04-24', []),
  ]
}
