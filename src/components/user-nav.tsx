"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { User, Settings, LogOut } from "lucide-react"

export function UserNav() {
  const { data: session } = useSession()
  const router = useRouter()

  if (!session?.user) {
    return (
      <Button variant="ghost" onClick={() => router.push("/login")}>
        Logg inn
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
            <AvatarFallback>{session.user.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{session.user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/profile")}>
            <User className="mr-2 h-4 w-4" />
            <span>Min profil</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Innstillinger</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={() => {
            // DEBUGGING: Se på hva som finnes i localStorage før noe skjer
            console.log("============== COOKIE CONSENT DEBUGGING ==============");
            console.log("localStorage innhold før utlogging:");
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              try {
                const value = localStorage.getItem(key || "");
                console.log(`${key}: ${value ? value.substring(0, 50) + (value.length > 50 ? '...' : '') : 'null'}`);
              } catch (e) {
                console.log(`${key}: [Feil ved lesing]`);
              }
            }
            
            // Sjekk alle cookies også
            console.log("Alle cookies før utlogging:");
            document.cookie.split(';').forEach(cookie => {
              console.log(cookie.trim());
            });
            
            // Lagre cookie-innstillinger FØR vi starter utlogging
            const cookieConsentValue = localStorage.getItem('cookieConsent');
            console.log("cookieConsent verdi fra localStorage:", cookieConsentValue);
            
            // Lagre også lokalt direkte som cookie
            if (cookieConsentValue) {
              const expiryDate = new Date();
              expiryDate.setFullYear(expiryDate.getFullYear() + 1);
              document.cookie = `cookieConsent=${encodeURIComponent(cookieConsentValue)};expires=${expiryDate.toUTCString()};path=/;SameSite=Lax`;
              console.log("Lagret cookieConsent direkte som cookie");
            }
            
            // Utfør signOut først med forced URL-refresh
            signOut({ 
              callbackUrl: '/',
              redirect: false
            }).then(() => {
              // Rens opp alle auth-cookies (kun spesifikke)
              const authCookies = [
                'next-auth.session-token',
                'next-auth.callback-url',
                'next-auth.csrf-token',
                '__Secure-next-auth.session-token',
                '__Secure-next-auth.callback-url',
                '__Secure-next-auth.csrf-token',
                '__Host-next-auth.csrf-token',
                'next-auth.pkce.code_verifier',
                '__Secure-next-auth.pkce.code_verifier'
              ];
              
              // Loop gjennom alle cookies og slett bare de som er i listen
              const cookies = document.cookie.split(";");
              console.log("Cookies etter signOut, før sletting:");
              cookies.forEach(cookie => console.log(cookie.trim()));
              
              cookies.forEach(cookie => {
                const eqPos = cookie.indexOf("=");
                const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
                
                if (authCookies.includes(name)) {
                  // Forsøk å slette cookien med forskjellige path/domain kombinasjoner
                  document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
                  document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=;";
                  document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;SameSite=Lax;path=/;";
                  console.log(`Slettet auth cookie: ${name}`);
                }
              });
              
              console.log("Cookies etter sletting:");
              document.cookie.split(';').forEach(cookie => {
                console.log(cookie.trim());
              });
              
              // Rens BARE auth-data fra localStorage, ingenting annet
              ['next-auth.message', 'next-auth.callback-url', 'next-auth.csrf-token', 'next-auth.state'].forEach(key => {
                localStorage.removeItem(key);
                console.log(`Fjernet fra localStorage: ${key}`);
              });
              
              // Sørg for at cookie-samtykke er bevart
              if (cookieConsentValue) {
                localStorage.setItem('cookieConsent', cookieConsentValue);
                console.log("Gjenopprettet cookie-samtykke i localStorage:", cookieConsentValue);
                
                // Også gjenopprett som cookie
                const expiryDate = new Date();
                expiryDate.setFullYear(expiryDate.getFullYear() + 1);
                document.cookie = `cookieConsent=${encodeURIComponent(cookieConsentValue)};expires=${expiryDate.toUTCString()};path=/;SameSite=Lax`;
                console.log("Gjenopprettet cookie-samtykke som cookie");
              }
              
              // DEBUGGING: Sjekk hva som finnes i localStorage etter all sletting
              console.log("localStorage innhold ETTER sletting og gjenoppretting:");
              for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                try {
                  const value = localStorage.getItem(key || "");
                  console.log(`${key}: ${value ? value.substring(0, 50) + (value.length > 50 ? '...' : '') : 'null'}`);
                } catch (e) {
                  console.log(`${key}: [Feil ved lesing]`);
                }
              }
              
              // Sjekk cookies etter gjenoppretting
              console.log("Cookies etter gjenoppretting:");
              document.cookie.split(';').forEach(cookie => {
                console.log(cookie.trim());
              });
              
              // Redirect til forsiden med ekstra parametre for debugging
              const redirectUrl = `/?logout=complete&cookieStatus=${cookieConsentValue ? 'preserved' : 'none'}&t=${Date.now()}`;
              console.log("Omdirigering klar til:", redirectUrl);
              
              // Behold både redirect via form og localStorage/cookies
              if (cookieConsentValue) {
                console.log("Lagrer cookie-samtykke via POST til server");
                
                // Opprett et skjult form for å poste data til serveren
                const form = document.createElement('form');
                form.method = 'POST'; 
                form.action = '/api/preserve-cookie-consent';
                form.style.display = 'none';
                
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = 'consentData';
                input.value = cookieConsentValue;
                
                form.appendChild(input);
                document.body.appendChild(form);
                
                // Send form - API-ens redirect vil håndtere navigasjonen
                form.submit();
                
                // Ikke gjør window.location.replace siden API-responsens 
                // redirect vil håndtere omdirigering
              } else {
                // Ingen cookie-samtykke å bevare, gjør direkte redirect
                console.log("Ingen cookie-samtykke å lagre, omdirigerer direkte");
                window.location.replace(redirectUrl);
              }
            });
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logg ut</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 