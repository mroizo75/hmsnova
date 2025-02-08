"use client"

import { Control, UseFormSetValue, UseFormWatch } from "react-hook-form"
import { CheckpointType } from "@/types/safety-rounds"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Trash2, GripVertical } from "lucide-react"


interface SectionBuilderProps {
  control: Control<any>
  setValue: UseFormSetValue<any>
  watch: UseFormWatch<any>
}

export function SectionBuilder({ control, setValue, watch }: SectionBuilderProps) {
  const sections = watch("sections") || []

  const handleAddCheckpoint = (sectionIndex: number) => {
    const currentSection = sections[sectionIndex]
    setValue(`sections.${sectionIndex}.checkpoints`, [
      ...(currentSection.checkpoints || []),
      {
        question: "",
        description: "",
        type: CheckpointType.YES_NO,
        isRequired: true,
        order: currentSection.checkpoints?.length || 0,
        options: null
      }
    ])
  }

  const handleRemoveSection = (index: number) => {
    setValue(
      "sections",
      sections.filter((_: any, i: number) => i !== index)
    )
  }

  const handleRemoveCheckpoint = (sectionIndex: number, checkpointIndex: number) => {
    const newCheckpoints = sections[sectionIndex].checkpoints.filter(
      (_: any, i: number) => i !== checkpointIndex
    )
    setValue(`sections.${sectionIndex}.checkpoints`, newCheckpoints)
  }

  return (
    <div className="space-y-6">
      {sections.map((section: any, sectionIndex: number) => (
        <div
          key={sectionIndex}
          className="border rounded-lg p-4 space-y-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-4">
              <FormField
                control={control}
                name={`sections.${sectionIndex}.title`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seksjonstitel</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="F.eks. Brannsikkerhet" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`sections.${sectionIndex}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beskrivelse</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Beskriv denne seksjonen"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveSection(sectionIndex)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Sjekkpunkter</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddCheckpoint(sectionIndex)}
              >
                Legg til sjekkpunkt
              </Button>
            </div>

            {section.checkpoints?.map((checkpoint: any, checkpointIndex: number) => (
              <div
                key={checkpointIndex}
                className="border rounded p-4 space-y-4"
              >
                <div className="flex items-start gap-4">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1 space-y-4">
                    <FormField
                      control={control}
                      name={`sections.${sectionIndex}.checkpoints.${checkpointIndex}.question`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Spørsmål</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Skriv spørsmålet her" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={control}
                        name={`sections.${sectionIndex}.checkpoints.${checkpointIndex}.type`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value={CheckpointType.YES_NO}>
                                  Ja/Nei
                                </SelectItem>
                                <SelectItem value={CheckpointType.MULTIPLE_CHOICE}>
                                  Flervalg
                                </SelectItem>
                                <SelectItem value={CheckpointType.TEXT}>
                                  Tekst
                                </SelectItem>
                                <SelectItem value={CheckpointType.NUMBER}>
                                  Tall
                                </SelectItem>
                                <SelectItem value={CheckpointType.PHOTO}>
                                  Bilde
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name={`sections.${sectionIndex}.checkpoints.${checkpointIndex}.isRequired`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Obligatorisk</FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCheckpoint(sectionIndex, checkpointIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
} 