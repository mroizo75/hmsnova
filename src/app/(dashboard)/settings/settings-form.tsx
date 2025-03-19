"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { useSettings } from "@/hooks/use-settings"
import { useToast } from "@/components/ui/use-toast"

const settingsFormSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  colorMode: z.enum(["default", "protanopia", "deuteranopia", "tritanopia", "highContrast"]),
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  dailyDigest: z.boolean(),
  weeklyDigest: z.boolean(),
})

type SettingsFormValues = z.infer<typeof settingsFormSchema>

type ColorMode = 'default' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'highContrast';
type Theme = 'light' | 'dark';

interface SettingsFormProps {
  settings: {
    id: string;
    userId: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    dailyDigest: boolean;
    weeklyDigest: boolean;
    colorMode: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { settings: currentSettings, updateSettings } = useSettings()
  const { toast } = useToast()
  const [colorMode, setColorMode] = useState<ColorMode>(currentSettings.colorMode)
  const [isLoading, setIsLoading] = useState(false)
  
  useEffect(() => {
    // Oppdater HTML-elementet med riktig tema
    document.documentElement.classList.remove('dark', 'light')
    document.documentElement.classList.add(theme || 'light')

    // Oppdater HTML-elementet med riktig fargeblindhetsmodus
    document.documentElement.classList.remove('protanopia', 'deuteranopia', 'tritanopia', 'highContrast')
    if (colorMode !== 'default') {
      document.documentElement.classList.add(colorMode)
    }
  }, [theme, colorMode])

  const form = useForm<z.infer<typeof settingsFormSchema>>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      theme: (theme as "light" | "dark" | "system") || "system",
      colorMode: currentSettings.colorMode as "default" | "protanopia" | "deuteranopia" | "tritanopia" | "highContrast",
      emailNotifications: true,
      pushNotifications: true,
      dailyDigest: true,
      weeklyDigest: true,
    },
  })

  const onSubmit = async (data: z.infer<typeof settingsFormSchema>) => {
    try {
      setIsLoading(true)
      
      await updateSettings({
        theme: data.theme as "light" | "dark",
        colorMode: data.colorMode,
      })

      toast({
        title: "Innstillinger oppdatert",
        description: "Dine innstillinger har blitt lagret.",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke oppdatere innstillinger. Prøv igjen senere.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleThemeChange = (value: Theme) => {
    setTheme(value)
  }

  const handleColorModeChange = (value: ColorMode) => {
    form.setValue('colorMode', value)
    setColorMode(value)
  }

  const handleSave = async () => {
    try {
      await updateSettings({
        theme: theme as "light" | "dark",
        colorMode,
      })
      toast({
        title: "Innstillinger lagret",
        description: "Dine innstillinger er nå oppdatert.",
      })
    } catch (error) {
      toast({
        title: "Feil",
        description: "Kunne ikke lagre innstillingene. Prøv igjen senere.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6 w-full rounded-lg p-4">
      <Card>
        <CardHeader>
          <CardTitle>Utseende</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Tema</Label>
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Lys</SelectItem>
                    <SelectItem value="dark">Mørk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="colorMode">Fargeblindhetsmodus</Label>
                <Select value={colorMode} onValueChange={handleColorModeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Velg fargeblindhetsmodus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Standard</SelectItem>
                    <SelectItem value="protanopia">Protanopia</SelectItem>
                    <SelectItem value="deuteranopia">Deuteranopia</SelectItem>
                    <SelectItem value="tritanopia">Tritanopia</SelectItem>
                    <SelectItem value="highContrast">Høykontrast</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lagre utseende
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Varslingsinnstillinger</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">E-postvarsler</FormLabel>
                      <FormDescription>
                        Motta varsler på e-post når det skjer noe viktig
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pushNotifications"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Push-varsler</FormLabel>
                      <FormDescription>
                        Motta push-varsler i nettleseren
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dailyDigest"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Daglig oppsummering</FormLabel>
                      <FormDescription>
                        Motta en daglig oppsummering av aktiviteter
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weeklyDigest"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Ukentlig oppsummering</FormLabel>
                      <FormDescription>
                        Motta en ukentlig oppsummering av aktiviteter
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lagre varsler
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Button onClick={handleSave}>Lagre innstillinger</Button>
    </div>
  )
} 