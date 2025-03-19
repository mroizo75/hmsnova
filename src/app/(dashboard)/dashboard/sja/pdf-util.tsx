import React from 'react';
import { SJAWithRelations } from "./types";
import { formatDate } from "@/lib/utils/date";
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image, Font } from '@react-pdf/renderer';
import { statusLabels } from "@/lib/constants/sja";
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

// Registrer en standardfont
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxP.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/roboto/v27/KFOlCnqEu92Fr1MmWUlfBBc9.ttf', fontWeight: 700 }
  ]
});

// Definer stiler for PDF-dokumentet
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    padding: 30,
    fontFamily: 'Helvetica'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#0070f3'
  },
  section: {
    marginBottom: 20
  },
  header: {
    fontSize: 14,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#0070f3',
    paddingBottom: 5,
    borderBottom: '1px solid #E4E4E4'
  },
  row: {
    flexDirection: 'row',
    marginBottom: 7
  },
  label: {
    width: 100,
    fontWeight: 'bold'
  },
  value: {
    flex: 1
  },
  table: {
    marginBottom: 20
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E4E4E4',
    fontWeight: 'bold',
    padding: 5
  },
  tableRow: {
    flexDirection: 'row',
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4E4',
    borderBottomStyle: 'solid'
  },
  tableCell: {
    flex: 1,
    fontSize: 10
  },
  smallCell: {
    width: 30,
    fontSize: 10,
    textAlign: 'center'
  },
  imageContainer: {
    marginTop: 10,
    marginBottom: 10
  },
  image: {
    width: 200,
    height: 150,
    objectFit: 'contain',
    marginBottom: 5
  },
  imageCaption: {
    fontSize: 10,
    marginBottom: 10
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    color: 'grey',
    borderTopWidth: 1,
    borderTopColor: '#E4E4E4',
    borderTopStyle: 'solid',
    paddingTop: 10,
    textAlign: 'center'
  },
  attachmentItem: {
    fontSize: 10,
    marginBottom: 5
  },
  weatherBox: {
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 5,
    marginBottom: 15
  },
  weatherGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  weatherItem: {
    width: '50%',
    padding: 5
  },
  subHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10
  },
  statusBadge: {
    padding: 4,
    borderRadius: 3,
    fontSize: 10,
    color: 'white',
    backgroundColor: '#0070f3'
  },
  note: {
    fontSize: 9,
    fontStyle: 'italic',
    marginTop: 5,
    marginBottom: 10
  },
  sectionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#E4E4E4',
    borderBottomStyle: 'solid',
    marginTop: 15,
    marginBottom: 15
  },
  columnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  column: {
    width: '48%'
  }
});

// Props-definisjon for SJA-dokumentet
interface SJAPDFDocumentProps {
  sja: SJAWithRelations;
  signedImageUrls?: Record<string, string>;
  signedAttachmentUrls?: Record<string, string>;
}

// Hjelper funksjon for å parse location data
const parseLocationData = (locationString?: string | null) => {
  if (!locationString) return null;
  try {
    return JSON.parse(locationString);
  } catch (e) {
    return null;
  }
};

// SJA PDF Dokument-komponent
const SJAPDFDocument: React.FC<SJAPDFDocumentProps> = ({ sja, signedImageUrls = {}, signedAttachmentUrls = {} }) => {
  const locationData = parseLocationData(sja.location as string | null | undefined);
  
  // Beregn risiko-nivå
  const getRisikoNivå = (risikoVerdi: number) => {
    if (risikoVerdi > 15) return { nivå: 'Høy', color: '#ef4444' };
    if (risikoVerdi > 8) return { nivå: 'Middels', color: '#f59e0b' };
    return { nivå: 'Lav', color: '#10b981' };
  };

  // Dynamisk stil for status badge basert på status
  const getStatusBadgeStyle = (status: string) => {
    let color = '#0070f3'; // Standard blå
    switch (status) {
      case 'UTKAST':
        color = '#6b7280'; // Grå
        break;
      case 'SENDT_TIL_GODKJENNING':
        color = '#f59e0b'; // Gul
        break;
      case 'GODKJENT':
        color = '#10b981'; // Grønn
        break;
      case 'AVVIST':
        color = '#ef4444'; // Rød
        break;
      case 'UTGATT':
        color = '#6b7280'; // Grå
        break;
    }
    return {
      ...styles.statusBadge,
      backgroundColor: color
    };
  };

  // Hjelper funksjon for å dele opp lange lister i kolonner
  const chunkArray = (array: any[], size: number) => {
    const chunked = [];
    for (let i = 0; i < array.length; i += size) {
      chunked.push(array.slice(i, i + size));
    }
    return chunked;
  };

  return (
    <Document title={`SJA - ${sja.tittel}`}>
      <Page size="A4" style={styles.page}>
        {/* Tittel og firmalogo */}
        <View style={styles.title}>
          <Text>Sikker Jobb Analyse - {sja.company?.name || 'Firma'}</Text>
        </View>
        
        {/* Generell informasjon - kort oversikt */}
        <View style={styles.section}>
          <Text style={styles.header}>Generell informasjon</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Tittel:</Text>
            <Text style={styles.value}>{sja.tittel}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Arbeidssted:</Text>
            <Text style={styles.value}>{sja.arbeidssted || 'Ikke angitt'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Beskrivelse:</Text>
            <Text style={styles.value}>{sja.beskrivelse || 'Ingen beskrivelse'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={getStatusBadgeStyle(sja.status)}>
              {statusLabels[sja.status as keyof typeof statusLabels]}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Startdato:</Text>
            <Text style={styles.value}>{formatDate(sja.startDato)}</Text>
          </View>
          {sja.sluttDato && (
            <View style={styles.row}>
              <Text style={styles.label}>Sluttdato:</Text>
              <Text style={styles.value}>{formatDate(sja.sluttDato)}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Deltakere:</Text>
            <Text style={styles.value}>{sja.deltakere || 'Ingen deltakere angitt'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Opprettet av:</Text>
            <Text style={styles.value}>{sja.opprettetAv?.name || 'Ukjent'}</Text>
          </View>
        </View>

        {/* Værdata og lokasjon */}
        {locationData && (
          <View style={styles.section}>
            <Text style={styles.header}>Lokasjon og værforhold</Text>
            <View style={styles.weatherBox}>
              <View style={styles.row}>
                <Text style={styles.label}>Lokasjon:</Text>
                <Text style={styles.value}>
                  {locationData.name || `${locationData.latitude}, ${locationData.longitude}`}
                </Text>
              </View>

              {locationData.weatherData && (
                <>
                  <Text style={styles.subHeader}>Værprognoser</Text>
                  <View style={styles.weatherGrid}>
                    {locationData.weatherData.forecasts && locationData.weatherData.forecasts.map((forecast: any, index: number) => (
                      <View key={index} style={styles.weatherItem}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold' }}>
                          {format(new Date(forecast.date), 'EE d. MMM', { locale: nb })}
                        </Text>
                        <Text style={{ fontSize: 9 }}>
                          Vær: {forecast.symbolCode.replace(/_/g, ' ')}
                        </Text>
                        <Text style={{ fontSize: 9 }}>
                          Temperatur: {forecast.minTemp}° til {forecast.maxTemp}°C
                        </Text>
                        <Text style={{ fontSize: 9 }}>
                          Vind: {forecast.maxWind} m/s
                        </Text>
                        <Text style={{ fontSize: 9 }}>
                          Nedbør: {forecast.totalPrecipitation} mm
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          </View>
        )}
        
        {/* Produkter */}
        <View style={styles.section}>
          <Text style={styles.header}>Produkter fra stoffkartotek</Text>
          {sja.produkter && sja.produkter.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableCell}>Produkt</Text>
                <Text style={styles.tableCell}>Produsent</Text>
                <Text style={styles.tableCell}>Mengde</Text>
                <Text style={styles.tableCell}>Faresymboler</Text>
              </View>
              
              {sja.produkter.map((produkt, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{produkt.produkt.produktnavn}</Text>
                  <Text style={styles.tableCell}>{produkt.produkt.produsent || 'Ikke spesifisert'}</Text>
                  <Text style={styles.tableCell}>{produkt.mengde || 'Ikke spesifisert'}</Text>
                  <Text style={styles.tableCell}>
                    {(produkt.produkt as any)?.fareSymboler?.map((fs: any) => fs.symbol).join(', ') || 'Ingen'}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text>Ingen produkter registrert</Text>
          )}
        </View>
        
        {/* Risikoer og tiltak */}
        <View style={styles.section}>
          <Text style={styles.header}>Identifiserte risikoer og tiltak</Text>
          {sja.risikoer && sja.risikoer.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableCell}>Aktivitet</Text>
                <Text style={styles.tableCell}>Fare</Text>
                <Text style={styles.smallCell}>S</Text>
                <Text style={styles.smallCell}>A</Text>
                <Text style={styles.smallCell}>R</Text>
                <Text style={styles.tableCell}>Nivå</Text>
              </View>
              
              {/* Legg til forklaringsrad */}
              <View style={{...styles.tableRow, backgroundColor: '#f5f5f5', paddingTop: 2, paddingBottom: 2}}>
                <Text style={{...styles.tableCell, fontSize: 8, fontStyle: 'italic'}}>
                  Aktivitet/oppgave
                </Text>
                <Text style={{...styles.tableCell, fontSize: 8, fontStyle: 'italic'}}>
                  Identifisert fare
                </Text>
                <Text style={{...styles.smallCell, fontSize: 8, fontStyle: 'italic'}}>
                  Sannsynlighet
                </Text>
                <Text style={{...styles.smallCell, fontSize: 8, fontStyle: 'italic'}}>
                  Alvorlighet
                </Text>
                <Text style={{...styles.smallCell, fontSize: 8, fontStyle: 'italic'}}>
                  Risikoverdi
                </Text>
                <Text style={{...styles.tableCell, fontSize: 8, fontStyle: 'italic'}}>
                  Risikonivå
                </Text>
              </View>
              
              {sja.risikoer.map((risiko, index) => {
                const { nivå, color } = getRisikoNivå(risiko.risikoVerdi);
                return (
                  <View key={index}>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableCell}>{risiko.aktivitet}</Text>
                      <Text style={styles.tableCell}>{risiko.fare}</Text>
                      <Text style={styles.smallCell}>{risiko.sannsynlighet}</Text>
                      <Text style={styles.smallCell}>{risiko.alvorlighet}</Text>
                      <Text style={styles.smallCell}>{risiko.risikoVerdi}</Text>
                      <Text style={{...styles.tableCell, color }}>{nivå}</Text>
                    </View>
                    {risiko.konsekvens && (
                      <View style={{...styles.tableRow, backgroundColor: '#f9fafb'}}>
                        <Text style={{...styles.tableCell, fontWeight: 'bold'}}>Konsekvens:</Text>
                        <View style={{...styles.tableCell, flex: 5}}>
                          <Text>{risiko.konsekvens}</Text>
                        </View>
                      </View>
                    )}
                    
                    {/* Vis tiltak knyttet til denne risikoen */}
                    {sja.tiltak?.filter((t) => t.risikoId === risiko.id).length > 0 && (
                      <View style={{...styles.tableRow, backgroundColor: '#f9fafb'}}>
                        <Text style={{...styles.tableCell, fontWeight: 'bold'}}>Tiltak:</Text>
                        <View style={{...styles.tableCell, flex: 5}}>
                          {sja.tiltak
                            .filter((t) => t.risikoId === risiko.id)
                            .map((t, i) => (
                              <Text key={i} style={{ fontSize: 9, marginBottom: 2 }}>
                                • {t.beskrivelse} (Ansvarlig: {t.ansvarlig}, Status: {t.status})
                              </Text>
                            ))}
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            <Text>Ingen risikoer registrert</Text>
          )}
          
          {/* Forklarende note under tabellen */}
          <View style={{marginTop: 10}}>
            <Text style={styles.note}>
              Risikoverdi beregnes ved å multiplisere Sannsynlighet (S) med Alvorlighet (A). 
              Risikonivå bestemmes ut fra følgende skala:
            </Text>
            <View style={{flexDirection: 'row', marginTop: 5, marginBottom: 5}}>
              <View style={{width: '33%'}}>
                <Text style={{...styles.note, color: '#10b981'}}>Lav risiko: 1-8</Text>
              </View>
              <View style={{width: '33%'}}>
                <Text style={{...styles.note, color: '#f59e0b'}}>Middels risiko: 9-15</Text>
              </View>
              <View style={{width: '33%'}}>
                <Text style={{...styles.note, color: '#ef4444'}}>Høy risiko: 16-25</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Tiltak uten tilknytning til spesifikk risiko */}
        {sja.tiltak && sja.tiltak.filter(t => !t.risikoId).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.header}>Generelle tiltak</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={{...styles.tableCell, flex: 2}}>Beskrivelse</Text>
                <Text style={styles.tableCell}>Ansvarlig</Text>
                <Text style={styles.tableCell}>Frist</Text>
                <Text style={styles.tableCell}>Status</Text>
              </View>
              
              {sja.tiltak.filter(t => !t.risikoId).map((tiltak, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={{...styles.tableCell, flex: 2}}>{tiltak.beskrivelse}</Text>
                  <Text style={styles.tableCell}>{tiltak.ansvarlig}</Text>
                  <Text style={styles.tableCell}>{tiltak.frist ? formatDate(tiltak.frist) : '-'}</Text>
                  <Text style={styles.tableCell}>{tiltak.status}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Vedlegg */}
        {Object.keys(signedAttachmentUrls).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.header}>Vedlegg</Text>
            <View style={styles.columnContainer}>
              {chunkArray(Object.entries(signedAttachmentUrls), Math.ceil(Object.keys(signedAttachmentUrls).length / 2)).map((chunk, colIndex) => (
                <View key={colIndex} style={styles.column}>
                  {chunk.map(([path, url], index) => {
                    const vedlegg = sja.vedlegg?.find(v => v.url === path.split('/').pop());
                    return (
                      <View key={index} style={styles.attachmentItem}>
                        <Text>• {vedlegg?.navn || `Vedlegg ${colIndex * chunk.length + index + 1}`}</Text>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Bilder */}
        {Object.keys(signedImageUrls).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.header}>Bilder</Text>
            {Object.entries(signedImageUrls).map(([bildePath, url], index) => {
              const bilde = sja.bilder?.find(b => {
                // Sikre at company ikke er null
                const companyId = sja.company?.id || '';
                return `companies/${companyId}/${b.url}` === bildePath;
              });
              
              return (
                <View key={index} style={styles.imageContainer}>
                  <Image src={url} style={styles.image} />
                  {bilde?.beskrivelse && (
                    <Text style={styles.imageCaption}>{bilde.beskrivelse}</Text>
                  )}
                </View>
              );
            })}
          </View>
        )}
        
        {/* Godkjenninger */}
        {sja.godkjenninger && sja.godkjenninger.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.header}>Godkjenninger</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableCell}>Godkjent av</Text>
                <Text style={styles.tableCell}>Rolle</Text>
                <Text style={styles.tableCell}>Dato</Text>
                <Text style={styles.tableCell}>Status</Text>
              </View>
              
              {sja.godkjenninger.map((godkjenning, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{godkjenning.godkjentAv.name}</Text>
                  <Text style={styles.tableCell}>{godkjenning.rolle}</Text>
                  <Text style={styles.tableCell}>{formatDate(godkjenning.godkjentDato)}</Text>
                  <Text style={styles.tableCell}>
                    {statusLabels[godkjenning.status as keyof typeof statusLabels]}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Footer */}
        <View style={styles.footer}>
          <Text>Sikker Jobb Analyse for {sja.tittel}</Text>
          <Text>Dokument generert: {new Date().toLocaleDateString('nb-NO')} - {sja.company?.name || 'Firma'}</Text>
        </View>
      </Page>
    </Document>
  );
};

// Helper for å generere signerte URL-er for bilder
async function getSignedImageUrls(sja: SJAWithRelations): Promise<Record<string, string>> {
  if (!sja.bilder || sja.bilder.length === 0) return {};
  
  // Sikre at company ikke er null
  const companyId = sja.company?.id || '';
  if (!companyId) return {};
  
  // Bygg bane-array for alle bilder
  const paths = sja.bilder.map(bilde => `companies/${companyId}/${bilde.url}`);
  
  try {
    // Hent signerte URL-er
    const response = await fetch(`/api/sja/${sja.id}/pdf-images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths })
    });

    if (!response.ok) return {};
    
    const { urls } = await response.json();
    
    // Konverter til record format path -> signedUrl
    return urls.reduce((acc: Record<string, string>, item: {path: string, signedUrl: string}) => {
      acc[item.path] = item.signedUrl;
      return acc;
    }, {});
  } catch (error) {
    console.error('Feil ved henting av signerte bildelenker:', error);
    return {};
  }
}

// Helper for å generere signerte URL-er for vedlegg
async function getSignedAttachmentUrls(sja: SJAWithRelations): Promise<Record<string, string>> {
  if (!sja.vedlegg || sja.vedlegg.length === 0) return {};
  
  try {
    // Hent signerte URL-er
    const response = await fetch(`/api/sja/${sja.id}/pdf-attachments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths: sja.vedlegg.map(v => v.url) })
    });

    if (!response.ok) return {};
    
    const { urls } = await response.json();
    
    // Konverter til record format path -> signedUrl
    return urls.reduce((acc: Record<string, string>, item: {path: string, signedUrl: string}) => {
      acc[item.path] = item.signedUrl;
      return acc;
    }, {});
  } catch (error) {
    console.error('Feil ved henting av signerte vedleggslenker:', error);
    return {};
  }
}

// Komponent for nedlasting av PDF
interface PDFDownloadButtonProps {
  sja: SJAWithRelations;
  signedImageUrls?: Record<string, string>;
  signedAttachmentUrls?: Record<string, string>;
  fileName?: string;
  buttonText?: string;
  className?: string;
}

const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({
  sja,
  signedImageUrls = {},
  signedAttachmentUrls = {},
  fileName = 'sja.pdf',
  buttonText = 'Last ned PDF',
  className
}) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      
      // Kall API-endepunktet for å generere PDF på server-siden
      const response = await fetch(`/api/sja/${sja.id}/pdf-download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrls: signedImageUrls,
          attachmentUrls: signedAttachmentUrls
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Kunne ikke generere PDF. Status: ${response.status}`);
      }
      
      // Last ned PDF-filen
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Opprett en midlertidig lenke og klikk på den for å laste ned
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Rydd opp
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Feil ved nedlasting av PDF:', error);
      alert('Kunne ikke laste ned PDF. Vennligst prøv igjen senere.');
    } finally {
      setIsLoading(false);
    }
  };

  // Stil for knappen
  const buttonStyle = {
    textDecoration: 'none',
    padding: '10px 16px',
    backgroundColor: '#0070f3',
    color: 'white',
    borderRadius: '4px',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    display: 'inline-block',
    fontSize: '14px',
    opacity: isLoading ? 0.7 : 1,
    ...(className ? {} : {})
  };

  return (
    <button 
      onClick={handleDownload} 
      disabled={isLoading}
      style={buttonStyle}
      className={className}
    >
      {isLoading ? 'Genererer PDF...' : buttonText}
    </button>
  );
};

// Eksporter også genererPDF funksjon for bakoverkompatibilitet
export async function generatePDF(sja: SJAWithRelations) {
  console.warn('generatePDF er avviklet, bruk SJAPDFDocument-komponenten med PDFDownloadLink i stedet.');
  return null;
}

export { SJAPDFDocument, getSignedImageUrls, getSignedAttachmentUrls, PDFDownloadButton }; 