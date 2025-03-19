"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Company } from "./columns"
import { Card } from "@/components/ui/card"
import { PlusCircle, User, Mail, Phone, Trash2, Edit, UserPlus } from "lucide-react"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

export interface CustomerContactDialogProps {
  company: Company | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateContact?: (companyId: string, primaryContact: string, primaryEmail: string) => void
}

// Definer kontaktperson-typen
interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  position?: string
  isPrimary: boolean
  notes?: string
  companyId: string
}

const formSchema = z.object({
  firstName: z.string().min(1, "Fornavn er påkrevd"),
  lastName: z.string().min(1, "Etternavn er påkrevd"),
  email: z.string().email("Ugyldig e-postadresse"),
  phone: z.string().optional(),
  position: z.string().optional(),
  isPrimary: z.boolean().default(false),
  notes: z.string().optional()
})

export function CustomerContactDialog({
  company,
  open,
  onOpenChange,
  onUpdateContact
}: CustomerContactDialogProps) {
  // Bruk kontakter fra company-objektet i stedet for dummydata
  const [contacts, setContacts] = useState<Contact[]>(company?.contacts || [])
  const [isAddingContact, setIsAddingContact] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      position: "",
      isPrimary: false,
      notes: ""
    }
  })

  // Oppdater kontaktene når company endres
  useEffect(() => {
    if (company?.contacts) {
      setContacts(company.contacts);
    }
  }, [company?.contacts]);

  if (!company) return null

  // Lagre kontakt til databasen
  const saveContactToDatabase = async (contact: Contact, companyId: string) => {
    setIsLoading(true);
    try {
      // Sjekk om dette er en ny kontakt eller en eksisterende
      const isNewContact = !contact.id || contact.id.includes('new-') || /^\d+$/.test(contact.id);
      
      // For nye kontakter, fjern id-feltet slik at databasen kan generere en
      const contactData = isNewContact 
        ? { ...contact, id: undefined } 
        : contact;
      
      console.log(`${isNewContact ? 'Oppretter' : 'Oppdaterer'} kontakt:`, contactData);
      
      // Bruk passende endepunkt: collections for nye, spesifikt contactId for eksisterende
      const endpoint = isNewContact 
        ? `/api/companies/${companyId}/contacts` 
        : `/api/companies/${companyId}/contacts/${contact.id}`;
        
      const method = isNewContact ? 'POST' : 'PATCH';
      
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Ukjent feil' }));
        throw new Error(errorData.message || 'Feil ved lagring av kontakt');
      }

      const data = await response.json();
      toast.success(isNewContact ? 'Kontakt lagt til' : 'Kontakt oppdatert');
      return data;
    } catch (error) {
      console.error('Feil ved lagring av kontakt:', error);
      toast.error('Kunne ikke lagre kontakten');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Slett kontakt fra databasen
  const deleteContactFromDatabase = async (contactId: string, companyId: string) => {
    setIsLoading(true);
    try {
      // Bruk det nye endepunktet for spesifikke kontakter
      const response = await fetch(`/api/companies/${companyId}/contacts/${contactId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Ukjent feil' }));
        throw new Error(errorData.message || 'Feil ved sletting av kontakt');
      }

      toast.success('Kontakt slettet');
    } catch (error) {
      console.error('Feil ved sletting av kontakt:', error);
      toast.error('Kunne ikke slette kontakten');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (editingContact) {
        // Oppdater eksisterende kontakt
        const updatedContact = { ...editingContact, ...values };
        
        // Hvis denne kontakten settes som primær, fjern primær status fra andre
        if (values.isPrimary) {
          // Oppdater UI først
          const updatedContacts = contacts.map(c => 
            c.id === editingContact.id ? updatedContact : 
            { ...c, isPrimary: false }
          );
          setContacts(updatedContacts);
          
          // Oppdater i databasen
          const savedContact = await saveContactToDatabase(updatedContact, company.id);
          
          // Oppdater kontaktlisten med den lagrede kontakten som kommer tilbake fra serveren
          setContacts(prevContacts => 
            prevContacts.map(c => c.id === editingContact.id ? savedContact : c)
          );
          
          // Oppdater bedriftens primærkontakt
          if (onUpdateContact) {
            onUpdateContact(
              company.id, 
              `${values.firstName} ${values.lastName}`, 
              values.email
            );
          }
        } else {
          // Bare oppdater denne kontakten
          const updatedContacts = contacts.map(c => 
            c.id === editingContact.id ? updatedContact : c
          );
          setContacts(updatedContacts);
          
          // Lagre til database
          const savedContact = await saveContactToDatabase(updatedContact, company.id);
          
          // Oppdater kontaktlisten med den lagrede kontakten
          setContacts(prevContacts => 
            prevContacts.map(c => c.id === editingContact.id ? savedContact : c)
          );
        }
        
        setEditingContact(null);
      } else {
        // Legg til ny kontakt - bruk 'new-' prefix for midlertidig ID
        const newContact: Contact = {
          ...values,
          id: `new-${Date.now()}`, // Midlertidig ID som vil erstattes
          companyId: company.id
        };
        
        // Legg til i UI først
        const newContactsList = values.isPrimary
          ? [...contacts.map(c => ({ ...c, isPrimary: false })), newContact]
          : [...contacts, newContact];
        
        setContacts(newContactsList);
        
        // Lagre til database
        const savedContact = await saveContactToDatabase(newContact, company.id);
        
        // Oppdater kontaktlisten med den faktiske kontakten fra serveren
        setContacts(prevContacts => 
          prevContacts.map(c => c.id === newContact.id ? savedContact : c)
        );
        
        // Hvis primærkontakt, oppdater bedriften
        if (values.isPrimary && onUpdateContact) {
          onUpdateContact(
            company.id, 
            `${values.firstName} ${values.lastName}`, 
            values.email
          );
        }
      }
      
      setIsAddingContact(false);
      form.reset();
    } catch (error) {
      console.error("Feil ved håndtering av kontakt:", error);
      toast.error("Kunne ikke lagre kontakten");
    }
  };

  const deleteContact = async (id: string) => {
    try {
      // Oppdater UI først
      setContacts(contacts.filter(c => c.id !== id));
      
      // Deretter slett fra database
      await deleteContactFromDatabase(id, company.id);
    } catch (error) {
      // Hvis det feiler, hent kontaktene på nytt
      console.error("Feil ved sletting av kontakt:", error);
      if (company?.contacts) {
        setContacts(company.contacts);
      }
    }
  };

  const editContact = (contact: Contact) => {
    form.reset({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone || "",
      position: contact.position || "",
      isPrimary: contact.isPrimary,
      notes: contact.notes || ""
    });
    setEditingContact(contact);
    setIsAddingContact(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-2xl lg:max-w-3xl w-full p-4 md:p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5" />
            Kontaktpersoner for {company.name}
          </DialogTitle>
          <DialogDescription>
            Administrer kontaktpersoner og kommunikasjonskanaler
          </DialogDescription>
        </DialogHeader>

        {!isAddingContact ? (
          <>
            <div className="grid grid-cols-1 gap-3">
              {contacts.map(contact => (
                <Card key={contact.id} className="p-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <div className="font-medium flex flex-wrap items-center gap-1">
                          {contact.firstName} {contact.lastName}
                          {contact.isPrimary && (
                            <span className="ml-1 inline-flex items-center rounded-full bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700">
                              Primær
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{contact.position}</div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => editContact(contact)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteContact(contact.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                    <div className="flex items-center text-sm">
                      <Mail className="mr-2 h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                    {contact.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="mr-2 h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        {contact.phone}
                      </div>
                    )}
                  </div>
                  
                  {contact.notes && (
                    <div className="mt-2 rounded bg-muted/50 p-2 text-xs text-muted-foreground">
                      {contact.notes}
                    </div>
                  )}
                </Card>
              ))}
              
              <Button 
                className="w-full" 
                variant="outline"
                size="sm"
                onClick={() => setIsAddingContact(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Legg til kontaktperson
              </Button>
            </div>
          </>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fornavn</FormLabel>
                      <FormControl>
                        <Input placeholder="Fornavn" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Etternavn</FormLabel>
                      <FormControl>
                        <Input placeholder="Etternavn" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-post</FormLabel>
                      <FormControl>
                        <Input placeholder="E-post" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefon</FormLabel>
                      <FormControl>
                        <Input placeholder="Telefon" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stilling</FormLabel>
                    <FormControl>
                      <Input placeholder="Stilling" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notater</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Skriv notater om kontaktpersonen her..." 
                        {...field} 
                        className="resize-none h-20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isPrimary"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Primær kontaktperson</FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Marker som hovedkontakt for denne bedriften
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddingContact(false)
                    setEditingContact(null)
                    form.reset()
                  }}
                >
                  Avbryt
                </Button>
                <Button type="submit" size="sm">
                  {editingContact ? "Oppdater kontakt" : "Legg til kontakt"}
                </Button>
              </div>
            </form>
          </Form>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Lukk
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 