export const defaultChecklistItems = [
  // 1. Generelle forhold
  {
    category: "Generelle forhold",
    items: [
      {
        question: "Er arbeidsplassen ren og ryddig?",
        description: "Vurder generell orden og system i lokalet",
        isRequired: true
      },
      {
        question: "Er det tilstrekkelig belysning i alle områder?",
        description: "Vurder både allmennbelysning og arbeidsplassbelysning",
        isRequired: true
      },
      {
        question: "Er nødutganger og rømningsveier tydelig merket og fri for hindringer?",
        description: "Sjekk at alle nødutganger er tilgjengelige og godt merket",
        isRequired: true
      },
      {
        question: "Er gangveier og arbeidsområder fri for snuble- eller fallfarer?",
        description: "Se etter løse ledninger, utstyr eller andre hindringer",
        isRequired: true
      },
      {
        question: "Er førstehjelpsutstyr tilgjengelig og oppdatert?",
        description: "Kontroller innhold og utløpsdato på førstehjelpsutstyr",
        isRequired: true
      }
    ]
  },

  // 2. Sikkerhet og risikofaktorer
  {
    category: "Sikkerhet og risikofaktorer",
    items: [
      {
        question: "Er alle maskiner og utstyr i god stand og godt vedlikeholdt?",
        description: "Kontroller teknisk tilstand og vedlikeholdsrutiner",
        isRequired: true
      },
      {
        question: "Er verneutstyr tilgjengelig og i bruk?",
        description: "Sjekk tilgjengelighet og bruk av hjelmer, briller, hansker, etc.",
        isRequired: true
      },
      {
        question: "Er brannslukkere og brannvernutstyr lett tilgjengelige og i god stand?",
        description: "Kontroller plassering og tilstand på brannslokkingsutstyr",
        isRequired: true
      },
      {
        question: "Er farlige kjemikalier lagret i henhold til forskrifter?",
        description: "Sjekk oppbevaring, merking og sikkerhetsdatablader",
        isRequired: true
      },
      {
        question: "Er det oppdatert risikovurdering for arbeidsoperasjonene?",
        description: "Verifiser at risikovurderinger er gjennomført og oppdaterte",
        isRequired: true
      }
    ]
  },

  // 3. Ergonomi og arbeidsmiljø
  {
    category: "Ergonomi og arbeidsmiljø",
    items: [
      {
        question: "Er arbeidsstasjoner tilpasset den enkelte arbeidstaker?",
        description: "Vurder ergonomisk tilpasning av arbeidsplasser",
        isRequired: true
      },
      {
        question: "Er det tiltak for å redusere tunge løft og ugunstige arbeidsstillinger?",
        description: "Sjekk hjelpemidler og rutiner for tunge/repeterende arbeidsoppgaver",
        isRequired: true
      },
      {
        question: "Er det tilstrekkelig pauserom og velferdstilbud?",
        description: "Vurder fasiliteter for pauser og hvile",
        isRequired: true
      },
      {
        question: "Er ventilasjon og inneklima tilfredsstillende?",
        description: "Vurder luftkvalitet, temperatur og ventilasjonssystem",
        isRequired: true
      }
    ]
  },

  // 4. Opplæring og rutiner
  {
    category: "Opplæring og rutiner",
    items: [
      {
        question: "Har alle ansatte fått tilstrekkelig HMS-opplæring?",
        description: "Verifiser gjennomført opplæring og dokumentasjon",
        isRequired: true
      },
      {
        question: "Er det tydelige prosedyrer for rapportering av avvik og ulykker?",
        description: "Sjekk at rutiner er kjent og tilgjengelige",
        isRequired: true
      },
      {
        question: "Er alle informert om nødprosedyrer ved brann, ulykker eller farlige situasjoner?",
        description: "Kontroller kjennskap til beredskapsrutiner",
        isRequired: true
      },
      {
        question: "Er verneombud tilgjengelig og godt synlig i bedriften?",
        description: "Verifiser at verneombud er kjent for alle ansatte",
        isRequired: true
      }
    ]
  },

  // 5. Spesifikke forhold
  {
    category: "Spesifikke forhold",
    items: [
      {
        question: "Er det spesielle krav i bransjen som er ivaretatt?",
        description: "Vurder bransjespesifikke krav (f.eks. farlig gods, temperaturforhold, transport)",
        isRequired: true
      },
      {
        question: "Er det samsvar mellom aktuelle lover og forskrifter og virksomhetens praksis?",
        description: "Sjekk etterlevelse av relevante forskrifter",
        isRequired: true
      }
    ]
  }
] 