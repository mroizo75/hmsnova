import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Readable } from 'stream';
import { Company, Risiko, Tiltak, SJAStatus } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Konstant for å bestemme når vi skal skifte side
const MIN_SPACE_BEFORE_NEW_PAGE = 130; // Piksler fra bunnen av siden

// Hjelpefunksjon for å formatere dato på norsk format
function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'Ikke angitt';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) return 'Ugyldig dato';
  
  return dateObj.toLocaleDateString('nb-NO');
}

// Funksjon for å finne riktig farge basert på risikoverdi
function getRiskColor(riskValue: number) {
  if (riskValue > 15) return rgb(0.94, 0.27, 0.27); // Rød (høy risiko)
  if (riskValue > 8) return rgb(0.96, 0.62, 0.04);  // Oransje (middels risiko)
  return rgb(0.06, 0.73, 0.51);                     // Grønn (lav risiko)
}

// Funksjon for å finne risiko-nivå tekst
function getRiskLevel(riskValue: number): string {
  if (riskValue > 15) return 'Høy';
  if (riskValue > 8) return 'Middels';
  return 'Lav';
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Autentisering
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Du må være logget inn' },
        { status: 401 }
      );
    }

    const id = params.id;
    const data = await req.json();
    const { imageUrls, attachmentUrls, sja } = data;

    // Hvis vi har SJA-data i request body, bruk det. Ellers hent fra databasen
    let sjaData = sja;
    if (!sjaData) {
      sjaData = await prisma.sJA.findUnique({
        where: { id },
        include: {
          risikoer: {
            include: {
              tiltak: true,
            },
          },
          tiltak: true,
          produkter: {
            include: {
              produkt: {
                include: {
                  fareSymboler: {
                    select: {
                      symbol: true
                    }
                  },
                  ppeSymboler: {
                    select: {
                      symbol: true
                    }
                  }
                }
              }
            },
          },
          vedlegg: true,
          opprettetAv: {
            select: {
              name: true,
              email: true,
            }
          }
        },
      });

      if (!sjaData) {
        return NextResponse.json(
          { error: 'SJA ikke funnet' },
          { status: 404 }
        );
      }
    }

    // Sjekk om brukeren tilhører samme firma som SJA-en
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { company: true },
    });

    if (user?.company.id !== sjaData.companyId) {
      return NextResponse.json(
        { error: 'Du har ikke tilgang til denne SJA-en' },
        { status: 403 }
      );
    }

    // Generer PDF
    const pdfDoc = await PDFDocument.create();
    const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    
    // Hjelpefunksjoner for å bygge PDF-en
    let currentPage = pdfDoc.addPage();
    let { width, height } = currentPage.getSize();
    const margin = 50;
    let currentY = height - margin;
    const lineHeight = 15;
    
    // Hjelpefunksjon for å sjekke sideskift
    function checkForPageBreak(spaceNeeded: number): void {
      if (currentY < margin + spaceNeeded) {
        currentPage = pdfDoc.addPage();
        currentY = height - margin;
      }
    }
    
    // Hjelpefunksjon for å legge til tekst
    function addText(text: string, size: number, isBold: boolean = false, indent: number = 0, color = rgb(0, 0, 0)): void {
      checkForPageBreak(size + 5);
      
      currentPage.drawText(text, {
        x: margin + indent,
        y: currentY,
        size: size,
        font: isBold ? timesBoldFont : timesFont,
        color: color,
        maxWidth: width - (2 * margin) - indent,
      });
      
      currentY -= (size + 5);
    }
    
    // Tittel og hovedinformasjon
    addText(`SJA: ${sjaData.tittel}`, 24, true);
    currentY -= 10;
    
    addText(`Opprettet dato: ${formatDate(sjaData.opprettetDato)}`, 12);
    addText(`Status: ${sjaData.status}`, 12);
    
    if (sjaData.arbeidssted) {
      addText(`Arbeidssted: ${sjaData.arbeidssted}`, 12);
    }
    
    if (sjaData.opprettetAv) {
      addText(`Opprettet av: ${sjaData.opprettetAv.name || sjaData.opprettetAv.email || 'Ukjent'}`, 12);
    }
    
    if (sjaData.beskrivelse) {
      currentY -= 10;
      addText('Beskrivelse:', 16, true);
      
      // Tekstwrapping for lang beskrivelse
      const words = sjaData.beskrivelse.split(' ');
      let line = '';
      const maxLineWidth = 80;
      
      for (const word of words) {
        if ((line + word).length > maxLineWidth) {
          addText(line, 12);
          line = word + ' ';
        } else {
          line += word + ' ';
        }
      }
      
      if (line) {
        addText(line, 12);
      }
    }
    
    // Værdata
    if (sjaData.location) {
      currentY -= 15;
      addText('Værdata og lokasjon:', 16, true);
      
      try {
        const locationData = JSON.parse(sjaData.location);
        
        // Vis lokasjon
        if (locationData.name) {
          addText(`Sted: ${locationData.name}`, 14);
        } else if (locationData.latitude && locationData.longitude) {
          addText(`Koordinater: ${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}`, 14);
        }
        
        // Vis værinformasjon
        if (locationData.weatherData && locationData.weatherData.forecasts && locationData.weatherData.forecasts.length > 0) {
          currentY -= 10;
          
          // Legg til informasjon om at dette er historisk data
          addText('Værdata fra opprettelsesdato:', 12, true);
          currentY -= 5;
          
          locationData.weatherData.forecasts.forEach((forecast: any, index: number) => {
            checkForPageBreak(80);  // Sikre nok plass til værprognosen
            
            // Dato og dag
            const dayText = forecast.day ? forecast.day : '';
            const dateText = forecast.date ? formatDate(new Date(forecast.date)) : '';
            addText(`${dayText} ${dateText}:`, 14, true);
            
            // Værtype
            if (forecast.symbolCode) {
              addText(`Vær: ${forecast.symbolCode.replace(/_/g, ' ')}`, 12, false, 10);
            }
            
            // Temperatur
            if (forecast.minTemp !== undefined && forecast.maxTemp !== undefined) {
              addText(`Temperatur: ${forecast.minTemp}° til ${forecast.maxTemp}°C`, 12, false, 10);
            }
            
            // Vind
            if (forecast.maxWind !== undefined) {
              addText(`Vind: ${forecast.maxWind} m/s`, 12, false, 10);
            }
            
            // Nedbør
            if (forecast.totalPrecipitation !== undefined) {
              addText(`Nedbør: ${forecast.totalPrecipitation} mm`, 12, false, 10);
            }
            
            // Risikonivå
            if (forecast.riskLevel) {
              addText(`Risikonivå: ${forecast.riskLevel}`, 12, false, 10);
            }
            
            currentY -= 5; // Litt ekstra mellomrom mellom prognoser
          });
          
          // Tidspunkt og kilde
          if (locationData.weatherData.timestamp) {
            const timestamp = new Date(locationData.weatherData.timestamp);
            if (!isNaN(timestamp.getTime())) {
              addText(`Værdata hentet: ${formatDate(timestamp)} ${timestamp.toLocaleTimeString('nb-NO')}`, 10);
            }
          }
          
          if (locationData.weatherData.source) {
            addText(`Kilde: ${locationData.weatherData.source}`, 10);
          }
        } else if (locationData.weatherData && locationData.weatherData.properties?.timeseries) {
          // Hvis vi har rå værdata fra MET API
          const timeseries = locationData.weatherData.properties.timeseries;
          const dailyData = new Map();
          
          // Legg til informasjon om at dette er historisk data
          addText('Værdata fra opprettelsesdato:', 12, true);
          currentY -= 5;
          
          // Gruppere etter dato
          timeseries.forEach((item: any) => {
            const date = new Date(item.time);
            const dateKey = date.toISOString().split('T')[0];
            
            if (!dailyData.has(dateKey)) {
              dailyData.set(dateKey, {
                date,
                day: date.toLocaleDateString('nb-NO', { weekday: 'long' }),
                temperatures: [],
                winds: [],
                precipitations: [],
                symbolCode: item.data.next_1_hours?.summary?.symbol_code || 'clearsky_day'
              });
            }
            
            const dayData = dailyData.get(dateKey);
            dayData.temperatures.push(item.data.instant.details.air_temperature);
            dayData.winds.push(item.data.instant.details.wind_speed);
            
            if (item.data.next_1_hours) {
              dayData.precipitations.push(item.data.next_1_hours.details.precipitation_amount);
            } else if (item.data.next_6_hours) {
              dayData.precipitations.push(item.data.next_6_hours.details.precipitation_amount / 6);
            }
          });
          
          // Vis daglige prognoser
          Array.from(dailyData.values()).slice(0, 3).forEach(dayData => {
            checkForPageBreak(80);
            
            addText(`${dayData.day} ${formatDate(dayData.date)}:`, 14, true);
            
            // Værtype
            addText(`Vær: ${dayData.symbolCode.replace(/_/g, ' ')}`, 12, false, 10);
            
            // Temperatur
            const maxTemp = Math.max(...dayData.temperatures);
            const minTemp = Math.min(...dayData.temperatures);
            addText(`Temperatur: ${minTemp.toFixed(1)}° til ${maxTemp.toFixed(1)}°C`, 12, false, 10);
            
            // Vind
            const maxWind = Math.max(...dayData.winds);
            addText(`Vind: ${maxWind.toFixed(1)} m/s`, 12, false, 10);
            
            // Nedbør
            const totalPrecipitation = dayData.precipitations.reduce((a: number, b: number) => a + b, 0);
            addText(`Nedbør: ${totalPrecipitation.toFixed(1)} mm`, 12, false, 10);
            
            // Risikonivå
            let riskLevel = 'Lav';
            if (maxWind > 15 || totalPrecipitation > 5 || minTemp < -10 || maxTemp > 30) {
              riskLevel = 'Høy';
            } else if (maxWind > 8 || totalPrecipitation > 1 || minTemp < 0 || maxTemp > 25) {
              riskLevel = 'Middels';
            }
            addText(`Risikonivå: ${riskLevel}`, 12, false, 10);
            
            currentY -= 5;
          });
          
          // Tidspunkt og kilde
          if (locationData.weatherData._metadata?.timestamp) {
            const timestamp = new Date(locationData.weatherData._metadata.timestamp);
            if (!isNaN(timestamp.getTime())) {
              addText(`Værdata hentet: ${formatDate(timestamp)} ${timestamp.toLocaleTimeString('nb-NO')}`, 10);
            }
          }
          
          if (locationData.weatherData._metadata?.source) {
            addText(`Kilde: ${locationData.weatherData._metadata.source}`, 10);
          }
        }
      } catch (e) {
        console.error('Feil ved parsing av værdata:', e);
        addText('Kunne ikke vise værdata', 12, false, 0, rgb(1, 0, 0));
      }
    }
    
    // Risikoer og tiltak
    if (sjaData.risikoer && sjaData.risikoer.length > 0) {
      currentY -= 20;
      checkForPageBreak(100);
      
      addText('Risikoer og tiltak:', 18, true);
      currentY -= 5;
      
      // Forklaringstekst
      addText('Risikonivå beregnes som: Sannsynlighet (S) × Alvorlighet (A) = Risikoverdi (R)', 12);
      addText('Lav risiko: 1-8 | Middels risiko: 9-15 | Høy risiko: 16-25', 12);
      currentY -= 10;
      
      // Vis hver risiko
      sjaData.risikoer.forEach((risiko: any, index: number) => {
        checkForPageBreak(100);
        
        // Risikooverskrift
        addText(`${index + 1}. ${risiko.aktivitet}: ${risiko.fare}`, 14, true);
        
        // Beregne risikoverdi
        const sannsynlighet = risiko.sannsynlighet || 1;
        const alvorlighet = risiko.alvorlighet || 1;
        const risikoVerdi = risiko.risikoVerdi || (sannsynlighet * alvorlighet);
        const risikoNivå = getRiskLevel(risikoVerdi);
        const risikoFarge = getRiskColor(risikoVerdi);
        
        // Vis risikodetaljer
        addText(`Sannsynlighet: ${sannsynlighet} × Alvorlighet: ${alvorlighet} = Risikoverdi: ${risikoVerdi}`, 12, false, 10);
        
        // Vis risikonivå med farge
        currentPage.drawText(`Risikonivå: ${risikoNivå}`, {
          x: margin + 10,
          y: currentY,
          size: 12,
          font: timesBoldFont,
          color: risikoFarge,
        });
        currentY -= 20;
        
        // Konsekvens
        if (risiko.konsekvens) {
          addText(`Konsekvens: ${risiko.konsekvens}`, 12, false, 10);
        }
        
        // Tiltak for denne risikoen
        if (risiko.tiltak && risiko.tiltak.length > 0) {
          addText('Tiltak for denne risikoen:', 12, true, 10);
          
          risiko.tiltak.forEach((tiltak: any, tIndex: number) => {
            checkForPageBreak(30);
            
            addText(`• ${tiltak.beskrivelse}`, 12, false, 20);
            
            // Tiltak-detaljer
            let tiltakInfo = `Ansvarlig: ${tiltak.ansvarlig}, Status: ${tiltak.status}`;
            if (tiltak.frist) {
              tiltakInfo += `, Frist: ${formatDate(tiltak.frist)}`;
            }
            
            addText(tiltakInfo, 10, false, 20);
          });
        }
        
        currentY -= 10; // Ekstra mellomrom mellom risikoer
      });
    }
    
    // Generelle tiltak (ikke knyttet til en risiko)
    if (sjaData.tiltak && sjaData.tiltak.length > 0) {
      const generelleTiltak = sjaData.tiltak.filter((tiltak: any) => !tiltak.risikoId);
      
      if (generelleTiltak.length > 0) {
        currentY -= 20;
        checkForPageBreak(50);
        
        addText('Generelle tiltak:', 18, true);
        
        generelleTiltak.forEach((tiltak: any, index: number) => {
          checkForPageBreak(40);
          
          addText(`${index + 1}. ${tiltak.beskrivelse}`, 14);
          
          // Tiltak-detaljer
          let tiltakInfo = `Ansvarlig: ${tiltak.ansvarlig}, Status: ${tiltak.status}`;
          if (tiltak.frist) {
            tiltakInfo += `, Frist: ${formatDate(tiltak.frist)}`;
          }
          
          addText(tiltakInfo, 12, false, 10);
          currentY -= 5;
        });
      }
    }
    
    // Produkter
    if (sjaData.produkter && sjaData.produkter.length > 0) {
      currentY -= 20;
      checkForPageBreak(50);
      
      addText('Produkter fra stoffkartotek:', 18, true);
      
      // Gjør produktvisningen asynkron
      for (const produkt of sjaData.produkter) {
        if (!produkt.produkt) continue;
        
        checkForPageBreak(100);
        
        // Produktnavn og produsent
        addText(`${sjaData.produkter.indexOf(produkt) + 1}. ${produkt.produkt.produktnavn || 'Ukjent produkt'}`, 14, true);
        if (produkt.produkt.produsent) {
          addText(`Produsent: ${produkt.produkt.produsent}`, 12, false, 10);
        }
        
        // Beskrivelse
        if (produkt.produkt.beskrivelse) {
          addText(`Beskrivelse: ${produkt.produkt.beskrivelse}`, 12, false, 10);
        }
        
        // Faresymboler
        if (produkt.produkt.fareSymboler && produkt.produkt.fareSymboler.length > 0) {
          addText('Faresymboler:', 12, false, 10);
          let iconX = margin + 10;
          const iconSize = 20;
          const iconSpacing = 25;
          
          for (const symbol of produkt.produkt.fareSymboler) {
            // Konverter symbol til riktig filnavn
            let iconPath = '';
            switch (symbol.symbol.toLowerCase()) {
              case 'helsefare':
                iconPath = '/faremerker/helserisiko.webp';
                break;
              case 'etsende':
                iconPath = '/faremerker/etsende.webp';
                break;
              case 'kronisk_helsefarlig':
                iconPath = '/faremerker/kronisk_helsefarlig.webp';
                break;
              case 'eksplosiv':
                iconPath = '/faremerker/explosive.webp';
                break;
              case 'oksiderende':
                iconPath = '/faremerker/oksiderende.webp';
                break;
              case 'brannfarlig':
                iconPath = '/faremerker/brannfarlig.webp';
                break;
              case 'giftig':
                iconPath = '/faremerker/giftig.webp';
                break;
              case 'miljofare':
                iconPath = '/faremerker/miljofare.webp';
                break;
              case 'gass_under_trykk':
                iconPath = '/faremerker/gass_under_trykk.webp';
                break;
              default:
                console.error(`Ukjent faresymbol: ${symbol.symbol}`);
                continue;
            }

            try {
              const iconBytes = await fs.promises.readFile(path.join(process.cwd(), 'public', iconPath));
              // Konverter WebP til PNG ved å bruke sharp
              const sharp = require('sharp');
              const pngBuffer = await sharp(iconBytes).png().toBuffer();
              const iconImage = await pdfDoc.embedPng(pngBuffer);
              
              // Sjekk om vi trenger ny linje
              if (iconX + iconSize > width - margin) {
                currentY -= iconSize + 5;
                iconX = margin + 10;
              }
              
              currentPage.drawImage(iconImage, {
                x: iconX,
                y: currentY - iconSize,
                width: iconSize,
                height: iconSize,
              });
              
              iconX += iconSpacing;
            } catch (error) {
              console.error(`Kunne ikke laste ikon: ${iconPath}`, error);
            }
          }
          currentY -= iconSize + 10;
        }
        
        // Verneutstyr
        if (produkt.produkt.ppeSymboler && produkt.produkt.ppeSymboler.length > 0) {
          addText('Verneutstyr:', 12, false, 10);
          let iconX = margin + 10;
          const iconSize = 20;
          const iconSpacing = 25;
          
          for (const symbol of produkt.produkt.ppeSymboler) {
            // Konverter symbol til riktig filnavn
            let iconPath = '';
            const symbolCode = symbol.symbol.split('_')[0]; // Hent M-koden (f.eks. M004)
            
            if (symbolCode.startsWith('M')) {
              iconPath = `/ppe/ISO_7010_${symbolCode}.svg.png`;
            } else {
              console.error(`Ugyldig PPE-symbol format: ${symbol.symbol}`);
              continue;
            }
            
            try {
              const iconBytes = await fs.promises.readFile(path.join(process.cwd(), 'public', iconPath));
              const iconImage = await pdfDoc.embedPng(iconBytes);
              
              // Sjekk om vi trenger ny linje
              if (iconX + iconSize > width - margin) {
                currentY -= iconSize + 5;
                iconX = margin + 10;
              }
              
              currentPage.drawImage(iconImage, {
                x: iconX,
                y: currentY - iconSize,
                width: iconSize,
                height: iconSize,
              });
              
              iconX += iconSpacing;
            } catch (error) {
              console.error(`Kunne ikke laste ikon: ${iconPath}`, error);
            }
          }
          currentY -= iconSize + 10;
        }

        // Fareklasse og UN-nummer
        if (produkt.produkt.fareklasse) {
          addText(`Fareklasse: ${produkt.produkt.fareklasse}`, 12, false, 10);
        }
        if (produkt.produkt.unNummer) {
          addText(`UN-nummer: ${produkt.produkt.unNummer}`, 12, false, 10);
        }
        
        currentY -= 10;
      }
    }
    
    // Sidefot på hver side
    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();
      
      // Linje
      page.drawLine({
        start: { x: margin, y: margin / 2 + 10 },
        end: { x: width - margin, y: margin / 2 + 10 },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8),
      });
      
      // Sidenummer
      page.drawText(`Side ${i + 1} av ${pdfDoc.getPageCount()}`, {
        x: width - margin - 80,
        y: margin / 2 - 5,
        size: 9,
        font: timesFont,
        color: rgb(0.5, 0.5, 0.5),
      });
      
      // Dokumentinfo
      page.drawText(`SJA: ${sjaData.tittel} - Generert: ${formatDate(new Date())}`, {
        x: margin,
        y: margin / 2 - 5,
        size: 9,
        font: timesFont,
        color: rgb(0.5, 0.5, 0.5),
      });
    }
    
    // Konverter til buffer og send som respons
    const pdfBytes = await pdfDoc.save();
    
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="SJA-${sjaData.tittel.replace(/\s+/g, '_')}.pdf"`,
      },
    });

  } catch (error: any) {
    console.error('Feil ved generering av PDF:', error);
    return NextResponse.json(
      { error: 'Kunne ikke generere PDF: ' + error.message },
      { status: 500 }
    );
  }
} 